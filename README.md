# anti-premium-stickers-bot

TypeScript bot for auto-deleting of Telegram premium stickers with some interesting features based on the grammY library

> This bot was created as an additional tool to fight against premium Telegram stickers, the animations of which make any device shudder

## Features

- **Removes premium stickers**
- Handy white/ignore lists configuration from DM
- Locale configuration via commands
- and more... _(maybe)_

## Setup

## Local

1. Create a new bot and get a bot token
2. Install `redis-cli` and `node.js`
3. Create environment variables in your system:
    - `BOT_KEY` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM
4. Clone this repository
5. Open and edit in `bot.ts` call for `createClient` from:

    ```ts
    const client: RedisClientType = createClient({
        url: `redis://${redisUser}:${redisPass}@${redisURL}:${redisPort}`,
    });
    ```

    to

    ```ts
    const client: RedisClientType = createClient();
    ```

    This function call will use your local Redis DB

6. Run `npm i` and `npm start`
7. Wait for `Starting bot` log message
8. Bot is ready to go!

### Heroku

1. Create a new bot and get a bot token
2. Create a new Redis database and get: Username, Password, Host and Port

    > How to create a Redis database, create a user and get the necessary data to connect will not be written here
3. Create a new pipeline in Heroku, the application in it and set neccessary config vars in the settings:
    - `BOT_KEY` - bot token
    - `CREATOR_ID` - your ID for working with the bot whitelist/ignored list from the DM
    - `REDIS_USER` - name of Redis DB user
    - `REDIS_PASS` - password of Redis DB user
    - `REDIS_URL` - endpoint of Redis DB
    - `REDIS_PORT` - port of Redis DB endpoint
4. Push sources on Heroku _(or set up auto-deployment)_ and wait for build
5. Wait for `Starting bot` log message
6. Bot is ready to go!

> If something doesn't work, check the application logs in Heroku or locally and try googling the problem. If nothing helps, open an Issue with a detailed description of the problem

## Bot commands

Group commands:

- `silent` - manage bot silent mode
- `help` - send help message
- `silentonlocale` - change message when silent mode is enabled
- `silentonlocalereset` - reset message when silent mode is enabled
- `silentofflocale` - change message when silent mode is disabled
- `silentofflocalereset` - reset message when silent mode is disabled
- `messagelocale` - change message when bot removes stickers
- `messagelocalereset` - reset message when bot removes stickers

DM commands:

- `addwhitelist` - add group ID to white list
- `removewhitelist` - remove group ID from white list
- `getwhitelist` - get all groups info from white list
- `addignorelist` - add group ID to ignore list
- `removeignorelist` - remove group ID from ignore list
- `getignorelist` - get all groups ID from ignore list

## Bot locale configuration

The entire locale is now stored in the `locale.ts` file. Some words can be changed for chats using the commands above with `locale` substring in it

## FAQ

- Q: How white/ignore lists are working?

> A: When a bot is added to an unknown group, you will be prompted to add the group to the whitelist, reject it, or add it to the ignore list. The ignore list is used to prevent the bot from sending you information about future additions to the group that you have set to ignore. In the case of a simple rejection, you will continue to receive information about the following additions, if suddenly, you decide to add a new group later

## License

This repository is licensed under [MIT License](https://github.com/SecondThundeR/anti-premium-stickers-bot/blob/main/LICENSE)
