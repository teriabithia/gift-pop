-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "list_id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "custom_data" TEXT,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "selected_by" TEXT,
    "selection_note" TEXT,
    "selected_at" DATETIME,
    CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "gift_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_items_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_list_items" ("added_at", "custom_data", "gift_id", "id", "list_id", "note", "sort_order") SELECT "added_at", "custom_data", "gift_id", "id", "list_id", "note", "sort_order" FROM "list_items";
DROP TABLE "list_items";
ALTER TABLE "new_list_items" RENAME TO "list_items";
CREATE INDEX "list_items_list_id_sort_order_idx" ON "list_items"("list_id", "sort_order");
CREATE UNIQUE INDEX "list_items_list_id_gift_id_key" ON "list_items"("list_id", "gift_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
