# anti-premium-stickers-bot

Simple TypeScript bot for auto-deleting Telegram premium stickers based on grammY library

## Setup

### Local

To use the bot locally, you need a bot token and an installed Redis CLI on your computer.
1. Open the `bot.ts` file and enter the bot token or add `BOT_KEY` to the system environment
2. Edit `bot.ts` and change `const client: ... = createClient({ url: ... });` to `const client: ... = createClient();` to use a local Redis instance
3. Install all dependencies via `npm install`.
4. Run `npm start`.
5. Bot is ready to go!

### Heroku

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

> If something is not working, check the application logs in Heroku or in the system console and try to google the problem. If nothing helps, open the problem with a detailed description of the problem

## Locale Configuration

All locale strings are moved to the `locale.ts` file. Also, at runtime, users can change the locale for their group via related commands (administrators can see them via the `help` command)

## License

This repository is licensed under [MIT License](https://github.com/SecondThundeR/anti-premium-stickers-bot/blob/main/LICENSE)
