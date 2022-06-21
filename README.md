# anti-premium-stickers-bot

Simple TypeScript bot for auto-deleting Telegram premium stickers based on grammY library

> This README will show how to use this bot only on Heroku. For other uses, just use Google.

## Heroku Setup

1. Create a new bot and get a bot token
2. Create a new Redis database and get: Username, Password, Host and Port _(How to create a Redis database, create a user and get the necessary data to connect will not be written here)_
3. Create a new pipeline in Heroku, the application in it and set neccessary config vars in the settings:
    - BOT_KEY - bot token
    - REDIS_USER - name of Redis DB user
    - REDIS_PASS - password of Redis DB user
    - REDIS_URL - endpoint of Redis DB
    - REDIS_PORT - port of Redis DB endpoint
4. Push sources on Heroku _(or set up auto-deployment)_ and wait for build
5. Try sending a Premium sticker or sending the `/silent` command to check if the bot is working
6. Bot is ready to go!

> If something doesn't work, check the application logs in Heroku and try googling the problem. If nothing helps, open an Issue with a detailed description of the problem

## Bot configuration

The only thing that is still customizable in the bot, are the lines in the response. In this bot, the lines are customized for a character from the same anime.

To change the lines for yourself, go into `bot.ts` and change these variables:

- `silentMessages` object contains messages for the `/silent` command. `silentEnabled` is sent if the silent command is enabled and `silentDisabled` otherwise
- `messageText` variable in the `bot.on("message:sticker"...`) listener is sent when the Premium sticker has been removed and silent mode is disabled. It also contains a mention of the user, which can be removed if not needed

## License

This repository is licensed under [MIT License](https://github.com/SecondThundeR/anti-premium-stickers-bot/blob/main/LICENSE)
