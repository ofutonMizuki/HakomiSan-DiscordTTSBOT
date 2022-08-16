import { CommandInteraction, GuildMember, Interaction, MessageEmbed } from 'discord.js';
import { ConnectionManager } from './connect';
import { DictionaryManager } from './dictionary';
import { Info } from './info';
import * as HakomiUtil from './util';

export function interaction(interaction: Interaction, connectionManager: ConnectionManager, dictionaryManager: DictionaryManager) {
    try {
        if (interaction.isCommand()) {
            if (interaction.commandName == 'connect') {
                let member = interaction.member;
                if (member instanceof GuildMember || member == null) {
                    //ボイスチャンネルへ接続を試みる
                    let info = connectionManager.createConnect(member, interaction.channel);

                    replyInteraction(interaction, info);

                    return info.getMessage();
                }
                else {
                    throw new Error("member = APIInteractionGuildMember");
                }
            }
            else if (interaction.commandName == 'disconnect') {
                //ボイスチャンネルから切断を試みる
                let info = connectionManager.deleteConnect(interaction.guildId);

                replyInteraction(interaction, info);

                return info.getMessage();
            }
            else if (interaction.commandName == 'addword') {
                let guildID = interaction.guildId;
                let word = interaction.options.getString('word');
                let read = interaction.options.getString('read');
                if (guildID && word && read) {
                    let info = dictionaryManager.addWord(guildID, word, read);

                    replyInteraction(interaction, info);
                }
                else{
                    throw new Error('なにか足りない');
                }
            }
            else if (interaction.commandName == 'deleteword') {
                let guildID = interaction.guildId;
                let word = interaction.options.getString('word');
                if (guildID && word) {
                    let info = dictionaryManager.deleteWord(guildID, word);

                    replyInteraction(interaction, info);
                }
                else{
                    throw new Error('なにか足りない');
                }
            }
        }
    } catch (error) {
        replyErrorInteraction(interaction);

        throw error;
    }
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
    HakomiUtil.addCommonEmbed(embed);

    interaction.reply({
        embeds: [embed]
    }).catch(error => {
        throw error;
    })
}