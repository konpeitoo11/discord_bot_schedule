const { REST, Routes } = require('discord.js');
const {clientId, guildId, token} = require('./config.json');
const fs = require('fs');

const commands = [];
const commonFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commonFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async() => {
    try {
        console.log(`${commands.length} commands will be added.`);

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        //console.log(`${data.length} commands have been added.`);
    } catch (error) {
        console.error(error);
    }
})();