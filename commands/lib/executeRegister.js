const {ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports.executeRegister = async function (interaction) {
        const modal = new ModalBuilder()
            .setCustomId('registerModal')
            .setTitle('予定登録');

        const dateInput = new TextInputBuilder()
            .setCustomId('date')
            .setLabel('日付(yyyy/mm/dd)')
            .setPlaceholder('例: 2021/01/01')
            .setStyle(TextInputStyle.Short);

        const timeInput = new TextInputBuilder()
            .setCustomId('time')
            .setLabel('時間(24時間表記, hh:mm)')
            .setPlaceholder('例: 12:34')
            .setStyle(TextInputStyle.Short);

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('タイトル')
            .setPlaceholder('例: 会議')
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(dateInput);
        const secondActionRow = new ActionRowBuilder().addComponents(timeInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(titleInput);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        await interaction.showModal(modal);
        const filter = (mInteraction) => mInteraction.customId === 'registerModal';
        interaction.awaitModalSubmit({filter, time: 60000})
            .then(async (mInteraction) => {
                const date = mInteraction.fields.getTextInputValue('date');
                const time = mInteraction.fields.getTextInputValue('time');
                const title = mInteraction.fields.getTextInputValue('title');

                //データの整合性の確認
                const formatDate = date.match(/^\d{4}\/(0[1-9]|1[0-2]|[1-9])\/(0[1-9]|[12]\d|3[01]|[1-9])$/);
                const formatTime = time.match(/^([01]\d|2[0-3]|\d):([0-5]\d|\d)$/);
                if (!formatDate || !formatTime) {
                    await mInteraction.reply({content: '日付または時間の形式が正しくありません', ephemeral: true});
                    return;
                }
                
                const directoryPath = './data';
                const fileName = `${interaction.user.id}.json`;
                const filePath = path.join(directoryPath, fileName);
                
                //データの形式をそろえる
                let datelist = date.split('/');
                for(let i = 0; i < datelist.length; i++){
                    datelist[i] = datelist[i].padStart(2, '0');
                }
                const inputDate = datelist.join('/');
                let timeList = time.split(':');
                for(let i = 0; i < timeList.length; i++){
                    timeList[i] = timeList[i].padStart(2, '0');
                }
                const inputTime = timeList.join(':');
                
                const newData = {
                    date: inputDate,
                    time: inputTime,
                    context: title
                }
                
                //既存のファイルがあるかどうかを確認
                if(fs.existsSync(filePath)){
                    //console.log('ファイルが存在します: ' + filePath);

                    //JSONファイルの読み込み
                    fs.readFile(filePath, 'utf8', (error, data) => {
                        if(error){
                            console.error('ファイルの読み込みに失敗しました: ', error);
                            return;
                        }
                        const schedule = JSON.parse(data);
                        schedule.push(newData);
                        
                        //データのソート
                        schedule.sort((a, b) => {
                            
                            if(a.date === b.date){
                                return a.time < b.time ? -1 : 1;
                            }else{
                                return a.date < b.date ? -1 : 1;
                            }
                        });
                        fs.writeFile(filePath, JSON.stringify(schedule, null, 4), (error) => {
                            if(error){
                                console.error('ファイルの書き込みに失敗しました: ', error);
                                return;
                            }else{
                                console.log('データが追加されました: ', filePath);
                            }
                        });
                    });
                    /*const data = fs.readFileSync(filePath, 'utf8');
                    const schedule = JSON.parse(data);
                    schedule.push({date, time, title});
                    fs.writeFileSync(filePath, JSON.stringify(schedule));*/
                }else{
                    console.log('ファイルが存在しません: ' + filePath);
                    fs.writeFile(filePath, JSON.stringify([newData], null, 4), (error) => {
                        if(error){
                            console.error('ファイルの書き込みに失敗しました: ', error);
                            return;
                        }else{
                            console.log('新しいデータが作成されました');
                        }
                    });
                    /*const schedule = [{date, time, title}];
                    fs.writeFileSync(filePath, JSON.stringify(schedule));*/
                }
                
                await mInteraction.reply({content: `登録しました: ${date} ${time} ${title}`, ephemeral: true});
            })
            .catch(console.error);
};

