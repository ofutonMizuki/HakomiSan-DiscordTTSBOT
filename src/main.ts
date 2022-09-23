import { Client, CommandInteraction, GuildMember, Intents, Interaction, Message, MessageEmbed } from 'discord.js';
import * as HakomiUtil from './util';
import * as InteractionUtil from './interaction';
import { Info } from './info';
import { DictionaryManager } from './dictionary';
let dictionaryManager = new DictionaryManager();

import { ConnectionManager } from './connect';
let connectionManager = new ConnectionManager();

//設定ファイルの読み込み
const config = require(process.argv[2]);

import { Voice } from "./voice";
let voice = new Voice(config.url);

//log4jsの初期設定
import * as log4js from 'log4js';
const logger = log4js.getLogger();
logger.level = 'debug';

//クライアントを新規作成
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});

//ログインする
client.login(config.token);

//準備完了したら
client.on('ready', () => {
    logger.info(`I am ready!`);
    if (client.application) {
        client.application.commands.set([
            {
                name: "connect",
                description: '接続'
            },
            {
                name: 'disconnect',
                description: '切断'
            },
            {
                name: "addchannel",
                description: 'テキストチャンネルを追加'
            },
            {
                name: 'addword',
                description: '辞書に追加',
                options: [
                    {
                        type: "STRING",
                        name: "word",
                        required: true,
                        description: '登録する単語'
                    },
                    {
                        type: "STRING",
                        name: "read",
                        required: true,
                        description: '登録する読み'
                    }
                ]
            },
            {
                name: 'deleteword',
                description: '単語を削除',
                options: [
                    {
                        type: "STRING",
                        name: "word",
                        required: true,
                        description: '削除する単語'
                    }
                ]
            },
            {
                name: 'selectspeaker',
                description: '話者を設定'
            }
        ])
    }
});

function replyError(message: Message) {
    let info = new Info("エラーが発生しました", 5);

    replyMessage(message, info);
}

function replyMessage(message: Message, info: Info) {
    //埋め込みの内容を生成
    const embed = new MessageEmbed()
        .setColor(HakomiUtil.levelToColor(info.getLevel()))
        .setTitle(info.getMessage());
    HakomiUtil.addCommonEmbed(embed);

    //メッセージに返信
    message.reply({ embeds: [embed] });
}

client.on('messageCreate', async (message: Message) => {
    //もしbotなら
    if (message.author.bot) {
        return;
    }

    try {
        if (message.content.startsWith(`${config.prefix}connect`) || message.content.startsWith(`${config.prefix}c`)) {
            //ボイスチャンネルへ接続を試みる
            let info = connectionManager.connect(message);

            replyMessage(message, info);

            logger.info(info.getMessage());
        }
        else if (message.content.startsWith(`${config.prefix}disConnect`) || message.content.startsWith(`${config.prefix}dc`)) {
            //ボイスチャンネルから切断を試みる
            let info = connectionManager.disConnect(message);

            replyMessage(message, info);

            logger.info(info.getMessage());
        }
        //それ以外なら読み上げを試みる
        else {
            let guildID = message.guildId;
            if (guildID) {
                let content: string = dictionaryManager.replace(guildID, message.content);

                //connectionの取得を試みて、もし取得できたら発声する
                let connection = connectionManager.getConnection(message);
                if (connection) {
                    try {
                        voice.speech(connection, content, message.author.id);
                        logger.info(`speech: ${content}`);
                    } catch (error) {
                        const info = new Info('音声合成に失敗しました', 4);
                        replyMessage(message, info);
                        logger.error(info.getMessage());
                    }
                }
            }
        }
    } catch (error) {
        replyError(message);

        logger.error(error);
    }

})

client.on('interactionCreate', async (interaction: Interaction) => {
    try {
        await InteractionUtil.interaction(interaction, connectionManager, dictionaryManager, voice)
            .catch(error => {
                throw error
            });
    } catch (error) {
        logger.error(error);
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

client.on('shardReconnecting', (id) => {
    logger.warn(`shardReconnecting: ${id}`);
})

client.on('debug', (message) => {
    logger.debug(message);
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