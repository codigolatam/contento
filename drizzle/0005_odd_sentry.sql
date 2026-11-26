ALTER TABLE "user" ADD COLUMN "personal_workspace_id" text;--> statement-breakpoint
UPDATE "user" u SET "personal_workspace_id" = m."organization_id"
FROM "member" m
JOIN "organization" o ON o."id" = m."organization_id"
WHERE m."user_id" = u."id"
  AND m."role" = 'owner'
  AND o."personal"
  AND o."slug" = 'personal-' || u."id";--> statement-breakpoint
UPDATE "user" u SET "personal_workspace_id" = sub."oid"
FROM (
  SELECT m."user_id" AS "uid", MIN(m."organization_id") AS "oid"
  FROM "member" m
  JOIN "organization" o ON o."id" = m."organization_id"
  WHERE m."role" = 'owner' AND o."personal"
  GROUP BY m."user_id"
  HAVING COUNT(*) = 1
) sub
WHERE u."id" = sub."uid" AND u."personal_workspace_id" IS NULL;
