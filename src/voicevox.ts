import fetch from "node-fetch";

export declare type SpeakerData = {
    name: string;
    speaker_uuid: string;
    version: string;
    styles: {
        name: string;
        id: number;
    }[];
}[];

export declare type Mora = {
    text: string;
    consonant: string;
    consonant_length: number;
    vowel: string;
    vowel_length: number;
    pitch: number;
};

export declare type Query = {
    accent_phrases: {
        moras: Mora[];
        accent: number;
        pause_mora: Mora;
    };
    speedScale: number;
    pitchScale: number;
    intonationScale: number;
    volumeScale: number;
    prePhonemeLength: number;
    postPhonemeLength: number;
    outputSamplingRate: number;
    outputStereo: boolean;
    kana: string;
};


export class VoiceVoxWrapper {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async getSpeakers() {
        try {
            const response = await fetch(`${this.url}/speakers`, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }
            const json = await response.json();
            return <SpeakerData>json;
        } catch (error) {
            throw error;
        }
    }

    async createVoice(speakerID: number, text: string) {
        try {
            let response = await fetch(`${this.url}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerID}`, { method: 'POST' });
            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }
            const query = (await response.json()) as Query;

            response = await fetch(`${this.url}/synthesis?speaker=${speakerID}`, { method: 'POST', body: JSON.stringify(query), headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) {
                throw new Error(`${response.statusText}`);
            }
            const data = await response.arrayBuffer();

            return data;
        } catch (error) {
            throw error;
        }
    }
}