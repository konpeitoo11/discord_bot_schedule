const fs = require('fs');
const { createDefaultConfig } = require('./createDefaultConfig');
module.exports.checkConfigfileExist = async function (filepath) {
    if(!fs.existsSync(filepath)){
        await createDefaultConfig(filepath)
    }
}