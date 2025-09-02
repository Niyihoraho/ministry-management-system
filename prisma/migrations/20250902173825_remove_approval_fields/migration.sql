/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `userrole` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `userrole` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `userrole` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `userrole` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `userrole` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `userrole_approvedBy_fkey`;

-- DropIndex
DROP INDEX `userrole_approvedBy_idx` ON `userrole`;

-- AlterTable
ALTER TABLE `userrole` DROP COLUMN `approvedAt`,
    DROP COLUMN `approvedBy`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `reason`,
    DROP COLUMN `status`;
