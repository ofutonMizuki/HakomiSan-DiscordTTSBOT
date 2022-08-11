import { Client, CommandInteraction, GuildMember, Intents, Interaction, Message, MessageEmbed } from 'discord.js';
import * as HakomiUtil from './util';
import { Info } from './info';

import { ConnectionManager, speech } from './connect';
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
    HakomiUtil.addCommonEmbed(embed, client.user);

    //メッセージに返信
    message.reply({ embeds: [embed] });
}

function replyErrorInteraction(interaction: Interaction) {
    let info = new Info("エラーが発生しました", 5);

    if (interaction.isCommand()) {
        replyInteraction(interaction, info);
    }
}

function replyInteraction(interaction: CommandInteraction, info: Info) {
    //埋め込みの内容を生成
    const embed = new MessageEmbed()
        .setColor(HakomiUtil.levelToColor(info.getLevel()))
        .setTitle(info.getMessage());
    HakomiUtil.addCommonEmbed(embed, client.user);

    interaction.reply({
        embeds: [embed]
    }).catch(error => {
        logger.error(error);
    })
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
            //connectionの取得を試みて、もし取得できたら発声する
            let connection = connectionManager.getConnection(message);
            if (connection) {
                let name = await voice.createVoice(message.content);
                speech(connection, name);
                logger.info(`speech: ${name}`);
            }
        }
    } catch (error) {
        replyError(message);

        logger.error(error);
    }

})

client.on('interactionCreate', (interaction: Interaction) => {
    try {
        if (interaction.isCommand()) {
            if (interaction.commandName == 'connect') {
                let member = interaction.member;
                if (member instanceof GuildMember || member == null) {
                    //ボイスチャンネルへ接続を試みる
                    let info = connectionManager.createConnect(member, interaction.channel);

                    replyInteraction(interaction, info);

                    logger.info(info.getMessage());
                }
                else {
                    throw new Error("member = APIInteractionGuildMember");
                }
            }
            else if (interaction.commandName == 'disconnect') {
                //ボイスチャンネルから切断を試みる
                let info = connectionManager.deleteConnect(interaction.guildId);

                replyInteraction(interaction, info);

                logger.info(info.getMessage());
            }
        }
    } catch (error) {
        replyErrorInteraction(interaction);

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