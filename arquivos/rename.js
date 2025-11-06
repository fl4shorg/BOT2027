const fs = require('fs-extra');
const {
imageToWebp,
videoToWebp,
writeExifImg,
writeExifVid
} = require('./exif');
const {
getBuffer
} = require('./funcoes/function.js');

// Selinho para usar como quoted nos stickers
const selinho = {
    key: { fromMe: false, participant: `13135550002@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Kuun;Flash;;;\nFN:Flash Kuun\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};

const sendImageAsSticker = async (conn, jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
 let buffer;
 // SEMPRE usa writeExifImg para preservar metadados personalizados
 buffer = await writeExifImg(buff, options);

await conn.sendMessage(jid, {
    sticker: {url: buffer}, 
    ...options
}, { quoted: quoted })
return buffer;
};



const sendVideoAsSticker = async (conn, jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
 let buffer;
 // SEMPRE usa writeExifVid para preservar metadados personalizados
 buffer = await writeExifVid(buff, options);

await conn.sendMessage(jid, { 
    sticker: { url: buffer }, 
    ...options 
}, { quoted: quoted })
return buffer;
}

module.exports = {
sendVideoAsSticker,
sendImageAsSticker
};