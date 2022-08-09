import * as voice from '@discordjs/voice';
import { StageChannel, VoiceChannel } from 'discord.js';

//ギルド
class Guilds {
    [key: string]: Connection;
}

class Connection {
    textChannelID: string;
    connection: voice.VoiceConnection | undefined;
    constructor() {
        this.textChannelID = '';
        this.connection = undefined;
    }
}

class ConnectionManager {
    private guilds: Guilds = new Guilds();

    public connect(voiceChannel: VoiceChannel | StageChannel | null, textChannelID: string) {
        //もしボイスチャンネルに接続されていなかったら
        if (!voiceChannel) {
            throw new Error("ボイスチャンネルに接続されていません");
        }

        let guildID: string = voiceChannel.guildId;

        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Connection();
        }

        //もしボイスチャンネルの接続権限がなかったら
        if (!voiceChannel.joinable) {
            throw new Error("ボイスチャンネルに接続できません");
        }
        //もしすでに接続しているのならば
        else if (this.guilds[guildID].connection && (<voice.VoiceConnection>(this.guilds[guildID].connection)).state.status == voice.VoiceConnectionStatus.Ready) {
            throw new Error("すでに接続されています");
        }
        else {
            //コネクションを生成
            const connection = voice.joinVoiceChannel({
                adapterCreator: voiceChannel.guild.voiceAdapterCreator as unknown as voice.DiscordGatewayAdapterCreator,
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                selfDeaf: true,
                selfMute: false,
            });

            //必要な情報を登録する
            this.guilds[guildID].connection = connection;
            this.guilds[guildID].textChannelID = textChannelID;

            return;
        }
    }

    disConnect(guildID: string){
        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Connection();
        }

        let connection = this.guilds[guildID].connection;

        //もしコネクションが存在したなら
        if(connection != undefined){
            //コネクションを破棄
            connection.destroy();
        }
        this.guilds[guildID].textChannelID = '';
        this.guilds[guildID].connection = undefined;
    }
}

module.exports = ConnectionManager;