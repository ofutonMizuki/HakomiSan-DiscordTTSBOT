import * as voice from '@discordjs/voice';
import { GuildMember, Message, StageChannel, TextBasedChannel, VoiceChannel } from 'discord.js';
import { Info } from "./info";

//ギルド
class Guilds {
    [key: string]: Connection;
}

class Connection {
    textChannelIDs: string[];
    connection: voice.VoiceConnection | undefined;
    constructor() {
        this.textChannelIDs = new Array();
        this.connection = undefined;
    }
}

export class ConnectionManager {
    private guilds: Guilds = new Guilds();

    constructor() {

    }

    getConnection(message: Message) {
        let guildID = message.guildId;
        if (guildID) {
            //もしギルドが登録されていなかったらギルドを登録
            if (!(guildID in this.guilds)) {
                this.guilds[guildID] = new Connection();
            }

            //もし指定されたテキストチャンネルなら
            for (let i = 0; i < this.guilds[guildID].textChannelIDs.length; i++) {
                if (message.channelId == this.guilds[guildID].textChannelIDs[i]) {
                    this.connect(message);
                    let connection = this.guilds[guildID].connection;
                    return connection;
                }
            }
            return undefined;

        }
        else {
            throw new Error("メッセージはギルド内ではありません");

        }
    }

    addChannel(member: GuildMember | null, textChannel: TextBasedChannel | null) {
        if (!textChannel) {
            throw new Error("!textChannel");
        }

        //メッセージを送信したユーザが参加しているボイスチャンネルを取得
        let voiceChannel: VoiceChannel | StageChannel | null = null;
        let me: GuildMember | null = null;
        if (member) {
            voiceChannel = member.voice.channel;
            me = member.guild.me;
        }

        //もしボイスチャンネルに接続されていなかったら
        if (!voiceChannel) {
            return new Info("ボイスチャンネルに接続されていません", 3);
        }

        let guildID: string = voiceChannel.guildId;

        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Connection();
        }

        let connection = this.guilds[guildID].connection;

        //もし音声接続されていなかったら
        if (!connection) {
            return new Info("BOTはボイスチャンネルに接続されていません", 3);
        }

        //もし自分自身を取得できなかったら
        if (!me) {
            throw new Error("!me");
        }

        //ユーザと同じボイスチャンネルに接続されていたら登録する
        if (me.voice.channelId == voiceChannel.id) {
            if(this.guilds[guildID].textChannelIDs.indexOf(textChannel.id) == -1){
                this.guilds[guildID].textChannelIDs.push(textChannel.id);

                return new Info("テキストチャンネルを追加しました", 2);
            }
            else{
                return new Info("すでにこのチャンネルは登録されています", 3);
            }
        }
        else {
            return new Info("違うボイスチャンネルに接続されています", 3);
        }
    }

    connect(message: Message): Info {
        return this.createConnect(message.member, message.channel);
    }

    createConnect(member: GuildMember | null, textChannel: TextBasedChannel | null) {
        //メッセージを送信したユーザが参加しているボイスチャンネルを取得
        let voiceChannel: VoiceChannel | StageChannel | null = null;
        if (member) {
            voiceChannel = member.voice.channel;
        }

        //もしボイスチャンネルに接続されていなかったら
        if (!voiceChannel) {
            return new Info("ボイスチャンネルに接続されていません", 3);
        }

        if (!textChannel) {
            throw new Error("!textChannel");
        }

        let guildID: string = voiceChannel.guildId;

        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Connection();
        }

        //もしボイスチャンネルの接続権限がなかったら
        if (!voiceChannel.joinable) {
            return new Info("ボイスチャンネルに接続できません", 3);
        }
        //もしすでに接続しているのならば
        else if (this.guilds[guildID].connection) {
            return new Info("すでに接続されています", 3);
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
            
            connection.on('stateChange', (oldState, newState) => {
                const oldNetworking = Reflect.get(oldState, 'networking');
                const newNetworking = Reflect.get(newState, 'networking');
              
                const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
                  const newUdp = Reflect.get(newNetworkState, 'udp');
                  clearInterval(newUdp?.keepAliveInterval);
                }
              
                oldNetworking?.off('stateChange', networkStateChangeHandler);
                newNetworking?.on('stateChange', networkStateChangeHandler);
              });

            //必要な情報を登録する
            this.guilds[guildID].connection = connection;
            this.guilds[guildID].textChannelIDs.push(textChannel.id);

            return new Info("接続しました", 2);
        }
    }

    disConnect(message: Message): Info {
        let guildID = message.guildId;

        return this.deleteConnect(guildID);
    }

    deleteConnect(guildID: string | null): Info {
        if (!guildID) {
            throw new Error('ギルドではありません');

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
            this.guilds[guildID].textChannelIDs = new Array();
            this.guilds[guildID].connection = undefined;
            return new Info("切断しました", 2);
        }
        else {
            this.guilds[guildID].textChannelIDs = new Array();
            this.guilds[guildID].connection = undefined;
            return new Info("接続されていません", 3);
        }
    }
}