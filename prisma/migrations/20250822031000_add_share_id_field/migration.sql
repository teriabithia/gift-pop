/*
  Warnings:

  - A unique constraint covering the columns `[share_id]` on the table `gift_lists` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gift_lists" ADD COLUMN "share_id" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "quiz_answer_id" TEXT,
    "type" TEXT,
    "occasion" TEXT,
    "gift_ids" TEXT,
    "data" TEXT,
    "algorithm_data" TEXT,
    "relevance_score" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recommendations_quiz_answer_id_fkey" FOREIGN KEY ("quiz_answer_id") REFERENCES "quiz_answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recommendations" ("algorithm_data", "created_at", "expires_at", "gift_ids", "id", "quiz_answer_id", "relevance_score", "status", "user_id") SELECT "algorithm_data", "created_at", "expires_at", "gift_ids", "id", "quiz_answer_id", "relevance_score", "status", "user_id" FROM "recommendations";
DROP TABLE "recommendations";
ALTER TABLE "new_recommendations" RENAME TO "recommendations";
CREATE INDEX "recommendations_user_id_idx" ON "recommendations"("user_id");
CREATE INDEX "recommendations_quiz_answer_id_idx" ON "recommendations"("quiz_answer_id");
CREATE INDEX "recommendations_type_idx" ON "recommendations"("type");
CREATE INDEX "recommendations_occasion_idx" ON "recommendations"("occasion");
CREATE INDEX "recommendations_status_idx" ON "recommendations"("status");
CREATE INDEX "recommendations_expires_at_idx" ON "recommendations"("expires_at");
CREATE INDEX "recommendations_created_at_idx" ON "recommendations"("created_at" DESC);
CREATE INDEX "recommendations_updated_at_idx" ON "recommendations"("updated_at" DESC);
CREATE UNIQUE INDEX "recommendations_type_occasion_key" ON "recommendations"("type", "occasion");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "gift_lists_share_id_key" ON "gift_lists"("share_id");

-- CreateIndex
CREATE INDEX "gift_lists_share_id_idx" ON "gift_lists"("share_id");
