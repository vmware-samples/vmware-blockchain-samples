const fs = require('fs');
const ganymedeAppData = require('./ganymede.app').ganymedeAppData;
const srcPath = `dist-electron-src`;
const isDevEnv = fs.existsSync(srcPath);

process.env.GANY_APP_DATA = Buffer.from(JSON.stringify(ganymedeAppData)).toString('base64');

const electronData = fs.existsSync(`${__dirname}/ganymede.electron.data.json`)
                        ? JSON.parse(fs.readFileSync(`${__dirname}/ganymede.electron.data.json`, 'utf8')) : {};
process.env.GANY_ELECTRON_DATA = Buffer.from(JSON.stringify(electronData)).toString('base64');

module.exports = isDevEnv ? require(`./${srcPath}/src/electron`) : require(`../${srcPath}/src/electron`);
