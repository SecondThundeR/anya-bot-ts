# anya-bot-ts

> [!WARNING]
> The bot is in maintenance mode. New features will most likely not appear

Some random TypeScript bot with interesting features based on the grammY library

> [!NOTE]
> This bot was created as an additional tool to fight against premium Telegram stickers and emoji (Because they sucks)
>
> Live instance of bot: [@antipremiumbullshit_bot](https://t.me/antipremiumbullshit_bot)

## Features

- **Removes premium stickers/emojis (Can be disabled/enabled with special command)**
- **Removes voice/video messages (Can be disabled/enabled with special command)**
- Handy white/ignore lists configuration from DM
- Locale configuration via commands
- and more... _(maybe)_

## Setup

### Local

1. Create a new bot and get a bot token
   > Note: Don't forget to disable [privacy mode](https://core.telegram.org/bots#privacy-mode) for your bot.
   >
   > For more information about how this does not violate the privacy of users conversations, read the [FAQ section](#faq)
2. Install `redis-cli` and `deno`
3. Clone this repository
4. Open an `.env` file in the root of the folder and change variables into it:
    - `BOT_TOKEN` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM
5. Run `deno task dev`
    > If you want to get all debug data, run `export DEBUG="grammy*"` before launching bot
6. Wait for `Started as @...` message and/or message in PM from bot
7. Bot is ready to go!

### Fly

1. Create a new bot and get a bot token
2. Create a new Redis database and get: Username, Password, Host and Port
    > How to create a Redis database, create a user and get the necessary data to connect will not be written here
3. Refer to [Fly for Dockerfile documentation](https://fly.io/docs/languages-and-frameworks/dockerfile/) for creating app, setting up secrets and deploying
    > Which secrets need to be set can be found below in Heroku section, step 3
4. Wait for `Started as @...` message in console and/or message in PM from bot
5. Bot is ready to go!

### Heroku

1. Create a new bot and get a bot token
2. Create a new Redis database and get: Username, Password, Host and Port
    > How to create a Redis database, create a user and get the necessary data to connect will not be written here
3. Create a new pipeline in Heroku, the application in it and set neccessary config vars in the settings:
    - `BOT_TOKEN` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM (better to pass, as bot won't work correctly without it)
    - `CHATS_TABLE_NAME` - name of table with data in Redis DB
    - `REDISUSER` - name of Redis DB user
    - `REDISPASS` - password of Redis DB user
    - `REDISHOST` - endpoint of Redis DB
    - `REDISPORT` - port of Redis DB endpoint
4. Push sources on Heroku _(or set up auto-deployment)_ and wait for build
5. Wait for `Started as @...` message in console and/or message in PM from bot
6. Bot is ready to go!

#### Note about Heroku

While doing step 3, refer to [Heroku Docker Docs](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml#getting-started) for converting the stack into a container

> [!TIP]
> If something doesn't work, check the application logs in Heroku or locally and try googling the problem. If nothing helps, open an Issue with a detailed description of the problem

## Bot commands

**Group commands:**

- `help` - send help message
- `silent` - manage bot silent mode
- `aidenmode` - enables "Aiden Pierce" mode _(Removes voice/video messages)_
- `aidensilent` - manage "Aiden Pierce" silent mode
- `noemoji` - triggers emoji strictness removal
- `adminpower` - triggers ignoring of restricted messages from admins
- `silentonlocale` - change message when silent mode is enabled
- `silentonlocalereset` - reset message when silent mode is enabled
- `silentofflocale` - change message when silent mode is disabled
- `silentofflocalereset` - reset message when silent mode is disabled
- `messagelocale` - change message when bot removes stickers
- `messagelocalereset` - reset message when bot removes stickers

**DM commands:**

- `help` - send DM help message
- `addwl` - add group ID to white list
- `remwl` - remove group ID from white list
- `silentremwl` - remove group ID from white list without notification
- `getwl` - get all groups info from white list
- `addil` - add group ID to ignore list
- `remil` - remove group ID from ignore list
- `getil` - get all groups ID from ignore list
- `getcmdusage` - get counters of commands usage
- `import` - import database entries to the related Redis instance
- `export` - export database entries from the related Redis instance
- `uptime` - get current uptime of bot

## Bot locale configuration

The entire locale strings are now stored in the `src/locales`. Some strings can be changed per chat using the commands above with `locale` substring in it.

## Changelog

The project now has a separate file [CHANGELOG.md](https://github.com/SecondThundeR/anya-bot-ts/blob/main/CHANGELOG.md). Check it for details

## FAQ

> Q: How white/ignore lists are working?

When the bot is added to an unknown group, you will be prompted
to add the group to the whitelist, decline the offer to add,
or add it to the ignore list. The ignore list is used to prevent
the bot from sending you information about future additions to the
group that  you have set to the ignore list. In the case of a simple
rejection, the bot will not work in the new chat until you add it
to the whitelist

> Q: Why were these lists added in the first place?

During the tests, it became clear that with limited resources
_(small database memory, low system configuration, etc.)_,
the best solution was to limit the number of chats, for
less load on the infrastructure of the bot. If you want,
whitelist can be cut out of the code, perhaps later will
be created a separate branch for this, but not for sure

> Q: Is the privacy of conversations with the privacy mode disabled violated?

No, it is not violated. The advantage of this bot is that it:

1. Does not log messages received from the Telegram API
2. Processes only stickers, emojis and voice/video messages,
thanks to a convenient filter provided by the grammY library.
If you want to make sure of this, look at the folder with [handlers](https://github.com/SecondThundeR/anya-bot-ts/tree/main/src/handlers)

## License

This repository is licensed under [MIT License](https://github.com/SecondThundeR/anya-bot-ts/blob/main/LICENSE)
