/*
  Warnings:

  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "path";
