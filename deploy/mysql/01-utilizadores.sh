#!/bin/sh
# Corre uma única vez, na primeira inicialização do contentor MySQL (docker-entrypoint-initdb.d).
# Cria os dois utilizadores da plataforma (RNF12):
#   dsic_migracoes → dono do esquema (DDL), usado só pelo serviço "migrate".
#   dsic_app       → aplicação e worker, só DML. No M3 as permissões passam a ser por tabela,
#                    sem UPDATE/DELETE nas tabelas de auditoria e versões.
# As palavras-passe vêm do .env de produção e não podem conter plicas (').
set -eu

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE USER IF NOT EXISTS 'dsic_migracoes'@'%' IDENTIFIED BY '${MYSQL_MIGRACOES_PASSWORD}';
CREATE USER IF NOT EXISTS 'dsic_app'@'%' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO 'dsic_migracoes'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`${MYSQL_DATABASE}\`.* TO 'dsic_app'@'%';
FLUSH PRIVILEGES;
SQL
