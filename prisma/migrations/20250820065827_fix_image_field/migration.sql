-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "provider" TEXT DEFAULT 'email',
    "provider_id" TEXT,
    "email_verified" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "shop_url" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "occasions" TEXT,
    "target_demographics" TEXT,
    "popularity_score" REAL NOT NULL DEFAULT 0,
    "embedding" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "gift_lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_token" TEXT,
    "share_expires_at" DATETIME,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gift_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "list_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "list_id" TEXT NOT NULL,
    "gift_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "custom_data" TEXT,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "gift_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "list_items_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "gifts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "preferences" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "quiz_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "quiz_answer_id" TEXT NOT NULL,
    "gift_ids" TEXT NOT NULL,
    "algorithm_data" TEXT,
    "relevance_score" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recommendations_quiz_answer_id_fkey" FOREIGN KEY ("quiz_answer_id") REFERENCES "quiz_answers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "list_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME,
    "permissions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "share_links_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "gift_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "share_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "gifts_category_idx" ON "gifts"("category");

-- CreateIndex
CREATE INDEX "gifts_popularity_score_idx" ON "gifts"("popularity_score" DESC);

-- CreateIndex
CREATE INDEX "gifts_price_idx" ON "gifts"("price");

-- CreateIndex
CREATE INDEX "gifts_rating_idx" ON "gifts"("rating" DESC);

-- CreateIndex
CREATE INDEX "gifts_is_active_idx" ON "gifts"("is_active");

-- CreateIndex
CREATE INDEX "gifts_created_at_idx" ON "gifts"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "gift_lists_share_token_key" ON "gift_lists"("share_token");

-- CreateIndex
CREATE INDEX "gift_lists_user_id_idx" ON "gift_lists"("user_id");

-- CreateIndex
CREATE INDEX "gift_lists_share_token_idx" ON "gift_lists"("share_token");

-- CreateIndex
CREATE INDEX "gift_lists_is_public_idx" ON "gift_lists"("is_public");

-- CreateIndex
CREATE INDEX "gift_lists_created_at_idx" ON "gift_lists"("created_at" DESC);

-- CreateIndex
CREATE INDEX "list_items_list_id_sort_order_idx" ON "list_items"("list_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "list_items_list_id_gift_id_key" ON "list_items"("list_id", "gift_id");

-- CreateIndex
CREATE INDEX "quiz_answers_user_id_idx" ON "quiz_answers"("user_id");

-- CreateIndex
CREATE INDEX "quiz_answers_session_id_idx" ON "quiz_answers"("session_id");

-- CreateIndex
CREATE INDEX "quiz_answers_created_at_idx" ON "quiz_answers"("created_at" DESC);

-- CreateIndex
CREATE INDEX "recommendations_user_id_idx" ON "recommendations"("user_id");

-- CreateIndex
CREATE INDEX "recommendations_quiz_answer_id_idx" ON "recommendations"("quiz_answer_id");

-- CreateIndex
CREATE INDEX "recommendations_status_idx" ON "recommendations"("status");

-- CreateIndex
CREATE INDEX "recommendations_expires_at_idx" ON "recommendations"("expires_at");

-- CreateIndex
CREATE INDEX "recommendations_created_at_idx" ON "recommendations"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "share_links_token_idx" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "share_links_list_id_idx" ON "share_links"("list_id");

-- CreateIndex
CREATE INDEX "share_links_created_by_idx" ON "share_links"("created_by");

-- CreateIndex
CREATE INDEX "share_links_is_active_idx" ON "share_links"("is_active");

-- CreateIndex
CREATE INDEX "share_links_expires_at_idx" ON "share_links"("expires_at");
