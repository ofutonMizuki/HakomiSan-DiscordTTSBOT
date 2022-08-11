import { MessageEmbed, User } from 'discord.js';

export function addCommonEmbed(embed: MessageEmbed) {
    embed
        .addFields(
            {
                name: "公式リポジトリ",
                value: "[https://github.com/ofutonMizuki/HakomiSan-DiscordTTSBOT](https://github.com/ofutonMizuki/HakomiSan-DiscordTTSBOT)",
            }
        )
        .setTimestamp();
}

export function levelToColor(level: number) {
    switch (level) {
        case 0:
            return 0x000000;
            break;
        case 1:
            return 0x00ffff;
            break;
        case 2:
            return 0x00ff00;
            break;
        case 3:
            return 0xffff00;
            break;
        case 4:
            return 0xff0000;
            break;
        case 5:
            return 0xff00ff;
            break;
    }

    return 0x000000;
}