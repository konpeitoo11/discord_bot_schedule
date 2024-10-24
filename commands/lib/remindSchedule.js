const fs = require('fs').promises;
const axios = require('axios');
module.exports.remindSchedule = async function (client) {
    //現在時刻を取得
    const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo');
    const jsonString = JSON.stringify(response.data);
    const rowdate = JSON.parse(jsonString);
    const rownowdate = rowdate.date;
    const [month, day, year] = rownowdate.split('/');
    const nowdate = `${year}/${month}/${day}`;
    const nowtime = rowdate.time;

    const directoryPath = './data';
    try{
        const files = await fs.readdir(directoryPath);
        for(const file of files){
            const filePath = `${directoryPath}/${file}`;
            const data = await fs.readFile(filePath, 'utf-8');
            const schedule = JSON.parse(data);
            let sendSchedule = '';
            let sendMessage = '';
            for(const s of schedule){
                if(s.date === nowdate){
                    const nowHour = nowtime.split(':')[0];
                    const scheduleHour = s.time.split(':')[0];
                    if(parseInt(scheduleHour) - parseInt(nowHour) == 1){
                        if(parseInt(s.time.split(':')[1]) - parseInt(nowtime.split(':')[1]) == 0){//ちょうど1時間前
                            sendSchedule = `${s.date} ${s.time} ${s.context}\n`;
                            sendMessage += sendSchedule;
                        }
                    }
                    /*else if(parseInt(scheduleHour) - parseInt(nowHour) == 1){
                        sendSchedule = `${s.date} ${s.time} ${s.context}\n`;
                        sendMessage += sendSchedule;
                    }*/
                }
            }
            if(sendSchedule.length === 0){
                continue;
            }else{
                try{
                    //userIdを取得
                    const user = file.split('.')[0];
                    //userObjectを取得
                    const userObj = await client.users.fetch(user);
                    await userObj.send(`予定が近づいています\n${sendMessage}`);
                }catch(error){

                    console.error('DMの送信に失敗しました: ', error);
                }

            }
        }
    }catch(error){
        console.error('ファイルの読み込みに失敗しました: ', error);
    }
}