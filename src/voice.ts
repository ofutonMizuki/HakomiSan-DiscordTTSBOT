import { Client } from 'voicevox-api-client';
import fs from 'fs';
import * as crypto from 'crypto';

function createHash(text: string) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

export class Voice {
    private client: Client;

    //初期化
    constructor(url: string) {
        this.client = new Client(url);
    }

    //音声を生成
    async createVoice(text: string) {
        let hash = createHash(text);

        const query = await this.client.query.createQuery(0, text);
        const voice = await this.client.voice.createVoice(0, query);
        const buf = Buffer.from(voice);
        fs.writeFileSync(`./wav/${hash}.wav`, buf);

        return hash;
    }
}