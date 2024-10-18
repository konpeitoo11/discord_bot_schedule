const {SlashCommandBuilder} = require('discord.js');
const {executeRegister} = require('./lib/executeRegister.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('予定を登録します'),
    async execute(interaction) {
        await executeRegister(interaction);
    },
};