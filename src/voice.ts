//import { Client, SpeakerData } from 'voicevox-api-client';
import * as voice from '@discordjs/voice';
import { SpeakerData, VoiceVoxWrapper } from './voicevox';
import fs from 'fs';
import * as crypto from 'crypto';
import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { Info } from './info';
const path = './voiceSettings.json';

function createHash(text: string) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

class Settings {
    [id: string]: number;
}

export class Voice {
    private client: VoiceVoxWrapper;
    private Settings: Settings;

    //初期化
    constructor(url: string) {
        this.client = new VoiceVoxWrapper(url);

        if (fs.existsSync(path)) {
            this.Settings = JSON.parse(fs.readFileSync(path).toString());
        }
        else {
            this.Settings = new Settings();
        }
    }

    saveSettings() {
        fs.writeFileSync(path, JSON.stringify(this.Settings, null, "\t"));
    }

    async viewSpeakers(interaction: CommandInteraction) {
        await this.client.getSpeakers()
            .then(async speakers => {
                let arraySpeakers = new Array();
                let count = 0;
                for (const speaker of speakers) {
                    for (let i = 0; i < speaker.styles.length; i++) {
                        if (count % 25 == 0) {
                            arraySpeakers[Math.floor(count / 25)] = new Array();
                        }
                        arraySpeakers[Math.floor(count / 25)].push({
                            label: `${speaker.name}: ${speaker.styles[i].name}`,
                            value: speaker.styles[i].id.toString()
                        });

                        count++;
                    }
                }

                let row = new Array();

                for (let i = 0; i < Math.floor(count / 25) + 1; i++) {
                    let _row = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId(`speaker${i}`)
                                .setPlaceholder('話者を選択してください')
                                .addOptions(arraySpeakers[i]),
                        );
                    row.push(_row);
                }

                await interaction.reply({ content: '話者を選択してください', components: row, ephemeral: true })
                    .catch(error => {
                        throw error;
                    })
            })
            .catch(error => {
                throw error;
            })
    }

    selectSpeaker(interaction: SelectMenuInteraction) {
        let message = interaction.message;
        if (message instanceof Message) {
            const user = interaction.user;
            const selectMenu = interaction.component;
            const voiceID = interaction.values[0];
            let n = 0;
            for (let i = 0; i < selectMenu.options.length; i++) {
                if (selectMenu.options[i].value == voiceID) {
                    n = i;
                    break;
                }
            }

            this.Settings[user.id] = Number(voiceID);

            this.saveSettings();

            return new Info(`話者を｢${selectMenu.options[n].label}｣に設定しました`, 2);
        }
        else {
            throw new Error("messageはMessageではありません");
        }
    }

    //音声を生成
    async createVoice(text: string, userID: string) {
        let hash = createHash(text);

        if (!this.Settings[userID]) {
            this.Settings[userID] = 0;
        }

        const voice = await this.client.createVoice(this.Settings[userID], text);
        //const query = await this.client.query.createQuery(this.Settings[userID], text);
        //const voice = await this.client.voice.createVoice(this.Settings[userID], query);
        const buf = Buffer.from(voice);
        fs.writeFileSync(`./wav/${hash}.wav`, buf);

        return hash;
    }
    
    async speech(connection: voice.VoiceConnection | undefined, text: string, userID: string) {
        //もし_voiceConnectionがundefinedではないなら読み上げる
        if (connection != undefined) {
            const fileName = await this.createVoice(text, userID);

            const player = voice.createAudioPlayer();
            connection.subscribe(player);
            player.play(voice.createAudioResource(`./wav/${fileName}.wav`));
        }
        else {
            throw new Error('connectionはundefinedです');
        }
    }
}