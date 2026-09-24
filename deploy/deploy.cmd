@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  DEPLOY - Plataforma de Gestao de Operacoes DSIC
REM  Uso:  deploy\deploy.cmd                 (so atualiza se houver versao nova)
REM        deploy\deploy.cmd force           (recompila e reinicia mesmo sem alteracoes)
REM        deploy\deploy.cmd force nopause   (sem pausas, ex.: tarefa agendada)
REM
REM  Antes de mexer na base de dados faz SEMPRE uma copia de seguranca
REM  (BD + .env + versao anterior) para a pasta BACKUP_PASTA do .env (por omissao: backups\).
REM ============================================================

REM O cmd le os .cmd linha a linha durante a execucao: como o "git pull" pode alterar este
REM ficheiro, o deploy corre sempre a partir de uma copia temporaria de si proprio.
if /i not "%~1"=="__copia" (
    copy /y "%~f0" "%TEMP%\operacoes_dsic_deploy.cmd" >nul
    "%TEMP%\operacoes_dsic_deploy.cmd" __copia "%~dp0.." %*
)
set "APP_DIR=%~f2"
set "SVC_APP=operacoesdsic.exe"
set "SVC_WORKER=operacoesdsicworker.exe"
set "FORCE=0"
set "NOPAUSE=0"
for %%a in (%*) do (
    if /i "%%a"=="force" set "FORCE=1"
    if /i "%%a"=="nopause" set "NOPAUSE=1"
)

cd /d "%APP_DIR%"

echo ========================================
echo   DEPLOY - Operacoes DSIC
echo   %date% %time%
echo ========================================
echo.

REM A rede da Camara interfere com o SSL: git com o SSL do Windows, Node com os certificados do Windows
git config http.sslBackend schannel >nul 2>&1
REM (so em versoes do Node que aceitam a opcao em NODE_OPTIONS; nas outras fica sem ela)
set "NODE_OPTIONS=--use-system-ca"
node -e "0" >nul 2>&1 || set "NODE_OPTIONS="

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set "NODE_MAJOR=%%v"
for /f %%v in ('node -v') do echo Node: %%v
if !NODE_MAJOR! LSS 24 (
    echo ERRO: a plataforma precisa do Node 24 LTS ou superior. Instale-o: winget install OpenJS.NodeJS.LTS
    goto :erro
)

net session >nul 2>&1 || (
    echo ERRO: correr como administrador ^(e preciso para parar e iniciar os servicos^).
    goto :erro
)
if not exist ".env" (
    echo ERRO: falta o ficheiro .env nesta pasta. Copie .env.example para .env e preencha.
    goto :erro
)

echo [1/8] A verificar se ha atualizacoes...
git fetch origin main
if errorlevel 1 (
    echo ERRO: nao foi possivel contactar o GitHub.
    goto :erro
)
for /f %%i in ('git rev-parse HEAD') do set "LOCAL=%%i"
for /f %%i in ('git rev-parse origin/main') do set "REMOTE=%%i"

if "%LOCAL%"=="%REMOTE%" if "%FORCE%"=="0" (
    echo.
    echo Ja esta atualizado! Nada a fazer. ^(use "deploy\deploy.cmd force" para reinstalar^)
    goto :fim
)
echo Versao atual: %LOCAL:~0,7%   Nova versao: %REMOTE:~0,7%
echo.

echo [2/8] A buscar atualizacoes do GitHub...
REM O npm por vezes altera package.json/package-lock.json localmente, o que bloqueia o pull.
git checkout -- package.json package-lock.json 2>nul
git pull --ff-only origin main
if errorlevel 1 (
    echo ERRO: git pull falhou ^(ha alteracoes locais nesta pasta? veja "git status"^).
    goto :erro
)
git log -1 --format="   %%h  %%s  (%%an, %%ad)" --date=short
echo.

echo [3/8] A instalar dependencias...
call npm ci --no-audit --no-fund
if errorlevel 1 (
    echo ERRO: npm ci falhou! Os servicos continuam a correr com a versao anterior.
    goto :erro
)

echo.
echo [4/8] A verificar a configuracao ^(.env^)...
call npx tsx scripts\verificar-env.ts
if errorlevel 1 (
    echo ERRO: configuracao invalida ^(ver mensagem acima^). Os servicos continuam com a versao anterior.
    goto :erro
)

echo.
echo [5/8] A compilar a aplicacao e o worker...
call npm run build
if errorlevel 1 (
    echo ERRO: build falhou! Os servicos continuam a correr com a versao anterior.
    goto :erro
)
call npm run build:worker
if errorlevel 1 (
    echo ERRO: build do worker falhou! Os servicos continuam a correr com a versao anterior.
    goto :erro
)

echo.
echo [6/8] A correr os testes...
call npm test
if errorlevel 1 (
    echo ERRO: os testes falharam! Os servicos continuam a correr com a versao anterior.
    goto :erro
)

echo.
echo [7/8] Copia de seguranca, base de dados e publicacao...
set "SERVICOS_EXISTEM=0"
sc query "%SVC_APP%" >nul 2>&1 && set "SERVICOS_EXISTEM=1"
if "%SERVICOS_EXISTEM%"=="1" (
    echo A parar os servicos...
    net stop "%SVC_WORKER%" >nul 2>&1
    net stop "%SVC_APP%" >nul 2>&1
    timeout /t 5 /nobreak >nul
)

