# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] (Deno version)

### Added

- Full support for Deno

## [2.0.6] - 2023-03-24

### Changed

- Update dependencies
- Update locale
- Rename `.env` to `.env.example`
- Minor refactor

### Removed

- Docstrings for some methods
- Deprecated utils methods

### Fixed

- Type annotation for chat object

## [2.0.5] - 2022-12-31

### Changed

- Update dependencies

## [2.0.4] - 2022-12-16

### Added

- New dependencies: `ts-node` and `ts-node-dev`
- New command: `/dice`
  > Input: `/dice {number} {text}`
  >
  > Output: `Если падает {number}, то {text}`, then send animated dice
- Support for placeholder formatting for locale strings

### Changed

- Switch from `module-alias` to `tsconfig-paths` (See [commit description](https://github.com/SecondThundeR/anya-bot-ts/commit/9a160230783f86c22780fe3c3ae018e4bce6466e) for more info)
- Move lists names from enums to readonly consts (`const as const`)
- Update dependencies

## [2.0.3] - 2022-11-06

### Changed

- Update dependencies

### Fixed

- "Stuck" behaviour of /messagelocale command when user passed empty string as locale text

## [2.0.2] - 2022-11-02

### Added

- Custom paths in TSConfig
- Support for Module-alias package for correct custom paths usage
- Custom paths to importOrder option in .prettierrc.js
- Prettier format script in package.json

### Changed

- Update dependencies
- Format code with Prettier

### Removed

- `requireConfig` parameter from .prettierrc.js

### Fixed

- Change cast to Update.Message & Edited in pmHandlerCallback

## [2.0.1] - 2022-10-18

### Changed

- Add wildcard for ignoring all .md files in `.prettierignore`
- Update some info in `README.md`
- Update dependencies

### Fixed

- Fix links to current repo in `README.md`

## [2.0.0] - 2022-09-18

> This release adds new features and fixes, as well as start of refactoring of project files

### Added

- New features: Delete voice/video messages, and premium emojis
- New commands:
  - `/aidenmode` - Enables/disables Aiden Pierce mode _(Removal of voice/video messages)_
    > Named after my previous bot, [@voicecringe_bot](https://t.me/voicecringe_bot), which is now disabled
  - `/aidenmodesilent` - Triggers silent mode for Aiden Pierce mode
  - `/adminpower` - Allows admin to send "restricted" content
  - `/noemoji` - Disables premium emoji in messages
- New commands for creator PM: `/getcommandsusage` and `/uptime`
- Mini-analytics of bot's commands usage _(Anonymous counters without linking to chat IDs)_
- Dummy .env file for development
- Redis singleton for working with DB from multiple files
- Display basic bot data _(first name and username)_ in console and send it to bot creator PM on startup
- Check for bot kick when trying to add a chat to the whitelist/ignored list
- New message text if bot was kicked when adding chat to the list with button
- Link to live Telegram bot instance in README.md
- Prettier plugin for import sorting
- Check in all group commands for non-whitelist and non-admin trigger
- Docs on some functions

### Changed

- Project renamed to `anya-bot-ts`
- Started work on refactoring project files _(Thx to `Composer()`, now commands are separated from bot.ts file)_
- Rephrase some of the bot's message text for better understanding
- Update dependencies in `package.json`
- Update configurations in `.vscode/launch.json`
- Update `tsconfig.json`: Now it has options for debugging in WebStorm
- Update `.prettierignore`: Add `CHANGELOG.md`
- Update `.dockerignore`, `.gitignore`, `.prettierrc.json` _(Remove redundant options)_

### Removed

- `utils.ts` removed _(Replaced with `utils/regularUtils.ts` and `utils/asyncUtils.ts`)_
- `locale.ts` removed _(Replaced with `locale` folder)_
- Local arrays with whiteList and ignoreList IDs
- Message in `/help` when triggered by non-admin user
- RUN workaround from Dockerfile _(By moving TypeScript from dev-deps to deps)_

### Fixed

- Function call to send a message after removing a sticker is now asynchronous
- Commands to view data in the white and ignore list now check for the creator
- Bug which caused the bot to show all private info for the creator to the others _(Sometimes I hate myself)_
- Typings are now up to date _(Removed `@ts-ignore` in many places)_
- Title of project in README.md
- Some files are prettified and fixed
- Some sources fixed and improved

## [1.2.1] - 2022-06-28

> This release is mainly aimed at some refactoring

### Added

- Сheck on the bot's ability to delete messages

### Changed

- Break down some of the logic in `utils.ts`
- Now when `isSilent` equals `false`, it will trigger `hDel` to save space in the database

## [1.2.0] - 2022-06-25

### Added

- Script for `package.json` to run locally
- Rules and Ignorefile for Prettier
- Workspace settings and plugin recommendations for VSCode
- New questions/answers in README.md
- New changelog section in README.md

### Changed

- New whitelist/ignored list logic: Now the bot does not leave from the chat, but simply ignores users until granted appropriate access
- Retrieving whitelist now shows links to chats if they exist
- Adding messages to a new chat now shows a link to it if it is available
- Bot now ignores follow-up calls to `/messagelocale` while one of the calls is in progress
- After `/messagelocale` timeout, the bot responds to the original message and returns the default text
- Changed some localization strings
- Steps for local startup in README.md
- Debugging `launch.json` now reads the `.env` file.
- The first question/answer in README.md has been slightly changed to match the new update

### Removed

- Old timeout check when pressing a button

### Fixed

- Checking to add a bot to a new group now works correctly
- Button for `/messagelocale' now checks which user presses it
- Callback now sends a answer to every trigger
- Message timeout is now handled by the `/messagelocale` command itself and works correctly

## [pre-1.2.0] - 2022-06-21 - 2022-06-24

### Added

- Removing premium stickers
- Command to get help _(Separate output for regular people, admins and for bot creator in private messages)_
- Silent delete mode
- White and ignore list to limit bot's presence in various chats and commands to manage the lists
- Ability to change some localization strings via commands
- A placeholder when trying to write a private message to a bot by a non-creator

[Unreleased]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.6...HEAD
[2.0.6]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v1.2.1...v2.0.0
[1.2.1]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v1.2.1...v1.2.1
[1.2.0]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/pre-1.2.0...v1.2.0
[pre-1.2.0]: https://github.com/SecondThundeR/anti-premium-stickers-bot/releases/tag/pre-1.2.0
