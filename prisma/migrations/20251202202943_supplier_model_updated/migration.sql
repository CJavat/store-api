/*
  Warnings:

  - Added the required column `name` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "name" TEXT NOT NULL;
