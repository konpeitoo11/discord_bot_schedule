const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js'); //discord.js から読み込む
//const axios = require('axios');
const fs = require('fs');
const { token } = require('./config.json');
const path = require('path');
const { deletePreviousSchedule } = require('./commands/lib/deletePreviousSchedule.js');
const { remindSchedule } = require('./commands/lib/remindSchedule.js');
//const axios = require('axios');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		//GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
	],
}); //clientインスタンスを作成する

client.once('ready', () => { //ここにボットが起動した際のコードを書く(一度のみ実行)
	console.log('ready'); //黒い画面(コンソール)に「起動完了」と表示させる
});

client.login(token); //ログインする


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if('data' in command) {
        client.commands.set(command.data.name, command);
    }else{
        console.error(`${filePath}に必要な "data" か "execute" がありません`);
    }
}

client.on('interactionCreate', async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command){
        console.error(`コマンドが見つかりません: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました', ephemeral: true });
    }
});
//予定を登録する
/*client.on('messageCreate', message => { 
    if (message.content == 'register') { //もしメッセージが「ping」だったら
        message.reply('pong'); //「pong」と返信する
    }
});*/
const interval = 1000 * 30;//[ms]
setInterval(deletePreviousSchedule, interval);
setInterval(remindSchedule, interval, client);
