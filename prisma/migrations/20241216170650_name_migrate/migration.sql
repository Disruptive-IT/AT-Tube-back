-- CreateTable
CREATE TABLE `Roles` (
    `id_rol` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentType` (
    `id_document_type` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_document_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id_city` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `id_department` INTEGER NOT NULL,

    PRIMARY KEY (`id_city`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id_country` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `currency` ENUM('COP', 'VES', 'PEN', 'ARS', 'USD', 'CLP', 'UYU', 'BOB', 'PYG', 'BRL', 'MXN', 'GTQ', 'HNL', 'NIO', 'CRC', 'CUP', 'DOP', 'HTG', 'JMD', 'TTD', 'GYD', 'SRD', 'BZD', 'BBD', 'XCD', 'BSD', 'CAD') NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `phone_code` VARCHAR(191) NOT NULL,
    `flag_code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_country`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id_department` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `id_country` INTEGER NOT NULL,

    PRIMARY KEY (`id_department`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id_users` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `document_type` INTEGER NULL,
    `document` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `id_country` INTEGER NULL,
    `str_country` VARCHAR(191) NOT NULL,
    `id_department` INTEGER NULL,
    `str_Department` VARCHAR(191) NOT NULL,
    `id_city` INTEGER NULL,
    `str_city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `id_rol` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NULL DEFAULT false,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id_users`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sales` (
    `id_sales` VARCHAR(191) NOT NULL,
    `id_user` VARCHAR(191) NOT NULL,
    `total_price` INTEGER NULL,
    `finalize_at` DATETIME(3) NULL,
    `cotized_at` DATETIME(3) NULL,
    `purchased_at` DATETIME(3) NULL,
    `send_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `canceled_at` DATETIME(3) NULL,
    `canceled_reason` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `id_orden_pago` VARCHAR(191) NULL,
    `id_pago_reslizado` VARCHAR(191) NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_sales`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesStatus` (
    `id_status` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `descriptionClient` VARCHAR(191) NOT NULL,
    `descriptionAdmin` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesTemplate` (
    `id_sales` VARCHAR(191) NOT NULL,
    `id_template` VARCHAR(191) NOT NULL,
    `box_amount` INTEGER NOT NULL,
    `box_price` INTEGER NOT NULL,
    `bottle_amount` INTEGER NOT NULL,
    `bottle_price` INTEGER NOT NULL,
    `decorator_type` VARCHAR(191) NULL,
    `decorator_price` INTEGER NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_sales`, `id_template`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Templates` (
    `id_template` VARCHAR(191) NOT NULL,
    `id_users` VARCHAR(191) NOT NULL,
    `design` JSON NOT NULL,
    `decorator` VARCHAR(191) NULL,
    `decorator_type` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_template`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_id_department_fkey` FOREIGN KEY (`id_department`) REFERENCES `Department`(`id_department`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_id_country_fkey` FOREIGN KEY (`id_country`) REFERENCES `Country`(`id_country`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_id_country_fkey` FOREIGN KEY (`id_country`) REFERENCES `Country`(`id_country`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_id_rol_fkey` FOREIGN KEY (`id_rol`) REFERENCES `Roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_document_type_fkey` FOREIGN KEY (`document_type`) REFERENCES `DocumentType`(`id_document_type`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_status_fkey` FOREIGN KEY (`status`) REFERENCES `SalesStatus`(`id_status`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_users`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesTemplate` ADD CONSTRAINT `SalesTemplate_id_sales_fkey` FOREIGN KEY (`id_sales`) REFERENCES `Sales`(`id_sales`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesTemplate` ADD CONSTRAINT `SalesTemplate_id_template_fkey` FOREIGN KEY (`id_template`) REFERENCES `Templates`(`id_template`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Templates` ADD CONSTRAINT `Templates_id_users_fkey` FOREIGN KEY (`id_users`) REFERENCES `Users`(`id_users`) ON DELETE RESTRICT ON UPDATE CASCADE;
