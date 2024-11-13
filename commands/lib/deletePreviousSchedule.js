const fs = require('fs').promises;
const axios = require('axios');
const { checkConfigfileExist } = require('./checkConfigfileExist.js');
module.exports.deletePreviousSchedule = async function () {
    //現在時刻を取得
    //console.log('0');//
    const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo');
    //console.log('1');//
    const jsonString = JSON.stringify(response.data);
    const rowdate = JSON.parse(jsonString);
    const rownowdate = rowdate.date;
    const [month, day, year] = rownowdate.split('/');
    const nowdate = `${year}/${month}/${day}`;
    const nowtime = rowdate.time;

    const directoryPath = './data';
    const configPath = './config';
    try{
        const files = await fs.readdir(directoryPath);
        for(const file of files){
            const filePath = `${directoryPath}/${file}`;
            const configFilePath = `${configPath}/${file}`;
            checkConfigfileExist(configFilePath);
            const configData = await fs.readFile(configFilePath, 'utf-8');
            const config = JSON.parse(configData);
            const scheduleDeleteorNot = config.scheduleDeleteorNot;
            if(!scheduleDeleteorNot)continue;
            const data = await fs.readFile(filePath, 'utf-8');
            const schedule = JSON.parse(data);
            let deleteIndex = 0;
            for(; deleteIndex < schedule.length; deleteIndex++){
                const s = schedule[deleteIndex];
                if(s.date >= nowdate){
                    if(s.date > nowdate || s.time > nowtime){
                        break;
                    }
                }
            }
            if(deleteIndex > 0){
                schedule.splice(0, deleteIndex);
                try{
                    await fs.writeFile(filePath, JSON.stringify(schedule, null, 4));
                    console.log('前の予定を削除しました: ', filePath);
                }catch(error){
                    console.error('ファイルの書き込みに失敗しました: ', error);
                }
            }
        }
    }catch(error){
        console.error('ファイルの読み込みに失敗しました: ', error);
    }
}