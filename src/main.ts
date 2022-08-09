import { Client, Intents } from 'discord.js';

//log4jsの初期設定
import * as log4js from 'log4js';
const logger = log4js.getLogger();
logger.level = 'debug';

//設定ファイルの読み込み
const config = require(process.argv[2]);

//クライアントを新規作成
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});

//ログインする
client.login(config.token);

//準備完了したら
client.on('ready', () => {
    logger.info(`I am ready!`);
});

//なにかよくわからないエラーに遭遇したら
process.on('uncaughtException', async (err) => {
    logger.fatal(err);
    shutdown();
});

//Ctrl+Cとか押されたら
process.on("SIGINT", () => {
    shutdown();
});

//シャットダウンする
function shutdown() {
    logger.info(`shutdown`);
    client.destroy();
    process.exit();
}