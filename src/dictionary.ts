import * as fs from 'fs';
import { Info } from './info';
const path = './dictionary.json';

//ギルド
class Guilds {
    [key: string]: Dictionary;
}

//辞書
class Dictionary {
    words: { key: string, read: string }[];

    constructor() {
        this.words = new Array();
    }
}

export class DictionaryManager {
    private guilds: Guilds;

    constructor() {
        if (fs.existsSync(path)) {
            this.guilds = JSON.parse(fs.readFileSync(path).toString());
        }
        else {
            this.guilds = new Guilds();
        }
    }

    replace(guildID: string, message: string) {
        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Dictionary();
        }

        let dictionary = this.guilds[guildID];

        for (let i = 0; i < dictionary.words.length; i++) {
            let buf = message.split(dictionary.words[i].key);
            message = buf.join(dictionary.words[i].read);
        }

        return message;
    }

    saveDictionary() {
        fs.writeFileSync(path, JSON.stringify(this.guilds, null, "\t"));
    }

    addWord(guildID: string, key: string, read: string) {
        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Dictionary();
        }

        let index = -1;
        for (let i = 0; i < this.guilds[guildID].words.length; i++) {
            if (this.guilds[guildID].words[i].key == key) {
                index = i;
                break;
            }
        }

        let info: Info;
        if (index == -1) {
            this.guilds[guildID].words.push({ key: key, read: read });
            info = new Info(`単語: [${key}], 読み: [${read}] を登録しました`, 2);
        }
        else {
            this.guilds[guildID].words[index] = { key: key, read: read };
            info = new Info(`単語: [${key}], 読み: [${read}] に置換しました`, 2);
        }

        this.saveDictionary();

        return info;
    }

    deleteWord(guildID: string, key: string){
        //もしギルドが登録されていなかったらギルドを登録
        if (!(guildID in this.guilds)) {
            this.guilds[guildID] = new Dictionary();
        }
        
        let count = 0;
        for (let i = 0; i < this.guilds[guildID].words.length; i++) {
            if (this.guilds[guildID].words[i].key == key) {
                this.guilds[guildID].words.splice(i, 1);
                i--;
                count++;
            }
        }

        let info: Info;
        if(count == 0){
            info = new Info(`単語が見つかりませんでした`, 3);
        }
        else{
            info = new Info(`単語: [${key}] を削除しました`, 2);
        }

        this.saveDictionary();

        return info;
    }
}