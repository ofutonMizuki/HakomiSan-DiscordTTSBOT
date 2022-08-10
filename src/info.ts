export class Info {
    private level: number = 0;
    private message: string = "";
    //levelは0から5(大きい方が重要)を指定
    constructor(message: string, level: number) {
        this.level = level;
        if (level < 0) {
            this.level = 0;
        }
        else if (level > 5) {
            this.level = 5;
        }
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    getLevel() {
        return this.level;
    }
}