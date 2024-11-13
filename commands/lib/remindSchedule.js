const fs = require('fs').promises;
const axios = require('axios');
module.exports.remindSchedule = async function (client) {
    //現在時刻を取得
    //console.log('ここまで来た1');
    const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo');
    const jsonString = JSON.stringify(response.data);
    const rowdate = JSON.parse(jsonString);
    const rownowdate = rowdate.date;
    const [month, day, year] = rownowdate.split('/');
    const nowdate = `${year}/${month}/${day}`;
    //const nowtime rowdate.time;
    const [nowHour, nowMinute] = rowdate.time.split(':');
    const nowtime = parseInt(nowHour) * 60 + parseInt(nowMinute);

    //console.log('ここまで来た');
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
                const [scheduleYear, scheduleMonth, scheduleDay] = s.date.split('/');
                const [scheduleHour, scheduleMinute] = s.time.split(':')
                const scheduleTime = parseInt(scheduleHour) * 60 + parseInt(scheduleMinute);
                if(year == scheduleYear){
                    if(month == scheduleMonth){
                        if(day == scheduleDay){
                            if(scheduleTime - nowtime == 60){
                                sendSchedule = `${s.date} ${s.time}\n${s.context}\n`;
                                sendMessage += sendSchedule;
                            }
                        }else if(parseInt(day) + 1 == parseInt(scheduleDay)){
                            if(scheduleTime + 60 * 24 - nowtime == 60){
                                sendSchedule = `${s.date} ${s.time}\n${s.context}\n`;
                                sendMessage += sendSchedule;
                            }
                        }
                    }else if(parseInt(month) + 1 == parseInt(scheduleMonth)){
                        const regularYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                        const leapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                        let months;
                        //うるう年かどうか
                        if(parseInt(year) % 100 == 0){
                            if(parseInt(year) % 400 == 0){
                                months = leapYear;//うるう年
                            }else{
                                months = regularYear;//普通
                            }
                        }else if(parseInt(year) % 4 == 0){
                            months  = leapYear;//うるう年
                        }else{
                            months = regularYear;//普通
                        }
                        if(parseInt(month) == months[parseInt(month) - 1] && parseInt(scheduleMonth) == months[parseInt(scheduleMonth) - 1]){
                            if(scheduleTime + 24 * 60 - nowtime == 60){
                                sendSchedule = `${s.date} ${s.time}\n${s.context}\n`;
                                sendMessage += sendSchedule;
                            }
                        }
                    }
                }else if(parseInt(year) + 1 == parseInt(scheduleYear)){
                    if(parseInt(scheduleMonth) == 1 && parseInt(scheduleDay) == 1 && parseInt(month) == 12 && parseInt(day) == 31){
                        if(scheduleTime + 60 * 24 - nowtime == 60){
                            sendSchedule = `${s.date} ${s.time}\n${s.context}\n`;
                            sendMessage += sendSchedule;
                        }
                    }
                }
                /*if(s.date === nowdate){
                    const nowHour = nowtime.split(':')[0];
                    const scheduleHour = s.time.split(':')[0];
                    if(parseInt(scheduleHour) - parseInt(nowHour) == 1){
                        if(parseInt(s.time.split(':')[1]) - parseInt(nowtime.split(':')[1]) == 0){//ちょうど1時間前
                            sendSchedule = `${s.date} ${s.time}\n${s.context}\n`;
                            sendMessage += sendSchedule;
                        }
                    }
                    /*else if(parseInt(scheduleHour) - parseInt(nowHour) == 1){
                        sendSchedule = `${s.date} ${s.time} ${s.context}\n`;
                        sendMessage += sendSchedule;
                    }*/
                //}
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