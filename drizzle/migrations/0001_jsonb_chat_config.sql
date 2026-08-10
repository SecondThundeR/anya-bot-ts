ALTER TABLE "chats" ADD COLUMN "config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "chats" SET "config" = jsonb_strip_nulls(jsonb_build_object(
	'adminPower', NULLIF("admin_power", false),
	'aidenMode', NULLIF("aiden_mode", false),
	'isAidenSilent', NULLIF("is_aiden_silent", false),
	'isSilent', NULLIF("is_silent", false),
	'strictEmojiRemoval', NULLIF("strict_emoji_removal", false),
	'stickerMessageMention', NULLIF("sticker_message_mention", false),
	'stickerMessageLocale', NULLIF("sticker_message_locale", ''),
	'silentOnLocale', NULLIF("silent_on_locale", ''),
	'silentOffLocale', NULLIF("silent_off_locale", '')
));--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "admin_power";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "aiden_mode";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "is_aiden_silent";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "is_silent";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "strict_emoji_removal";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "is_message_locale_changing";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "sticker_message_mention";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "sticker_message_locale";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "silent_on_locale";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "silent_off_locale";--> statement-breakpoint
CREATE INDEX "chats_list_status_index" ON "chats" USING btree ("list_status");