/*
  Warnings:

  - Added the required column `url` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "path" VARCHAR(255) NOT NULL;
