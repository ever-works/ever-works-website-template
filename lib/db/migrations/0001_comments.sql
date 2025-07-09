CREATE TABLE IF NOT EXISTS "comments" (
    "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
    "content" text NOT NULL,
    "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "itemId" text NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "deleted_at" timestamp
); 