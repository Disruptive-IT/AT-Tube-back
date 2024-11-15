/*
  Warnings:

  - You are about to drop the column `description` on the `salesstatus` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.
  - Added the required column `descriptionAdmin` to the `SalesStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionClient` to the `SalesStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sales` ADD COLUMN `id_orden_pago` VARCHAR(191) NULL,
    ADD COLUMN `id_pago_reslizado` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesstatus` DROP COLUMN `description`,
    ADD COLUMN `descriptionAdmin` VARCHAR(191) NOT NULL,
    ADD COLUMN `descriptionClient` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `googleId`;
