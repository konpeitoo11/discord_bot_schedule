const { clear } = require('console');
const fs = require('fs');
const path = require('path');
module.exports.executeCsv = async function (interaction, client) {
    interaction.reply({content: 'csvファイルをDMで送信してください\ncsvファイルは\n`yyyy/mm/dd, hh:mm, 内容,`\nの形式にしてください\n**- ファイルは1分以内に送信してください\n - csvファイルは予定ごとに改行してください**', ephemeral: true});
    const listener = async (message) => {
        if(message.author.bot)return;
        if(message.author.id == interaction.user.id){
            if(message.attachments.size > 0){
                let csv = message.attachments.first();
                if(csv.name.endsWith('.csv')){
                    let csvUrl = csv.url;
                    fetch(csvUrl).then(response => {
                        if(response.ok){
                            return response.text();
                        }
                    }).then(text => {
                        let lines = text.split(/\r\n|\n/);

                        //ファイルが存在するかどうかを確認
                        const directoryPath = './data';
                        const fileName = `${interaction.user.id}.json`;
                        const filePath = path.join(directoryPath, fileName);
                        let schedule;
                        if(fs.existsSync(filePath)){
                            try{
                                const data = fs.readFileSync(filePath, 'utf8');
                                schedule = JSON.parse(data);
                            }catch(error){
                                console.error(error);
                            }
                        }else{
                            schedule = [];
                        }

                        for(let i = 0; i < lines.length; i++){
                            let cells = lines[i].split(',');
                            //console.log(cells);
                            let inputData = [];
                            for(let j = 0; j < cells.length; j++){
                                if(cells[j] == '')continue;
                                else{
                                    inputData.push(cells[j]);
                                }
                            }

                            if(inputData.length < 3)continue;
                            
                            //データの整合性の確認
                            const formatDate = inputData[0].match(/^\d{4}\/(0[1-9]|1[0-2]|[1-9])\/(0[1-9]|[12]\d|3[01]|[1-9])$/);
                            const formatTime = inputData[1].match(/^([01]\d|2[0-3]|\d):([0-5]\d|\d)$/);
                            if(!formatDate || !formatTime)continue;
                            
                            //データの形式をそろえる
                            let datelist = inputData[0].split('/');
                            for(let i = 0; i < datelist.length; i++){
                                datelist[i] = datelist[i].padStart(2, '0');
                            }
                            const inputDate = datelist.join('/');
                            let timeList = inputData[1].split(':');
                            for(let i = 0; i < timeList.length; i++){
                                timeList[i] = timeList[i].padStart(2, '0');
                            }
                            const inputTime = timeList.join(':');
                            
                            const newData = {
                                date: inputDate,
                                time: inputTime,
                                context: inputData[2]
                            }
                            schedule.push(newData);
                        }
                        
                        //データのソート
                        schedule.sort((a, b) => {
                            
                            if(a.date === b.date){
                                return a.time < b.time ? -1 : 1;
                            }else{
                                return a.date < b.date ? -1 : 1;
                            }
                        });
                        
                        //ファイル書き込み
                        fs.writeFile(filePath, JSON.stringify(schedule, null, 4), (error) => {
                            if(error){
                                console.error('ファイルの書き込みに失敗しました: ', error);
                                return;
                            }else{
                                //interaction.editReply({content: ''});
                                interaction.editReply({content: 'データが追加されました'});
                                clearTimeout(timeoutId);
                                client.off('messageCreate', listener);
                                return;
                            }
                        });
                    }).catch(error => {
                        console.error(error);//csvファイル読み込みエラー
                    });
                }else{
                    //interaction.editReply({content: ''});
                    interaction.editReply({content: 'もう一度csvコマンドを使用してcsvファイルを送信してください', ephemeral: true});
                    clearTimeout(timeoutId);
                    client.off('messageCreate', listener);
                    return;
                }
            }else{
                //interaction.editReply({content: ''});
                interaction.editReply({content: 'もう一度csvコマンドを使用してcsvファイルを送信してください', ephemeral: true});
                clearTimeout(timeoutId);
                client.off('messageCreate', listener);
                return;
            }
        }
    };
    client.on('messageCreate', listener);
    const timeoutId = setTimeout(() => {
        client.off('messageCreate', listener); // タイムアウトでリスナーを削除
        interaction.editReply({content: 'タイムアウトしました'});
    }, 60000); // 1分後にリスナーを自動削除
}