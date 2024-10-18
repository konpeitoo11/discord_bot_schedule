const scheduleAll = require('../schedule-all');

const fs = require('fs').promises;
module.exports.executeScheduleAll = async function (interaction) {
    const user = interaction.user.id;
    const filePath = `./data/${user}.json`;
    try{
        const data = await fs.readFile(filePath, 'utf-8');
        const schedule = JSON.parse(data);
        let sendSchedule = '';
        for(key in schedule){
            const data = schedule[key];
            sendSchedule += `${data.date} ${data.time} ${data.context}\n`;
        }
        if(sendSchedule === ''){
            await interaction.reply({content: '予定が登録されていません', ephemeral: true});
            return;
        }
        await interaction.reply({content: sendSchedule, ephemeral: true});
    }catch(error){
        await interaction.reply({content: '予定が登録されていません', ephemeral: true});
        console.error('ファイルの読み込みに失敗しました: ', error);
    }
};