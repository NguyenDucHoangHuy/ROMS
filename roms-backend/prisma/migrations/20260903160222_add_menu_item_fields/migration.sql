/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "avg_rating" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "preparation_time" INTEGER,
ADD COLUMN     "tags" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");
