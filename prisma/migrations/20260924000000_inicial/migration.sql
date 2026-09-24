-- CreateTable
CREATE TABLE `parametro` (
    `chave` VARCHAR(100) NOT NULL,
    `valor` JSON NOT NULL,
    `descricao` VARCHAR(500) NULL,
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado_worker` (
    `nome` VARCHAR(100) NOT NULL,
    `versao` VARCHAR(50) NOT NULL,
    `iniciado_em` DATETIME(3) NOT NULL,
    `ultimo_heartbeat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`nome`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
