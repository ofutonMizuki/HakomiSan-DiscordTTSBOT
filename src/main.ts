import { Client, Intents } from 'discord.js';
import * as log4js from 'log4js';

const logger = log4js.getLogger();
logger.level = 'debug';

const config = require(process.argv[2]);
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});

client.on('ready', () => {
    logger.info(`I am ready!`);
});

client.login(config.token);

function shutdown() {
    logger.info(`shutdown`);
    client.destroy();
    process.exit();
}

process.on('uncaughtException', async (err) => {
    logger.fatal(err);
    shutdown();
});

process.on("SIGINT", () => {
    shutdown();
});