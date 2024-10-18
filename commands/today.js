const {SlashCommandBuilder} = require('discord.js');
const {executeToday} = require('./lib/executeToday.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('today')
        .setDescription('今日の予定を表示します'),
    async execute(interaction) {
        await executeToday(interaction);
    },
};