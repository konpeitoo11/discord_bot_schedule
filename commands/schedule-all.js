const {SlashCommandBuilder} = require('discord.js');
const {executeScheduleAll} = require('./lib/executeScheduleAll.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule-all')
        .setDescription('登録されている全ての予定を表示します'),
    async execute(interaction) {
        await executeScheduleAll(interaction);
    },
};