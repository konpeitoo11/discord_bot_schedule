const fs = require('fs').promises;
module.exports.createDefaultConfig = async function (userFilePath) {
    const data = {
        scheduleDeleteorNot: true
    };
    await fs.writeFile(userFilePath, JSON.stringify(data, null, 4));
    console.log('設定ファイルを作成しました' + userFilePath);
}
