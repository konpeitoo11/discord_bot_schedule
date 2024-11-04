const fs = require('fs').promises;
const {ActionRowBuilder, ButtonBuilder} = require('discord.js');
const {createDefaultConfig} = require('./createDefaultConfig.js');
const {checkConfigfileExist} = require('./checkConfigfileExist.js');
module.exports.executeSetconfig = async function (interaction) {
    const filePath = './config/';
    const fileName = interaction.user.id + '.json';
    const userFilePath = filePath + fileName;

    checkConfigfileExist(userFilePath);
    try{
        const data = await fs.readFile(userFilePath, 'utf-8');
        const config = JSON.parse(data);
        const scheduleDeleteorNot = config.scheduleDeleteorNot;
        const leaveSchedule = new ButtonBuilder()
            .setCustomId('leaveSchedule')
            .setLabel('過ぎた予定を残す')
            .setStyle('Primary')
            .setDisabled(!scheduleDeleteorNot);

        const deleteSchedule = new ButtonBuilder()
            .setCustomId('deleteSchedule')
            .setLabel('過ぎた予定を削除')
            .setStyle('Primary')
            .setDisabled(scheduleDeleteorNot);

        const row = new ActionRowBuilder()
            .addComponents(leaveSchedule, deleteSchedule);
        
        const response = await interaction.reply({content: '設定を変更します', components: [row], ephemeral: true});
        const controllerfilter = i => i.user.id === interaction.user.id;
        try{
            const confirmation = await response.awaitMessageComponent({filter: controllerfilter, time: 30000});
            if(confirmation.customId === 'leaveSchedule'){
                config.scheduleDeleteorNot = false;
                await fs.writeFile(userFilePath, JSON.stringify(config, null, 4));
                await confirmation.update({content: '過ぎた予定を残します', components: []});
            }else if(confirmation.customId === 'deleteSchedule'){
                config.scheduleDeleteorNot = true;
                await fs.writeFile(userFilePath, JSON.stringify(config, null, 4));
                await confirmation.update({content: '過ぎた予定を削除します', components: []});
            }
        }catch(error){
            console.error('ボタンの操作に失敗しました: ', error);
        }
    }catch(error){
        console.error('ファイルの読み込みに失敗しました: ', error);
    }
}