import { Client, Intents } from 'discord.js';
const config = require(process.argv[2]);

const client = new Client({
    intents: []
});

client.on('ready', () => {
    console.log(`I am ready!`);
    if (client.application) {
        client.application.commands.set([
            {
                name: "connect",
                description: '接続'
            },
            {
                name: 'disconnect',
                description: '切断'
            }
        ]).catch(console.error).then(() => {

            client.destroy();
            process.exit();
        })
    }
});

client.login(config.token);