REM Copia de seguranca ANTES de qualquer alteracao a base de dados (servicos parados: nada se perde)
call node scripts\backup-bd.mjs antes-deploy %LOCAL%
if errorlevel 1 (
    echo ERRO: a copia de seguranca falhou. A base de dados NAO foi alterada.
    call :reiniciar_anteriores
    goto :erro
)

call npx prisma migrate deploy
if errorlevel 1 (
    echo ERRO: a migracao da base de dados falhou!
    echo Os servicos ficam PARADOS. Reponha a copia de seguranca mais recente da pasta de backups
    echo ^(ver instrucoes em scripts\backup-bd.mjs^) e volte a correr o deploy, ou contacte o suporte.
    goto :erro
)

REM Publica a nova versao em publicado\ e guarda a anterior em publicado-anterior\
if exist "publicado-anterior" rmdir /s /q "publicado-anterior"
if exist "publicado" move "publicado" "publicado-anterior" >nul
robocopy ".next\standalone" "publicado\app" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto :erro_publicar
robocopy ".next\static" "publicado\app\.next\static" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto :erro_publicar
robocopy "public" "publicado\app\public" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto :erro_publicar
robocopy "dist\worker" "publicado\worker" /MIR /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto :erro_publicar

echo.
echo [8/8] A iniciar os servicos...
if "%SERVICOS_EXISTEM%"=="0" (
    echo Os servicos ainda nao existem: a instalar...
    call node deploy\install-service.js
    if errorlevel 1 goto :erro
) else (
    net start "%SVC_APP%"
    if errorlevel 1 (
        echo AVISO: nao conseguiu iniciar a aplicacao. Tente manualmente: net start "%SVC_APP%"
        call :diagnostico
        goto :erro
    )
    net start "%SVC_WORKER%"
    if errorlevel 1 (
        echo AVISO: nao conseguiu iniciar o worker. Tente manualmente: net start "%SVC_WORKER%"
        call :diagnostico
        goto :erro
    )
)

REM Confirma que a aplicacao responde (ate 60 segundos)
for /f "tokens=2 delims==" %%p in ('findstr /b "PORT=" .env 2^>nul') do set "PORTA=%%p"
if not defined PORTA set "PORTA=3000"
echo A aguardar que a aplicacao responda em http://127.0.0.1:%PORTA%/api/health ...
powershell -NoProfile -Command "for ($i = 0; $i -lt 12; $i++) { Start-Sleep -Seconds 5; try { $r = Invoke-RestMethod -TimeoutSec 5 http://127.0.0.1:%PORTA%/api/health; Write-Host (' estado: ' + $r.estado + ', bd: ' + $r.bd + ', worker: ' + $r.worker); exit 0 } catch { Write-Host -NoNewline '.' } }; exit 1"
if errorlevel 1 (
    echo.
    echo AVISO: a aplicacao nao respondeu ao fim de 60 segundos.
    call :diagnostico
    goto :erro
)

echo.
echo ========================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo   Versao: %REMOTE:~0,7%
echo   Versao anterior guardada em publicado-anterior\ e copia de seguranca em backups
echo   %date% %time%
echo ========================================
goto :fim

:reiniciar_anteriores
if "%SERVICOS_EXISTEM%"=="1" (
    echo A reiniciar os servicos com a versao anterior...
    net start "%SVC_APP%" >nul 2>&1
    net start "%SVC_WORKER%" >nul 2>&1
)
exit /b 0

:erro_publicar
echo ERRO: falhou a copia dos ficheiros para publicado\.
echo Para voltar a versao anterior: apague publicado\, mude o nome de publicado-anterior\ para publicado\ e inicie os servicos.
goto :erro

:diagnostico
echo.
echo ---------- DIAGNOSTICO ----------
echo Programa a usar a porta %PORTA%:
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort %PORTA% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if (-not $c) { Write-Host '  (nenhum: a aplicacao nao esta a correr)' } else { $p = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $c.OwningProcess); Write-Host ('  PID ' + $c.OwningProcess + ': ' + $p.Name + ' ' + $p.CommandLine); if ($p.CommandLine -notmatch 'servico') { Write-Host '  ATENCAO: a porta esta ocupada por OUTRA aplicacao. Mude PORT no .env (ex.: 3002).' } }"
echo.
echo Ultimas linhas dos logs dos servicos (deploy\servico\daemon):
powershell -NoProfile -Command "$f = Get-ChildItem 'deploy\servico\daemon\*.log' -ErrorAction SilentlyContinue; if (-not $f) { Write-Host '  (sem logs)' }; $f | ForEach-Object { Write-Host ('== ' + $_.Name); Get-Content $_.FullName -Tail 15 }"
echo.
echo Para ver o erro diretamente: net stop "%SVC_APP%"  e depois  node deploy\servico\app.cjs
echo ---------------------------------
exit /b 0

:erro
echo.
echo ========================================
echo   DEPLOY INTERROMPIDO - ver mensagens acima
echo ========================================
if "%NOPAUSE%"=="0" pause
exit /b 1

:fim
echo.
if "%NOPAUSE%"=="0" pause
exit /b 0
