const fs = require('fs').promises;
const axios = require('axios');
module.exports.executeToday = async function (interaction) {
    //現在時刻を取得
    try{
        await interaction.deferReply({ephemeral: true});
        //const response = await axios.get('http://worldtimeapi.org/api/timezone/Asia/Tokyo');
        const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo');
        const jsonString = JSON.stringify(response.data);
        const rowdate = JSON.parse(jsonString);
        const rownowdate = rowdate.date;
        const [month, day, year] = rownowdate.split('/');
        const nowdate = `${year}/${month}/${day}`;
        console.log(nowdate);
        
        //ファイルの読み込み
        const user = interaction.user.id;
        const filePath = `./data/${user}.json`;
        try{
            const data = await fs.readFile(filePath, 'utf-8');
            const schedule = JSON.parse(data);
            let sendSchedule = '';
            let sendMessage = '';
            for(const s of schedule){
                if(s.date === nowdate){
                    sendSchedule = `${s.date} ${s.time} ${s.context}\n`;
                    sendMessage += sendSchedule;
                }
            }
            if(sendSchedule.length === 0){
                await interaction.editReply({content: '本日の予定はありません'});
                return;
            }else{
                await interaction.editReply({content: '本日の予定\n' + sendMessage});
            }
        }catch(error){
            await interaction.editReply('予定が登録されていません');
            console.error('ファイルの読み込みに失敗しました: ', error);
        }
        
    }catch(error){
        console.error('APIの取得に失敗しました: ', error);
    }
};