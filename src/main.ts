import { Client, GuildMember, Intents, Message, StageChannel, VoiceChannel } from 'discord.js';
import { ConnectionManager, speech } from './connect';
let connectionManager = new ConnectionManager();

import { Voice } from "./voice";
let voice = new Voice();

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

client.on('messageCreate', async (message: Message) => {
    //もしbotなら
    if (message.author.bot) {
        return;
    }
    if (message.content.startsWith(`${config.prefix}connect`) || message.content.startsWith(`${config.prefix}c`)) {
        //ボイスチャンネルへ接続を試みる
        try {
            connectionManager.connect(message);

            message.reply('接続しました');
            logger.info('接続しました');
        }
        catch (error) {
            if(error instanceof Error){
                message.reply(error.message);
            }
            logger.error(error);
        }
    }
    else if (message.content.startsWith(`${config.prefix}disConnect`) || message.content.startsWith(`${config.prefix}dc`)) {
        //ボイスチャンネルから切断を試みる
        try {
            connectionManager.disConnect(message);

            message.reply('切断しました');
            logger.info('切断しました');
        }
        catch (error) {
            if(error instanceof Error){
                message.reply(error.message);
            }
            logger.error(error);
        }
    }
    //それ以外なら読み上げを試みる
    else {
        //connectionの取得を試みて、もし取得できたら発声する
        try {
            let connection = connectionManager.getConnection(message);
            if (connection) {
                let name = await voice.createVoice(message.content);
                speech(connection, name);
                logger.info(`speech: ${name}`);
            }
        } catch (error) {
            logger.error(error);
        }
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    //もし強制的に切断されたら登録を解除する
    if (oldState.channelId != null && newState.channelId === null) {
        if (client.user != null && newState.id == client.user.id) {
            try {
                connectionManager.deleteConnect(oldState.guild.id);
    
                logger.info('解除しました');
            }
            catch (error) {
                logger.info(error);
            }
        }
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