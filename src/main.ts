import { Client, GuildMember, Intents, Message, StageChannel, VoiceChannel } from 'discord.js';
import {ConnectionManager} from './connect';
let connectionManager = new ConnectionManager();

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

client.on('messageCreate', (message: Message) => {
    //もしbotなら
    if (message.author.bot) {
        return;
    }
    if (message.content.startsWith(`${config.prefix}connect`) || message.content.startsWith(`${config.prefix}c`)) {
        //ボイスチャンネルへ接続を試みる
        try {
            connectionManager.connect(message);

            logger.info('接続しました');
        }
        catch (error) {
            logger.error(error);
        }
    }
    else if (message.content.startsWith(`${config.prefix}disConnect`) || message.content.startsWith(`${config.prefix}dc`)) {
        //ボイスチャンネルから切断を試みる
        try {
            connectionManager.disConnect(message);

            logger.info('切断しました');
        }
        catch (error) {
            logger.error(error);
        }
    }
    //それ以外なら読み上げを試みる
    else {
        //
    }
})

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