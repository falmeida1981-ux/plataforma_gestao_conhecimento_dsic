-- Cria as bases de dados e os utilizadores MySQL do ambiente de DESENVOLVIMENTO.
-- Correr uma vez, como root, no MySQL local (porta 3307):
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -P 3307 < scripts\dev\criar-bd-dev.sql
--
-- As palavras-passe abaixo são só para desenvolvimento local e coincidem com o .env.example.
-- Em produção usa-se deploy/mysql/01-utilizadores.sh, com palavras-passe vindas de variáveis de ambiente.
--
-- Dois utilizadores (RNF12):
--   dsic_migracoes → dono do esquema (DDL), usado só pelo `prisma migrate`.
--   dsic_app       → utilizador da aplicação, só DML. No M3 as permissões passam a ser por tabela,
--                    sem UPDATE/DELETE nas tabelas de auditoria e versões.

CREATE DATABASE IF NOT EXISTS dsic_ops_dev    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS dsic_ops_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS dsic_ops_test   CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'dsic_migracoes'@'localhost' IDENTIFIED BY 'dsic_migracoes_dev';
CREATE USER IF NOT EXISTS 'dsic_migracoes'@'127.0.0.1' IDENTIFIED BY 'dsic_migracoes_dev';
CREATE USER IF NOT EXISTS 'dsic_app'@'localhost'       IDENTIFIED BY 'dsic_app_dev';
CREATE USER IF NOT EXISTS 'dsic_app'@'127.0.0.1'       IDENTIFIED BY 'dsic_app_dev';

GRANT ALL PRIVILEGES ON dsic_ops_dev.*    TO 'dsic_migracoes'@'localhost', 'dsic_migracoes'@'127.0.0.1';
GRANT ALL PRIVILEGES ON dsic_ops_shadow.* TO 'dsic_migracoes'@'localhost', 'dsic_migracoes'@'127.0.0.1';
GRANT ALL PRIVILEGES ON dsic_ops_test.*   TO 'dsic_migracoes'@'localhost', 'dsic_migracoes'@'127.0.0.1';

GRANT SELECT, INSERT, UPDATE, DELETE ON dsic_ops_dev.*  TO 'dsic_app'@'localhost', 'dsic_app'@'127.0.0.1';
GRANT SELECT, INSERT, UPDATE, DELETE ON dsic_ops_test.* TO 'dsic_app'@'localhost', 'dsic_app'@'127.0.0.1';

FLUSH PRIVILEGES;
