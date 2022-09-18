# anya-bot-ts

Some random TypeScript bot with interesting features based on the grammY library

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
2. Install `redis-cli` and `node.js`
3. Clone this repository
4. Open an `.env` file in the root of the folder and change variables into it:
    - `BOT_KEY` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM
5. Run `npm i` and `npm run local`
6. Wait for `Started as @...` message and/or message in PM from bot
7. Bot is ready to go!

> If you want to pass environment variables on your system, all you need to do is run `npm start` in step 5

### Heroku

1. Create a new bot and get a bot token
2. Create a new Redis database and get: Username, Password, Host and Port
    > How to create a Redis database, create a user and get the necessary data to connect will not be written here
3. Create a new pipeline in Heroku, the application in it and set neccessary config vars in the settings:
    - `BOT_KEY` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM (better to pass, as bot won't work correctly without it)
    - `REDIS_USER` - name of Redis DB user
    - `REDIS_PASS` - password of Redis DB user
    - `REDIS_URL` - endpoint of Redis DB
    - `REDIS_PORT` - port of Redis DB endpoint
4. Push sources on Heroku _(or set up auto-deployment)_ and wait for build
5. Wait for `Started as @...` message in console and/or message in PM from bot
6. Bot is ready to go!

#### Note about Heroku

While doing step 3, go to [Heroku Docker Docs](https://devcenter.heroku.com/articles/build-docker-images-heroku-yml#getting-started) and convert the stack into a container.

> If something doesn't work, check the application logs in Heroku or locally and try googling the problem. If nothing helps, open an Issue with a detailed description of the problem

## Bot commands

**Group commands:**

- `silent` - manage bot silent mode
- `help` - send help message
- `aidenmode` - enables "Aiden Pierce" mode _(Removes voice/video messages)_
- `aidensilent` - manage "Aiden Pierce" silent mode
- `noemoji` - triggers emoji strictness removal _(Currently works like on/off switch. Custom rules will be added later)_
- `adminpower` - triggers ignoring of restricted messages from admins
- `silentonlocale` - change message when silent mode is enabled
- `silentonlocalereset` - reset message when silent mode is enabled
- `silentofflocale` - change message when silent mode is disabled
- `silentofflocalereset` - reset message when silent mode is disabled
- `messagelocale` - change message when bot removes stickers
- `messagelocalereset` - reset message when bot removes stickers

**DM commands:**

- `addwhitelist` - add group ID to white list
- `removewhitelist` - remove group ID from white list
- `getwhitelist` - get all groups info from white list
- `addignorelist` - add group ID to ignore list
- `removeignorelist` - remove group ID from ignore list
- `getignorelist` - get all groups ID from ignore list
- `getcommandsusage` - get counters of commands usage
- `uptime` - get current uptime of bot

## Bot locale configuration

The entire locale strings are now stored in the `src/locale`. Some strings can be changed per chat using the commands above with `locale` substring in it.

Remember to change `creatorLink` in `src/locale/otherMessages.ts`, which allows users to contact you for whitelist access

## Changelog

The project now has a separate file [CHANGELOG.md](https://github.com/SecondThundeR/anya-bot-ts/blob/main/CHANGELOG.md). Check it for details

## FAQ

> Q: How white/ignore lists are working?

When the bot is added to an unknown group, you will be prompted to add the group to the whitelist, decline the offer to add, or add it to the ignore list. The ignore list is used to prevent the bot from sending you information about future additions to the group that you have set to the ignore list. In the case of a simple rejection, the bot will not work in the new chat until you add it to the whitelist

> Q: Why were these lists added in the first place?

During the tests, it became clear that with limited resources _(small database memory, low system configuration, etc.)_, the best solution was to limit the number of chats, for less load on the infrastructure of the bot. If you want, whitelist can be cut out of the code, perhaps later will be created a separate branch for this, but not for sure

## License

This repository is licensed under [MIT License](https://github.com/SecondThundeR/anya-bot-ts/blob/main/LICENSE)
