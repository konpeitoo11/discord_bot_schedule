const fs = require('fs').promises;
const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType} = require('discord.js');
module.exports.executeDelete = async function (interaction) {
    //await interaction.deferReply({ephemeral: true});
    const user = interaction.user.id;
    const filePath = './data/' + user + '.json';
    try{
        const data = await fs.readFile(filePath, 'utf-8');
        const schedule = JSON.parse(data);

        const options = await schedule.map((value, index) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel((index + 1).toString())
                .setDescription(value.date + ' ' + value.time + ' ' + value.context)
                .setValue(index.toString());
        });
        const select = new StringSelectMenuBuilder()
			.setCustomId('selectSchedule')
			.setPlaceholder('削除する予定の番号を入力してください\n')
			.addOptions(options);

		const row = new ActionRowBuilder()
			.addComponents(select);

		const response = await interaction.reply({
			components: [row],
            ephemeral: true
		});

        //const __filter = m => m.author.id === interaction.user.id;
        //const collector = interaction.channel.createMessageCollector({filter: __filter, time: 30000});
        const collector = response.createMessageComponentCollector({componentType: ComponentType.StringSelect, time: 30000});

        collector.on('collect', async message => {
            const index = parseInt(message.values[0]);

            //予定の削除
            schedule.splice(index, 1);
            try{
                await message.reply({content: '削除しました', ephemeral: true});//message自体にreplyしないと(3秒以内)インタラクションに失敗した判定になる
                await response.delete();
                await fs.writeFile(filePath, JSON.stringify(schedule, null, 4));
                collector.stop();
            }catch(error){
                console.log(error);
                collector.stop();
                return message.reply({content: '削除に失敗しました'});
            }
            
        });
        collector.on('error', error => {
            console.error('コレクターでエラーが発生しました:', error);
        });

        collector.on('end', collected =>{
            console.log(collected.size)
            if(collected.size === 0){
                interaction.followUp({content: 'タイムアウトしました'});
            }
        });
    }catch(error){
        console.log(error);
    }
};