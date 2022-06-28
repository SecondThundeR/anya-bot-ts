# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/v1.2.1...v1.2.1
[1.2.0]: https://github.com/SecondThundeR/anti-premium-stickers-bot/compare/pre-1.2.0...v1.2.0
[pre-1.2.0]: https://github.com/SecondThundeR/anti-premium-stickers-bot/releases/tag/pre-1.2.0
