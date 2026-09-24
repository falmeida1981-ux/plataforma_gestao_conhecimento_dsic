# Instala um Node proprio para esta plataforma, numa pasta separada, SEM mexer no Node do sistema
# (que continua a ser usado pelas outras aplicacoes do servidor).
#
# Uso (PowerShell como administrador, na pasta da plataforma):
#   powershell -ExecutionPolicy Bypass -File deploy\instalar-node.ps1
#   powershell -ExecutionPolicy Bypass -File deploy\instalar-node.ps1 -Versao 24.19.0 -Pasta D:\nodejs24
#
# Depois acrescentar ao .env:   NODE_HOME=C:\nodejs24
param(
    [string]$Versao = "",
    [string]$Pasta = "C:\nodejs24"
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not $Versao) {
    # Ultima versao 24.x publicada
    $indice = Invoke-RestMethod "https://nodejs.org/dist/index.json"
    $Versao = ($indice | Where-Object { $_.version -like "v24.*" } | Select-Object -First 1).version.TrimStart("v")
}

$nome = "node-v$Versao-win-x64"
$zip = Join-Path $env:TEMP "$nome.zip"
$url = "https://nodejs.org/dist/v$Versao/$nome.zip"

Write-Host "A descarregar Node $Versao de $url ..."
Invoke-WebRequest -UseBasicParsing $url -OutFile $zip

# Confirma o SHA-256 publicado pelo projeto Node
$somas = (Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/v$Versao/SHASUMS256.txt").Content
$esperado = ($somas -split "`n" | Where-Object { $_ -match " $nome\.zip$" }) -replace "\s.*$", ""
$obtido = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
if ($esperado -ne $obtido) { throw "SHA-256 nao confere (esperado $esperado, obtido $obtido)." }

$temp = Join-Path $env:TEMP $nome
if (Test-Path $temp) { Remove-Item -Recurse -Force $temp }
Expand-Archive $zip -DestinationPath $env:TEMP
if (Test-Path $Pasta) {
    Write-Host "A substituir a versao existente em $Pasta ..."
    Remove-Item -Recurse -Force $Pasta
}
Move-Item $temp $Pasta
Remove-Item $zip

& (Join-Path $Pasta "node.exe") -v
Write-Host ""
Write-Host "Node $Versao instalado em $Pasta (o Node do sistema nao foi alterado)."
Write-Host "Acrescente ao .env da plataforma:  NODE_HOME=$Pasta"
Write-Host "Depois: deploy\deploy.cmd force"
