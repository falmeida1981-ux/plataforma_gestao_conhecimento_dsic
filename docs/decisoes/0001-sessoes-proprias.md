# ADR 0001 — Sessões próprias em base de dados em vez de Auth.js

- **Estado:** aceite
- **Data:** 2026-09-24

## Contexto

Os requisitos propunham Auth.js com provider de credenciais e LDAP. Entretanto o Auth.js passou para modo de manutenção (o projeto foi assumido pela equipa do Better Auth). Além disso, o provider de credenciais do Auth.js só funciona com sessões JWT, o que dificulta três requisitos:

- expiração por inatividade configurável;
- revogação imediata de sessões (utilizador desativado, alteração de permissões);
- auditoria de sessões (RNF10).

## Decisão

Implementar uma camada de autenticação pequena e própria (M2):

- tabela `sessao` com o token guardado apenas como hash SHA-256; cookie `httpOnly`, `Secure`, `SameSite=Lax`;
- `ldapts` para o Active Directory (bind com conta de serviço, filtro por grupo);
- `@node-rs/argon2` (Argon2id) para as contas locais;
- `otplib` para o TOTP (obrigatório para contas locais e para o perfil Administrador);
- bloqueio após N tentativas falhadas e rate limiting guardados em tabela;
- `src/proxy.ts` valida a sessão; a autorização fina é feita no servidor em cada ação (`acao()`).

## Consequências

- Controlo total sobre a expiração, a revogação e a auditoria, sem dependências em manutenção.
- Mais código próprio de segurança: exige testes e revisão cuidada no M2.
- O Entra ID (SSO) futuro entra como mais um método de login a criar a mesma `sessao`, sem alterar o modelo de utilizadores.
