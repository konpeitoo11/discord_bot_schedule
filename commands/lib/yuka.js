const {ActionRowBuilder, ButtonBuilder} = require('discord.js');
const axios = require('axios');
let paintNum = 2;
let previousDay = 0;
module.exports.yuka = async function(client){
    const response = await axios.get('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Tokyo');
    const jsonString = JSON.stringify(response.data);
    const rowdate = JSON.parse(jsonString);
    const [month, day, year] = rowdate.date.split('/');
    if(rowdate.time != '23:59' || previousDay == day){
        return;
    }
    console.log('ここまで来た');
    previousDay = day;
    const good = new ButtonBuilder()
        .setCustomId('newSuggestions')
        .setLabel('構想を考えた！')
        .setStyle('Primary');

    const newPaint = new ButtonBuilder()
        .setCustomId('newPaint')
        .setLabel('新しい絵を描いた！')
        .setStyle('Primary');

    const newNovel = new ButtonBuilder()
        .setCustomId('newNovel')
        .setLabel('小説を進めた！')
        .setStyle('Primary');
    
    const bad = new ButtonBuilder()
        .setCustomId('bad')
        .setLabel('あまり進まなかった...')
        .setStyle('Danger');
    
    const row = new ActionRowBuilder()
        .addComponents(good, newPaint, newNovel, bad);

    //ここにユーザーIDを入れる
    const userID = 'sample';
    const user = await client.users.fetch(userID);
    const sendMessage = await user.send({content: '今日の進捗はどうですか?\n描いた絵は4093pxですか?', components: [row]});

    try{
        let sendChannelMessage = 'ゆーかさんは';
        const confirmation = await sendMessage.awaitMessageComponent();
        sendMessage.edit({content: 'ありがとうございます！\n今日もお疲れ様です！\n', components: []});
        if(confirmation.customId === 'newSuggestions'){
            sendChannelMessage += '構想を考えた！';
        }else if(confirmation.customId === 'newPaint'){
            paintNum++;
            sendChannelMessage += '新しい絵を描いた！';
        }else if(confirmation.customId === 'bad'){
            sendChannelMessage += 'あまり進まなかった...';
        }else if(confirmation.customId === 'newNovel'){
            sendChannelMessage += '小説を進めた！';
        }
        sendChannelMessage += `\n今まで描いた絵の枚数: ${paintNum}枚`;

        //メッセージをチャンネルに送信(スレッド)
        //ここにスレッドIDを入れる
        const channelID = 'sample';
        const channel = await client.channels.fetch(channelID);
        await channel.send(sendChannelMessage);
    }catch(error){
        console.error('エラーが発生しました: ', error);
    }
}

module.exports.addPaint = async function(message){
    paintNum++;
    message.reply(`ゆーかさんは絵を描いた！\n今まで描いた絵の枚数: ${paintNum}枚`);
}