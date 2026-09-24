# ADR 0003 — MySQL 8.4, dois utilizadores de BD e fila sem Redis

- **Estado:** aceite
- **Data:** 2026-09-24

## Contexto

- Os requisitos indicam MySQL 8, mas o MySQL 8.0 chegou ao fim de vida em abril de 2026.
- O RNF12 exige que o utilizador da aplicação não possa alterar nem apagar a auditoria e as versões.
- As notificações precisam de fila persistente com tentativas, e o servidor interno deve ter o mínimo de componentes.

## Decisão

- **MySQL 8.4 LTS** em produção, sempre em `utf8mb4`. As bases de dados são criadas com `utf8mb4_0900_ai_ci`; as tabelas criadas pelo Prisma ficam com `utf8mb4_unicode_ci`. As duas collations são insensíveis a maiúsculas e acentos, o que interessa para a pesquisa (RF26).
- **Dois utilizadores**: `dsic_migracoes` (dono do esquema, só para `prisma migrate`) e `dsic_app` (DML, usado pela app e pelo worker). No M3 as permissões do `dsic_app` passam a ser por tabela, sem `UPDATE`/`DELETE` na auditoria e nas versões.
- **Fila em tabela MySQL** processada pelo worker com `SELECT … FOR UPDATE SKIP LOCKED` (M6). Não se usa Redis.
- **Prisma 7 com o adapter MariaDB** (`@prisma/adapter-mariadb`). As vulnerabilidades conhecidas das dependências indiretas (`mariadb`, `mysql2`, `deepmerge-ts`) estão corrigidas por `overrides` no `package.json`; removê-los quando o Prisma atualizar essas dependências.

## Consequências

- Um componente a menos para operar e fazer backup.
- O worker tem de tratar concorrência e tentativas; a fila é testada no M6.
