#!/usr/bin/env bash
# Cria na base de dados da CI os mesmos dois utilizadores que existem em produção
# (ver deploy/mysql/01-utilizadores.sh). Só para a CI: palavras-passe descartáveis.
set -euo pipefail

mysql -h 127.0.0.1 -P 3306 -uroot -proot <<'SQL'
CREATE USER IF NOT EXISTS 'dsic_migracoes'@'%' IDENTIFIED BY 'dsic_migracoes_ci';
CREATE USER IF NOT EXISTS 'dsic_app'@'%' IDENTIFIED BY 'dsic_app_ci';
GRANT ALL PRIVILEGES ON dsic_ops_ci.* TO 'dsic_migracoes'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON dsic_ops_ci.* TO 'dsic_app'@'%';
FLUSH PRIVILEGES;
SQL
