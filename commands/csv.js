const {SlashCommandBuilder} = require('discord.js');
const {executeCsv} = require('./lib/executeCsv.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('csv')
        .setDescription('csvファイル形式で予定を登録します'),
    async execute(interaction, client) {
        await executeCsv(interaction, client);
    },
};