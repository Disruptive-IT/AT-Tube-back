-- CreateTable
CREATE TABLE `CancelReason` (
    `id_cancelreason` VARCHAR(191) NOT NULL,
    `reason_text` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_cancelreason`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_canceled_reason_fkey` FOREIGN KEY (`canceled_reason`) REFERENCES `CancelReason`(`id_cancelreason`) ON DELETE SET NULL ON UPDATE CASCADE;
