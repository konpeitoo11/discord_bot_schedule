const {SlashCommandBuilder} = require('discord.js');
const { executeSetconfig } = require('./lib/executeSetconfig.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('設定を変更します'),
    async execute(interaction) {
        await executeSetconfig(interaction);
    },
};