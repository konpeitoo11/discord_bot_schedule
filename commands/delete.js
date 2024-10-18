const {SlashCommandBuilder} = require('discord.js');
const {executeDelete} = require('./lib/executeDelete.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('作成した予定を削除します'),
    async execute(interaction) {
        await executeDelete(interaction);
    },
};