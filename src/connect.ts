import * as voice from '@discordjs/voice';
import { Message, StageChannel, VoiceChannel } from 'discord.js';

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

export class ConnectionManager {
    private guilds: Guilds = new Guilds();

    constructor() {

    }

    getConnection(message: Message) {
        let guildID = message.guildId;

        if (!guildID) {
            throw new Error("メッセージはギルド内ではありません");

        }
        return this.guilds[guildID].connection;
    }

    connect(message: Message) {
        //メッセージを送信したユーザが参加しているボイスチャンネルを取得
        let voiceChannel: VoiceChannel | StageChannel | null = null;
        if (message.member) {
            voiceChannel = message.member.voice.channel;
        }

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
            this.guilds[guildID].textChannelID = message.channelId;

            return;
        }
    }

    disConnect(message: Message) {
        let guildID = message.guildId;

        this.deleteConnect(guildID);
    }

    deleteConnect(guildID: string | null){
        if (!guildID) {
            throw new Error();

        }
        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Connection();
        }

        let connection = this.guilds[guildID].connection;

        //もしコネクションが存在したなら
        if (connection != undefined) {
            //コネクションを破棄
            connection.destroy();
            this.guilds[guildID].textChannelID = '';
            this.guilds[guildID].connection = undefined;
        }
        else {
            this.guilds[guildID].textChannelID = '';
            this.guilds[guildID].connection = undefined;
            throw new Error("接続されていません");
        }
    }
}

export function speech(connection: voice.VoiceConnection | undefined, fileName: string) {
    //もし_voiceConnectionがundefinedではないなら読み上げる
    if (connection != undefined) {
        const player = voice.createAudioPlayer();
        connection.subscribe(player);
        player.play(voice.createAudioResource(`./wav/${fileName}.wav`));
    }
    else{
        throw new Error('connectionはundefinedです');
    }
}