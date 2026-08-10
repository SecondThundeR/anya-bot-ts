CREATE TYPE "public"."chat_list_status" AS ENUM('whitelisted', 'ignored');--> statement-breakpoint
CREATE TABLE "chats" (
	"chat_id" bigint PRIMARY KEY NOT NULL,
	"list_status" "chat_list_status",
	"admin_power" boolean DEFAULT false NOT NULL,
	"aiden_mode" boolean DEFAULT false NOT NULL,
	"is_aiden_silent" boolean DEFAULT false NOT NULL,
	"is_silent" boolean DEFAULT false NOT NULL,
	"strict_emoji_removal" boolean DEFAULT false NOT NULL,
	"is_message_locale_changing" boolean DEFAULT false NOT NULL,
	"sticker_message_mention" boolean DEFAULT false NOT NULL,
	"sticker_message_locale" text,
	"silent_on_locale" text,
	"silent_off_locale" text
);
--> statement-breakpoint
CREATE TABLE "commands_usage" (
	"command" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
