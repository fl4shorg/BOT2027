// index.js — Bot completo com eventos e comandos unificados

const {
    makeWASocket,
    fetchLatestBaileysVersion,
    generateWAMessageFromContent,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");


const path = require("path"); // <<< ESSENCIAL PARA path.joinv
const fs = require("fs");
const axios = require("axios");
const os = require("os");
const { writeExif } = require("./arquivos/sticker.js");
const { sendImageAsSticker, sendVideoAsSticker } = require("./arquivos/rename.js");
const Jimp = require("jimp");
const { igdl } = require('./Instagram.js');
const settings = require('./settings/settings.json');
const envConfig = require('./config/environment.js');
const cloudscraper = require('cloudscraper');
const UserAgent = require('user-agents');
const moment = require('moment-timezone');
const { Chess } = require('chess.js');
const ffmpeg = require('fluent-ffmpeg');

// Sistema RPG - NeextCity (Nova Versão Completa)
const rpg = require('./arquivos/rpg/index.js');

const antilinkFile = path.join(__dirname, "antilink.json");
// Sistema Anti-Spam Completo
const antiSpam = require("./arquivos/antispam.js");

// Sistema de Ranking de Ativos
const rankAtivo = require("./arquivos/rankativo.js");

// Sistema de Welcome/Boas-vindas
const welcomeSystem = require("./arquivos/welcome.js");

// Sistema de Registros
const registros = require("./arquivos/registros.js");

// Sistema de Xadrez
const xadrez = require("./arquivos/xadrez.js");

// Sistema de Akinator
const akinator = require("./arquivos/akinator.js");

// Sistema de Hentai
const hentai = require("./arquivos/hentai.js");

// importa banner + logger centralizados
const { mostrarBanner, logMensagem } = require("./export");

// importa funções auxiliares do menu
const { obterSaudacao, contarGrupos, contarComandos } = require("./arquivos/funcoes/function.js");

// =============================================
// FUNÇÕES DE ALTERADORES DE VÍDEO E ÁUDIO
// =============================================

async function downloadMediaAlterador(message) {
    try {
        const messageType = Object.keys(message)[0];
        const stream = await downloadContentFromMessage(message[messageType], messageType.replace('Message', ''));
        
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Erro ao baixar mídia:', error);
        throw error;
    }
}

function processarVideo(inputBuffer, outputPath, filtros) {
    return new Promise((resolve, reject) => {
        const tempInput = path.join(__dirname, 'temp_input_' + Date.now() + '.mp4');
        
        fs.writeFileSync(tempInput, inputBuffer);
        
        const command = ffmpeg(tempInput);
        
        if (filtros.videoFilter) {
            command.videoFilters(filtros.videoFilter);
        }
        
        if (filtros.audioFilter) {
            command.audioFilters(filtros.audioFilter);
        }
        
        command
            .output(outputPath)
            .on('end', () => {
                if (fs.existsSync(tempInput)) {
                    fs.unlinkSync(tempInput);
                }
                resolve(outputPath);
            })
            .on('error', (err) => {
                if (fs.existsSync(tempInput)) {
                    fs.unlinkSync(tempInput);
                }
                reject(err);
            })
            .run();
    });
}

function processarAudio(inputBuffer, outputPath, filtros) {
    return new Promise((resolve, reject) => {
        const tempInput = path.join(__dirname, 'temp_audio_input_' + Date.now() + '.mp3');
        
        fs.writeFileSync(tempInput, inputBuffer);
        
        const command = ffmpeg(tempInput);
        
        if (filtros.audioFilter) {
            command.audioFilters(filtros.audioFilter);
        }
        
        command
            .output(outputPath)
            .audioCodec('libmp3lame')
            .on('end', () => {
                if (fs.existsSync(tempInput)) {
                    fs.unlinkSync(tempInput);
                }
                resolve(outputPath);
            })
            .on('error', (err) => {
                if (fs.existsSync(tempInput)) {
                    fs.unlinkSync(tempInput);
                }
                reject(err);
            })
            .run();
    });
}

async function videoLento(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando vídeo lento...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_videolento_' + Date.now() + '.mp4');
        
        await processarVideo(mediaBuffer, outputPath, {
            videoFilter: 'setpts=2.0*PTS',
            audioFilter: 'atempo=0.5'
        });
        
        await sock.sendMessage(from, {
            video: fs.readFileSync(outputPath),
            caption: '🐌 Vídeo em câmera lenta!'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar vídeo lento:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar vídeo. Marque um vídeo válido.' });
    }
}

async function videoRapido(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando vídeo rápido...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_videorapido_' + Date.now() + '.mp4');
        
        await processarVideo(mediaBuffer, outputPath, {
            videoFilter: 'setpts=0.5*PTS',
            audioFilter: 'atempo=2.0'
        });
        
        await sock.sendMessage(from, {
            video: fs.readFileSync(outputPath),
            caption: '⚡ Vídeo acelerado!'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar vídeo rápido:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar vídeo. Marque um vídeo válido.' });
    }
}

async function videoContrario(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando vídeo ao contrário...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_videocontrario_' + Date.now() + '.mp4');
        
        await processarVideo(mediaBuffer, outputPath, {
            videoFilter: 'reverse',
            audioFilter: 'areverse'
        });
        
        await sock.sendMessage(from, {
            video: fs.readFileSync(outputPath),
            caption: '🔄 Vídeo ao contrário!'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar vídeo contrário:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar vídeo. Marque um vídeo válido.' });
    }
}

async function audioLento(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando áudio lento...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_audiolento_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'atempo=0.5'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar áudio lento:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function audioRapido(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando áudio rápido...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_audiorapido_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'atempo=2.0'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar áudio rápido:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function grave(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando efeito grave...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_grave_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.8,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar grave:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function grave2(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando efeito grave 2...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_grave2_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.7,aresample=44100,bass=g=10'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar grave2:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function esquilo(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz de esquilo...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_esquilo_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*1.5,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar esquilo:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function estourar(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando efeito estourar...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_estourar_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'volume=20dB,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|0/-7|20/-7:gain=5'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar estourar:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function bass(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando efeito bass...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_bass_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'bass=g=15,dynaudnorm'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar bass:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function bass2(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando efeito bass 2...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_bass2_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'bass=g=20,equalizer=f=60:t=o:w=2:g=10'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar bass2:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function vozMenino(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz de menino...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_vozmenino_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*1.3,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz menino:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function vozRobo(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz de robô...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_vozrobo_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz robô:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function vozRadio(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz de rádio...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_vozradio_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'highpass=f=300,lowpass=f=3000'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz rádio:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function vozFantasma(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz de fantasma...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_vozfantasma_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.75,aresample=44100,aphaser=in_gain=0.4'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz fantasma:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

async function vozDistorcida(sock, from, quotedMsg) {
    try {
        await sock.sendMessage(from, { text: '⏳ Processando voz distorcida...' });
        
        const mediaBuffer = await downloadMediaAlterador(quotedMsg);
        const outputPath = path.join(__dirname, 'output_vozdistorcida_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'vibrato=f=8:d=0.8,tremolo=f=6:d=0.7'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg'
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz distorcida:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

// =============================================
// SISTEMA DE CACHE E RETRY - PREVINE RATE LIMIT
// =============================================

// Cache de metadata de grupos (válido por 60 segundos)
const metadataCache = new Map();
const CACHE_DURATION = 60000; // 60 segundos

// Função para obter metadata com cache
async function getGroupMetadataWithCache(sock, groupId) {
    const now = Date.now();
    const cached = metadataCache.get(groupId);
    
    // Se tem cache válido, retorna
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }
    
    try {
        // Busca novo metadata
        const metadata = await sock.groupMetadata(groupId);
        
        // Armazena no cache
        metadataCache.set(groupId, {
            data: metadata,
            timestamp: now
        });
        
        return metadata;
    } catch (error) {
        // Se der erro mas tem cache expirado, retorna ele mesmo assim
        if (cached) {
            console.log("⚠️ Usando cache expirado devido a erro:", error.message);
            return cached.data;
        }
        throw error;
    }
}

// Função de retry com backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit = error.message && error.message.includes('rate-overlimit');
            const isLastRetry = i === maxRetries - 1;
            
            if (isRateLimit && !isLastRetry) {
                const delay = initialDelay * Math.pow(2, i); // Backoff exponencial
                console.log(`⏳ Rate limit detectado. Tentativa ${i + 1}/${maxRetries}. Aguardando ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

// Limpa cache periodicamente (a cada 2 minutos - APENAS UMA VEZ)
let metadataCacheInterval = null;
if (!metadataCacheInterval) {
    metadataCacheInterval = setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, value] of metadataCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                metadataCache.delete(key);
                cleaned++;
            }
        }
        // Limita tamanho máximo do cache
        if (metadataCache.size > 100) {
            const entries = Array.from(metadataCache.entries());
            const toRemove = entries.slice(0, metadataCache.size - 100);
            toRemove.forEach(([key]) => metadataCache.delete(key));
        }
    }, 120000); // 2 minutos
}

// Config do Bot - PRIORIZA settings.json sobre environment vars
function obterConfiguracoes() {
    try {
        delete require.cache[require.resolve('./settings/settings.json')];
        const settingsFile = require('./settings/settings.json');

        // SETTINGS.JSON TEM PRIORIDADE TOTAL (para o dono poder configurar facilmente)
        return {
            prefix: settingsFile.prefix || envConfig.botOwner.prefix || ".",
            nomeDoBot: settingsFile.nomeDoBot || envConfig.botOwner.name || "WhatsApp Bot",
            nickDoDono: settingsFile.nickDoDono || envConfig.botOwner.nickname || "Owner",
            numeroDono: settingsFile.numeroDono || "",
            lidDono: settingsFile.lidDono || "",
            fotoDoBot: settingsFile.fotoDoBot || envConfig.media.botPhotoUrl || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
            idDoCanal: settingsFile.idDoCanal || "120363399209756764@g.us"
        };
    } catch (err) {
        console.error("❌ Erro ao carregar configurações:", err);
        // Fallback using environment config only
        return envConfig.toLegacyFormat();
    }
}

// Selinhos e quoted fake (mantive seu conteúdo)
const selinho = {
    key: { fromMe: false, participant: `13135550002@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Kuun;Flash;;;\nFN:Flash Kuun\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};
const selinho2 = {
    key: { fromMe: false, participant: `553176011100@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:un;Flh;;;\nFN:Kuun\nitem1.TEL;waid=553176011100:553176011100\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};
const selomercadopago = {
    key: { fromMe: false, participant: `5511988032872@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Mercado;Pago;;;\nFN:Mercado Pago\nitem1.TEL;waid=5511988032872:5511988032872\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};
const selonubank = {
    key: { fromMe: false, participant: `551151807064@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Nubank;Flash;;;\nFN:Nubank Kuun\nitem1.TEL;waid=551151807064:551151807064\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};
const seloserasa = {
    key: { fromMe: false, participant: `551128475131@s.whatsapp.net`, remoteJid: 'status@broadcast' },
    message: { contactMessage: { displayName: 'NEEXT LTDA', vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Serasa;Flash;;;\nFN:Serasa Kuun\nitem1.TEL;waid=551128475131:551128475131\nitem1.X-ABLabel:Mobile\nEND:VCARD`, sendEphemeral: true } }
};
const quotedCarrinho = {
    key: { participant: "0@s.whatsapp.net", remoteJid: "0@s.whatsapp.net" },
    message: { documentMessage: { title: "🛒 Neext Ltda", fileName: "Neext.pdf", mimetype: "application/pdf", fileLength: 999999, pageCount: 1 } }
};

// Sistema de Anagrama (jogos de palavras)
const anagramaAtivo = {};
const anagramaPalavraAtual = {};
const anagramaMessageId = {};

// Função para embaralhar palavra
function embaralharPalavra(palavra) {
    const arr = palavra.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

// System NEEXT (status do sistema) para usar no grupo-status
const quotedSerasaAPK = {
    key: { participant: "0@s.whatsapp.net", remoteJid: "0@s.whatsapp.net" },
    message: {
        documentMessage: {
            title: "🛡️ NEEXT System",
            fileName: "serasa.apk",
            mimetype: "application/vnd.android.package-archive",
            fileLength: 549755813888000, // 500TB em bytes
            pageCount: 0,
            contactVcard: true
        }
    }
};

// APK Fake da NEEXT LTDA (1000GB) para usar no grupo-status
const quotedNeextAPK = {
    key: { participant: "0@s.whatsapp.net", remoteJid: "0@s.whatsapp.net" },
    message: {
        documentMessage: {
            title: "📱 NEEXT LTDA",
            fileName: "neext_ltda.apk",
            mimetype: "application/vnd.android.package-archive",
            fileLength: 1073741824000, // 1000GB em bytes
            pageCount: 0,
            contactVcard: true
        }
    }
};

// ContextInfo para fazer mensagens aparecerem como "enviada via anúncio"
const contextAnuncio = {
    externalAdReply: {
        title: "© NEEXT LTDA",
        body: "📱 Instagram: @neet.tk",
        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
        mediaType: 1,
        sourceUrl: "https://www.neext.online",
        showAdAttribution: true
    }
};

// Mensagens já processadas (evita duplicadas) - Cache reduzido para 15 segundos
const processedMessages = new Set();
const MAX_PROCESSED_MESSAGES = 500; // Limite máximo de mensagens no cache

// Limpa periodicamente (APENAS UMA VEZ)
let processedMessagesInterval = null;
if (!processedMessagesInterval) {
    processedMessagesInterval = setInterval(() => {
        // Se passar de 500 mensagens, limpa tudo
        if (processedMessages.size > MAX_PROCESSED_MESSAGES) {
            processedMessages.clear();
        }
    }, 15 * 1000); // 15 segundos
}

// Sistema de Xadrez - Chess Games
const chessGames = new Map();

// Função para renderizar o tabuleiro de xadrez em ASCII
function renderChessBoard(chess, lastMove = null) {
    const board = chess.board();
    const pieces = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    };
    
    let boardStr = '```\n  a b c d e f g h\n';
    
    for (let i = 0; i < 8; i++) {
        boardStr += `${8 - i} `;
        for (let j = 0; j < 8; j++) {
            const square = board[i][j];
            if (square) {
                boardStr += pieces[square.type.toUpperCase() === square.type ? square.type.toUpperCase() : square.type.toLowerCase()];
            } else {
                boardStr += (i + j) % 2 === 0 ? '□' : '■';
            }
            boardStr += ' ';
        }
        boardStr += `${8 - i}\n`;
    }
    
    boardStr += '  a b c d e f g h\n```';
    return boardStr;
}

// Função para obter status do jogo
function getGameStatus(chess) {
    if (chess.isCheckmate()) {
        return chess.turn() === 'w' ? '♔ XEQUE-MATE! Pretas vencem! ♚' : '♚ XEQUE-MATE! Brancas vencem! ♔';
    }
    if (chess.isDraw()) {
        return '🤝 EMPATE!';
    }
    if (chess.isStalemate()) {
        return '🔒 EMPATE POR AFOGAMENTO!';
    }
    if (chess.isThreefoldRepetition()) {
        return '🔁 EMPATE POR REPETIÇÃO TRIPLA!';
    }
    if (chess.isInsufficientMaterial()) {
        return '⚖️ EMPATE POR MATERIAL INSUFICIENTE!';
    }
    if (chess.isCheck()) {
        return chess.turn() === 'w' ? '⚠️ XEQUE! Brancas em xeque!' : '⚠️ XEQUE! Pretas em xeque!';
    }
    return chess.turn() === 'w' ? '♔ Vez das BRANCAS' : '♚ Vez das PRETAS';
}




// Funções antigas removidas - agora usamos o sistema antiSpam completo

// Função utilitária: extrai texto da mensagem
function getMessageText(message) {
    if (!message) return "";
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.buttonsResponseMessage?.selectedButtonId) return message.buttonsResponseMessage.selectedButtonId;
    if (message.listResponseMessage?.singleSelectReply?.selectedRowId) return message.listResponseMessage.singleSelectReply.selectedRowId;
    if (message.ephemeralMessage?.message) return getMessageText(message.ephemeralMessage.message);
    return "";
}

// Normaliza mensagem e retorna quoted
function normalizeMessage(m) {
    if (!m?.message) return { normalized: m, quoted: null };
    let message = m.message;
    if (message.ephemeralMessage) message = message.ephemeralMessage.message;
    if (message.viewOnceMessage) message = message.viewOnceMessage.message;
    const contextInfo = message.extendedTextMessage?.contextInfo || {};
    const quoted = contextInfo.quotedMessage || null;
    return { normalized: { ...m, message }, quoted };
}

// Função reply genérica (com verificação de conexão)
async function reply(sock, from, text, mentions = []) {
    try {
        // Verifica se o socket está conectado
        if (!sock || !sock.user) {
            return; // Bot desconectado, ignora silenciosamente
        }

        // Validação e correção do texto
        if (text === undefined || text === null) {
            return; // Não envia nada
        }

        if (typeof text !== 'string') {
            text = String(text || "");
        }

        if (text.trim().length === 0) {
            return; // Não envia nada
        }

        // Garante que o texto seja uma string válida
        const mensagemFinal = text.toString().trim();

        await sock.sendMessage(from, {
            text: mensagemFinal,
            contextInfo: {
                forwardingScore: 100000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363289739581116@newsletter",
                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                }
            },
            mentions: mentions || []
        });
    } catch (err) {
        // Silencioso - não loga erros de conexão
    }
}

// Reage a qualquer mensagem com emoji (COM RETRY)
async function reagirMensagem(sock, normalized, emoji = "🤖") {
    if (!normalized?.key) return false;
    try {
        // Usa retry para evitar falha por rate limit
        await retryWithBackoff(async () => {
            await sock.sendMessage(normalized.key.remoteJid, {
                react: {
                    text: emoji,
                    key: normalized.key
                }
            });
        }, 2, 500); // Máximo 2 tentativas, delay inicial 500ms
        return true;
    } catch (err) {
        // Apenas loga erro silenciosamente se for rate limit
        if (!err.message || !err.message.includes('rate-overlimit')) {
            console.error("❌ Erro ao reagir:", err);
        }
        return false;
    }
}

// ===================================
// FUNÇÕES HELPER PARA LOGOS
// ===================================

// Processa logos simples (1 texto) - COM RETRY
async function processarLogo(sock, from, message, args, apiUrl, nomeEfeito, emoji) {
    const texto = args.join(' ');
    if (!texto) {
        const config = obterConfiguracoes();
        await sock.sendMessage(from, { 
            text: `❌ Digite o texto para criar o logo!\n\nExemplo: *${config.prefix}${nomeEfeito.toLowerCase().replace(/ /g, '')} Flash*` 
        }, { quoted: message });
        return;
    }

    console.log(`${emoji} Criando logo ${nomeEfeito}: "${texto}"`);
    await reagirMensagem(sock, message, "⏳");

    const maxRetries = 2;
    let lastError = null;

    for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        try {
            const config = obterConfiguracoes();
            
            if (tentativa > 1) {
                console.log(`🔄 Tentativa ${tentativa}/${maxRetries} para ${nomeEfeito}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * tentativa));
            }
            
            const response = await axios.get(`${apiUrl}?text=${encodeURIComponent(texto)}`, {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*'
                }
            });
            
            if (response.status !== 200) {
                throw new Error(`API retornou status ${response.status}`);
            }
            
            console.log(`🖼️ Imagem recebida da API (${response.data.length} bytes)`);
            const imageBuffer = Buffer.from(response.data);
            
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `${emoji} *${nomeEfeito.toUpperCase()}* ${emoji}\n\n📝 Texto: "${texto}"\n\n© ${config.nomeDoBot}`
            }, { quoted: message });
            
            await reagirMensagem(sock, message, "✅");
            console.log(`✅ Logo ${nomeEfeito} criado com sucesso!`);
            return;

        } catch (error) {
            lastError = error;
            console.error(`❌ Tentativa ${tentativa}/${maxRetries} falhou para ${nomeEfeito}:`, error.message);
            
            if (error.response) {
                console.error(`   Status: ${error.response.status}, StatusText: ${error.response.statusText}`);
            }
        }
    }

    await reagirMensagem(sock, message, "❌");
    
    let mensagemErro = `❌ Não foi possível gerar o logo ${nomeEfeito} após ${maxRetries} tentativas.\n\n`;
    
    if (lastError.code === 'ECONNABORTED') {
        mensagemErro += `⏱️ A API demorou muito para responder (timeout).\n`;
    } else if (lastError.response?.status === 500) {
        mensagemErro += `🔧 A API está com problemas internos no momento.\n`;
    } else if (lastError.response?.status === 503) {
        mensagemErro += `🚧 A API está indisponível temporariamente.\n`;
    } else {
        mensagemErro += `📡 Erro: ${lastError.message}\n`;
    }
    
    mensagemErro += `\n💡 Tente novamente em alguns instantes ou teste outro comando de logo.`;
    
    await sock.sendMessage(from, {
        text: mensagemErro
    }, { quoted: message });
}

// Processa logos simples TEXTPRO (usa text1 ao invés de text) - COM RETRY
async function processarLogoTextpro(sock, from, message, args, apiUrl, nomeEfeito, emoji) {
    const texto = args.join(' ');
    if (!texto) {
        const config = obterConfiguracoes();
        await sock.sendMessage(from, { 
            text: `❌ Digite o texto para criar o logo!\n\nExemplo: *${config.prefix}${nomeEfeito.toLowerCase().replace(/ /g, '')} Flash*` 
        }, { quoted: message });
        return;
    }

    console.log(`${emoji} Criando logo ${nomeEfeito}: "${texto}"`);
    await reagirMensagem(sock, message, "⏳");

    const maxRetries = 2;
    let lastError = null;

    for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        try {
            const config = obterConfiguracoes();
            
            if (tentativa > 1) {
                console.log(`🔄 Tentativa ${tentativa}/${maxRetries} para ${nomeEfeito}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * tentativa));
            }
            
            const response = await axios.get(`${apiUrl}?text1=${encodeURIComponent(texto)}`, {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*'
                }
            });
            
            if (response.status !== 200) {
                throw new Error(`API retornou status ${response.status}`);
            }
            
            console.log(`🖼️ Imagem recebida da API Textpro (${response.data.length} bytes)`);
            const imageBuffer = Buffer.from(response.data);
            
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `${emoji} *${nomeEfeito.toUpperCase()}* ${emoji}\n\n📝 Texto: "${texto}"\n\n© ${config.nomeDoBot}`
            }, { quoted: message });
            
            await reagirMensagem(sock, message, "✅");
            console.log(`✅ Logo ${nomeEfeito} criado com sucesso!`);
            return;

        } catch (error) {
            lastError = error;
            console.error(`❌ Tentativa ${tentativa}/${maxRetries} falhou para ${nomeEfeito}:`, error.message);
            
            if (error.response) {
                console.error(`   Status: ${error.response.status}, StatusText: ${error.response.statusText}`);
            }
        }
    }

    await reagirMensagem(sock, message, "❌");
    
    let mensagemErro = `❌ Não foi possível gerar o logo ${nomeEfeito} após ${maxRetries} tentativas.\n\n`;
    
    if (lastError.code === 'ECONNABORTED') {
        mensagemErro += `⏱️ A API demorou muito para responder (timeout).\n`;
    } else if (lastError.response?.status === 500) {
        mensagemErro += `🔧 A API está com problemas internos no momento.\n`;
    } else if (lastError.response?.status === 503) {
        mensagemErro += `🚧 A API está indisponível temporariamente.\n`;
    } else {
        mensagemErro += `📡 Erro: ${lastError.message}\n`;
    }
    
    mensagemErro += `\n💡 Tente novamente em alguns instantes ou teste outro comando de logo.`;
    
    await sock.sendMessage(from, {
        text: mensagemErro
    }, { quoted: message });
}

// Processa logos duplos (2 textos) - COM RETRY
async function processarLogoDuplo(sock, from, message, args, apiUrl, nomeEfeito, emoji) {
    const texto = args.join(' ');
    if (!texto) {
        const config = obterConfiguracoes();
        await sock.sendMessage(from, { 
            text: `❌ Digite os textos para criar o logo!\n\nExemplo: *${config.prefix}${nomeEfeito.toLowerCase().replace(/ /g, '')} Flash|Neext*\n\n💡 Use | para separar os dois textos` 
        }, { quoted: message });
        return;
    }

    const textos = texto.split('|').map(t => t.trim());
    if (textos.length < 2) {
        const config = obterConfiguracoes();
        await sock.sendMessage(from, { 
            text: `❌ Você precisa fornecer 2 textos separados por |\n\nExemplo: *${config.prefix}${nomeEfeito.toLowerCase().replace(/ /g, '')} Flash|Neext*` 
        }, { quoted: message });
        return;
    }

    console.log(`${emoji} Criando logo ${nomeEfeito}: "${textos[0]}" | "${textos[1]}"`);
    await reagirMensagem(sock, message, "⏳");

    const maxRetries = 2;
    let lastError = null;

    for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        try {
            const config = obterConfiguracoes();
            
            if (tentativa > 1) {
                console.log(`🔄 Tentativa ${tentativa}/${maxRetries} para ${nomeEfeito}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * tentativa));
            }
            
            const response = await axios.get(`${apiUrl}?text1=${encodeURIComponent(textos[0])}&text2=${encodeURIComponent(textos[1])}`, {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*'
                }
            });
            
            if (response.status !== 200) {
                throw new Error(`API retornou status ${response.status}`);
            }
            
            console.log(`🖼️ Imagem recebida da API (${response.data.length} bytes)`);
            const imageBuffer = Buffer.from(response.data);
            
            await sock.sendMessage(from, {
                image: imageBuffer,
                caption: `${emoji} *${nomeEfeito.toUpperCase()}* ${emoji}\n\n📝 Texto 1: "${textos[0]}"\n📝 Texto 2: "${textos[1]}"\n\n© ${config.nomeDoBot}`
            }, { quoted: message });
            
            await reagirMensagem(sock, message, "✅");
            console.log(`✅ Logo ${nomeEfeito} criado com sucesso!`);
            return;

        } catch (error) {
            lastError = error;
            console.error(`❌ Tentativa ${tentativa}/${maxRetries} falhou para ${nomeEfeito}:`, error.message);
            
            if (error.response) {
                console.error(`   Status: ${error.response.status}, StatusText: ${error.response.statusText}`);
            }
        }
    }

    await reagirMensagem(sock, message, "❌");
    
    let mensagemErro = `❌ Não foi possível gerar o logo ${nomeEfeito} após ${maxRetries} tentativas.\n\n`;
    
    if (lastError.code === 'ECONNABORTED') {
        mensagemErro += `⏱️ A API demorou muito para responder (timeout).\n`;
    } else if (lastError.response?.status === 500) {
        mensagemErro += `🔧 A API está com problemas internos no momento.\n`;
    } else if (lastError.response?.status === 503) {
        mensagemErro += `🚧 A API está indisponível temporariamente.\n`;
    } else {
        mensagemErro += `📡 Erro: ${lastError.message}\n`;
    }
    
    mensagemErro += `\n💡 Tente novamente em alguns instantes ou teste outro comando de logo.`;
    
    await sock.sendMessage(from, {
        text: mensagemErro
    }, { quoted: message });
}

// Detecta links na mensagem (MELHORADO - MENOS FALSOS POSITIVOS)
function detectarLinks(texto) {
    if (!texto) return false;
    
    // Regex melhorada - mais específica para evitar falsos positivos
    const linkPatterns = [
        // URLs completas com http/https
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,
        // URLs com www sem protocolo
        /\bwww\.[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,
        // Links específicos de redes sociais e mensageiros
        /\b(wa\.me|whatsapp\.com|t\.me|chat\.whatsapp\.com|instagram\.com|facebook\.com|twitter\.com|tiktok\.com|youtube\.com|youtu\.be|discord\.gg)\//gi
    ];
    
    // Testa cada padrão
    for (const pattern of linkPatterns) {
        if (pattern.test(texto)) {
            return true;
        }
    }
    
    return false;
}

// Verifica se usuário é admin do grupo (COM CACHE)
async function isAdmin(sock, groupId, userId) {
    try {
        // Usa cache para evitar rate limit
        const groupMetadata = await getGroupMetadataWithCache(sock, groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (err) {
        console.error("❌ Erro ao verificar admin:", err);
        return false;
    }
}

// Carrega donos adicionais do necessary.json (settings/)
function carregarDonosAdicionais() {
    try {
        const necessaryPath = path.join(__dirname, "settings", "necessary.json");
        if (fs.existsSync(necessaryPath)) {
            delete require.cache[require.resolve('./settings/necessary.json')];
            const necessary = require('./settings/necessary.json');
            return necessary || {};
        }
        return {};
    } catch (err) {
        console.error("❌ Erro ao carregar donos adicionais:", err);
        return {};
    }
}

// Salva donos adicionais no necessary.json (settings/)
function salvarDonosAdicionais(donos) {
    try {
        const necessaryPath = path.join(__dirname, "settings", "necessary.json");
        fs.writeFileSync(necessaryPath, JSON.stringify(donos, null, 2));
        return true;
    } catch (err) {
        console.error("❌ Erro ao salvar donos adicionais:", err);
        return false;
    }
}

// Verifica se usuário é o dono oficial do bot (via LID em settings.json)
function isDonoOficial(userId) {
    if (!userId) return false;
    
    const config = obterConfiguracoes();
    const userLid = userId.split('@')[0].split(':')[0];
    
    // Verifica se o LID do usuário corresponde ao LID do dono em settings.json
    if (config.lidDono && userLid === config.lidDono) {
        // console.log(`✅ [isDono] Dono oficial reconhecido por LID: ${userLid}`);
        return true;
    }
    
    // console.log(`❌ [isDono] Não é dono oficial (LID: ${userLid} vs ${config.lidDono})`);
    return false;
}

// Verifica se usuário é o dono do bot (oficial ou adicional)
function isDono(userId) {
    if (!userId) return false;
    
    const userLid = userId.split('@')[0].split(':')[0];
    
    // console.log(`🔍 [isDono] Verificando userId=${userId}, LID=${userLid}`);
    
    // 1. Verifica dono oficial (por LID em settings.json)
    if (isDonoOficial(userId)) {
        return true;
    }
    
    // 2. Verifica donos adicionais (LID em settings/necessary.json)
    const donosAdicionais = carregarDonosAdicionais();
    
    // Percorre todos os donos adicionais
    for (const key in donosAdicionais) {
        const donoLid = donosAdicionais[key];
        
        // Se o LID do dono adicional bate com o LID do usuário
        if (donoLid && userLid === donoLid) {
            // console.log(`✅ [isDono] Dono adicional reconhecido - ${key}: ${userLid}`);
            return true;
        }
    }
    
    // console.log(`❌ [isDono] Não é dono`);
    return false;
}

// Remove mensagem do grupo
async function removerMensagem(sock, messageKey) {
    try {
        await sock.sendMessage(messageKey.remoteJid, { delete: messageKey });
        return true;
    } catch (err) {
        console.error("❌ Erro ao remover mensagem:", err);
        return false;
    }
}

// Verifica se bot é admin do grupo
async function botEhAdmin(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const allParticipants = groupMetadata.participants;
        
        console.log(`🔍 [botEhAdmin] Verificando permissões do bot no grupo ${groupId}`);
        console.log(`🔍 [botEhAdmin] Total de participantes: ${allParticipants.length}`);
        
        // Em grupos LID, o bot pode não aparecer na lista de participantes
        // Nesse caso, vamos assumir que o bot TEM permissão se:
        // 1. O bot conseguiu obter os metadados do grupo (está no grupo)
        // 2. Nenhum erro foi lançado ao tentar acessar
        
        // Se conseguiu buscar metadata, o bot está no grupo e pode executar ações de admin
        // (Baileys só permite certas ações se o bot tiver permissão)
        console.log(`✅ [botEhAdmin] Bot está no grupo e pode executar ações (metadados obtidos com sucesso)`);
        return true;
        
    } catch (err) {
        console.error("❌ [botEhAdmin] Erro ao verificar permissões:", err);
        return false;
    }
}

// Bane usuário do grupo
async function banirUsuario(sock, groupId, userId) {
    try {
        // console.log(`⚔️ Tentando banir usuário ${userId} do grupo ${groupId}`);
        await sock.groupParticipantsUpdate(groupId, [userId], "remove");
        // console.log(`✅ Usuário ${userId} banido com sucesso!`);
        return { success: true, reason: "banido" };
    } catch (err) {
        console.error(`❌ Erro ao banir usuário ${userId}:`, err);
        if (err.message?.includes('forbidden') || err.message?.includes('not-authorized')) {
            return { success: false, reason: "sem_permissao" };
        }
        return { success: false, reason: "erro_tecnico" };
    }
}

// Processa sistema anti-spam completo
async function processarAntiSpam(sock, normalized) {
    try {
        const from = normalized.key.remoteJid;
        const sender = normalized.key.participant || from;

        // Só funciona em grupos
        if (!from.endsWith('@g.us') && !from.endsWith('@lid')) return false;

        // Não processa se for o dono
        if (isDono(sender)) {
            return false;
        }

        // Não processa se for admin
        const ehAdmin = await isAdmin(sock, from, sender);
        if (ehAdmin) {
            return false;
        }

        // Processa mensagem para verificar violações
        const resultado = await antiSpam.processarMensagem(normalized.message, from, sender, sock);

        if (!resultado.violacao) return false;

        const senderNumber = sender.split('@')[0];
        const tiposViolacao = resultado.tipos;

        console.log(`🚫 Violação detectada de ${senderNumber}: ${tiposViolacao.join(', ')}`);

        // Remove a mensagem
        const removido = await removerMensagem(sock, normalized.key);

        if (removido) {
            // Aguarda um pouco antes de tentar banir
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Tenta banir o usuário
            const resultadoBan = await banirUsuario(sock, from, sender);

            const emojiMap = {
                'antilink': '🔗',
                'anticontato': '📞',
                'antidocumento': '📄',
                'antivideo': '🎥',
                'antiaudio': '🎵',
                'antisticker': '🏷️',
                'antiflod': '🌊',
                'antiloc': '📍',
                'antiimg': '🖼️'
            };

            const violacaoEmoji = emojiMap[tiposViolacao[0]] || '🚫';
            const violacaoNome = tiposViolacao[0].toUpperCase();

            if (resultadoBan.success) {
                await reagirMensagem(sock, normalized, "⚔️");
                await reply(sock, from, `⚔️ *${violacaoEmoji} ${violacaoNome} - USUÁRIO BANIDO!*\n\n@${senderNumber} foi removido do grupo por violação!\n\n🚫 Conteúdo não permitido: ${tiposViolacao.join(', ')}\n⚡ Ação: Delete + Ban automático`, [sender]);
                console.log(`⚔️ SUCESSO: ${senderNumber} banido do grupo ${from} por ${tiposViolacao.join(', ')}`);
            } else {
                await reagirMensagem(sock, normalized, "🚫");
                let motivo = "";
                switch(resultadoBan.reason) {
                    case "bot_nao_admin":
                        motivo = "Bot não é admin do grupo";
                        break;
                    case "sem_permissao":
                        motivo = "Bot sem permissão para banir";
                        break;
                    default:
                        motivo = "Erro técnico no banimento";
                }

                await reply(sock, from, `🚫 *${violacaoEmoji} ${violacaoNome} ATIVO*\n\n@${senderNumber} sua mensagem foi deletada por violação!\n\n⚠️ **Não foi possível banir:** ${motivo}\n💡 **Solução:** Torne o bot admin do grupo`, [sender]);
                console.log(`⚠️ FALHA: Não foi possível banir ${senderNumber} - ${motivo}`);
            }
        }

        return true;
    } catch (err) {
        console.error("❌ Erro no processamento anti-spam:", err);
        return false;
    }
}

// Auto-ban para lista negra quando usuário entra no grupo
async function processarListaNegra(sock, participants, groupId, action) {
    try {
        if (action !== 'add') return;

        const config = antiSpam.carregarConfigGrupo(groupId);
        if (!config) return;

        for (const participant of participants) {
            const participantNumber = participant.split('@')[0];
            let motivo = '';
            let shouldBan = false;

            // Verifica lista negra
            if (antiSpam.isUsuarioListaNegra(participant, groupId)) {
                motivo = 'Lista Negra';
                shouldBan = true;
                console.log(`📋 Usuário da lista negra detectado: ${participantNumber}`);
            }

            if (shouldBan) {
                // Aguarda um pouco antes de banir
                await new Promise(resolve => setTimeout(resolve, 2000));

                const resultadoBan = await banirUsuario(sock, groupId, participant);

                if (resultadoBan.success) {
                    const emoji = motivo.includes('Lista Negra') ? '📋' : '🇧🇷';
                    await sock.sendMessage(groupId, {
                        text: `⚔️ *${emoji} ${motivo.toUpperCase()} - USUÁRIO BANIDO!*\n\n@${participantNumber} foi removido automaticamente!\n\n🚫 Motivo: ${motivo}\n⚡ Ação: Ban automático`,
                        mentions: [participant]
                    });
                    console.log(`⚔️ ${motivo.toUpperCase()}: ${participantNumber} banido automaticamente do grupo ${groupId}`);
                } else {
                    console.log(`⚠️ ${motivo.toUpperCase()}: Não foi possível banir ${participantNumber} - ${resultadoBan.reason}`);
                }
            }
        }
    } catch (err) {
        console.error("❌ Erro no processamento de lista negra:", err);
    }
}

// Função auxiliar para obter target (@ ou resposta de mensagem)
function obterTargetGamer(message) {
    // Primeiro tenta pegar da menção (@)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned && mentioned.length > 0) {
        return mentioned[0];
    }
    
    // Se não tem menção, tenta pegar da mensagem quotada (resposta)
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    if (quotedParticipant) {
        return quotedParticipant;
    }
    
    return null;
}

// Função genérica para processar comandos Danbooru
async function processarDanbooru(sock, from, message, tag, titulo) {
    console.log(`🎨 Comando danbooru/${tag} acionado`);
    
    const sender = message.key.participant || from;
    const isGroup = from.endsWith('@g.us') || from.endsWith('@lid');
    
    try {
        // Reage com loading apenas se a conexão estiver ativa
        await reagirMensagem(sock, message, "⏳").catch(() => {});
    } catch (e) {
        console.log("⚠️ Não foi possível reagir (conexão instável)");
    }

    // Se for grupo, avisa que vai enviar no PV
    if (isGroup) {
        try {
            await sock.sendMessage(from, {
                text: `🎲 *${titulo} - Imagens Aleatórias*\n\n📬 Enviando imagens no seu privado para manter a organização do grupo...\n\n⏳ Aguarde alguns segundos!`
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log("⚠️ Não foi possível enviar aviso no grupo");
        }
    }

    try {
        const config = obterConfiguracoes();
        const apiUrl = `https://www.api.neext.online/danbooru/${tag}`;
        
        // Faz 5 requisições em paralelo com timeout e retry
        const imagePromises = Array(5).fill(null).map(async () => {
            try {
                return await axios.get(apiUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
            } catch (err) {
                // Se falhar, tenta novamente após 1 segundo
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await axios.get(apiUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
            }
        });

        const imageResponses = await Promise.all(imagePromises);
        
        // Prepara as imagens para o carrossel
        const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
        
        const mediaPromises = imageResponses.map(response => 
            prepareWAMessageMedia(
                { image: Buffer.from(response.data) },
                { upload: sock.waUploadToServer }
            )
        );

        const mediaArray = await Promise.all(mediaPromises);

        // Cria os cards do carrossel
        const cards = mediaArray.map((media, index) => ({
            header: {
                imageMessage: media.imageMessage,
                hasMediaAttachment: true
            },
            body: {
                text: `${titulo} - Imagem ${index + 1}/5`
            },
            nativeFlowMessage: {
                buttons: []
            }
        }));

        // Define onde enviar: se for grupo, envia no PV do usuário; se não, envia onde foi solicitado
        const targetJid = isGroup ? sender : from;

        // Cria mensagem em carrossel
        const carouselMessage = generateWAMessageFromContent(targetJid, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: `🎲 *${titulo}* 🎲\n\n📌 5 imagens aleatórias\n\n© ${config.nomeDoBot}`
                        },
                        carouselMessage: {
                            cards: cards
                        }
                    }
                }
            }
        }, {});

        await sock.relayMessage(targetJid, carouselMessage.message, {});
        
        try {
            await reagirMensagem(sock, message, "✅");
        } catch (e) {
            console.log("⚠️ Não foi possível reagir com sucesso (conexão instável)");
        }
        
        const destino = isGroup ? `PV de ${sender.split('@')[0]}` : from;
        console.log(`✅ ${tag} - Carrossel enviado com sucesso para ${destino}!`);

    } catch (error) {
        console.error(`❌ Erro ao buscar ${tag}:`, error.message);
        
        try {
            await reagirMensagem(sock, message, "❌");
            const targetJid = isGroup ? sender : from;
            await sock.sendMessage(targetJid, {
                text: `❌ Erro ao buscar imagens de ${titulo}. Tente novamente!\n\n💡 Motivo: ${error.message}`
            }, {});
        } catch (sendError) {
            console.error(`❌ Não foi possível enviar mensagem de erro:`, sendError.message);
        }
    }
}

// Função principal de comandos
async function handleCommand(sock, message, command, args, from, quoted) {
    const msg = message.message;
    if (!msg) return;

    // Define se é grupo ou não
    const isGroup = from.endsWith('@g.us') || from.endsWith('@lid');
    const sender = isGroup ? message.key.participant : from;

    // Verifica antiflodcomando (apenas em grupos)
    if (isGroup) {
        // Não aplica para dono e admins
        const ehDono = isDono(sender);
        const ehAdmin = await isAdmin(sock, from, sender);
        
        if (!ehDono && !ehAdmin) {
            // Lista de comandos que NÃO devem ser afetados pelo antiflodcomando
            const comandosExcluidos = [
                // Jogos interativos
                'xadrez', 'akinator', 'akinatorvoltar', 'akinatorparar',
                // RPG (jogos que requerem múltiplos comandos sequenciais)
                'perfil', 'trabalhar', 'estudar', 'pescar', 'minerar', 'coletar', 'cacar',
                'tigrinho', 'assaltar', 'depositar', 'sacar', 'daily', 'inventario',
                'loja', 'comprar', 'vender', 'trabalhos', 'escolhertrabalho', 'educacao',
                // Outros jogos
                'jogodavelha', 'roletarussa', 'disparar', 'jogodaforca',
                // Comandos de sistema básicos
                'ping', 'menu', 'menuadm', 'menudono', 'menugamer',
                'menudownload', 'menufigurinhas', 'menuhentai', 'menurandom',
                // Comandos de agendamento e grupo
                'time-status', 'opengp', 'closegp', 'linkgrupo', 'linkdogrupo', 'link'
            ];
            
            // Se o comando não está na lista de excluídos, verifica flood
            if (!comandosExcluidos.includes(command)) {
                const config = antiSpam.carregarConfigGrupo(from);
                if (config) {
                    const resultado = antiSpam.verificarFloodComando(sender, from, command, config);
                    if (resultado.bloqueado) {
                        await reagirMensagem(sock, message, "⏱️");
                        await reply(sock, from, resultado.mensagem, [sender]);
                        return; // Bloqueia execução do comando
                    }
                }
            }
        }
    }

    // Verifica se modo SOADM está ativo (somente admins podem usar comandos)
    if (isGroup) {
        const configGrupo = antiSpam.carregarConfigGrupo(from);
        if (configGrupo && configGrupo.soadm) {
            // Verifica se o usuário é admin ou dono
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);
            
            // Se não for admin nem dono, ignora o comando
            if (!ehAdmin && !ehDono) {
                // Ignora silenciosamente - não responde nada
                return;
            }
        }
    }

    switch (command) {
        case "ping": {
            const now = new Date();
            
            // Memória - converte para GB se > 1GB, senão MB
            const totalMemBytes = os.totalmem();
            const freeMemBytes = os.freemem();
            const usedMemBytes = totalMemBytes - freeMemBytes;
            
            const formatMemory = (bytes) => {
                const gb = bytes / 1024 / 1024 / 1024;
                if (gb >= 1) {
                    return `${gb.toFixed(2)} GB`;
                } else {
                    const mb = bytes / 1024 / 1024;
                    return `${mb.toFixed(2)} MB`;
                }
            };
            
            const totalMem = formatMemory(totalMemBytes);
            const freeMem = formatMemory(freeMemBytes);
            const usedMem = formatMemory(usedMemBytes);
            const memUsagePercent = ((usedMemBytes / totalMemBytes) * 100).toFixed(1);
            
            // Uptime do bot
            let uptimeSec = process.uptime();
            const days = Math.floor(uptimeSec / 86400);
            uptimeSec %= 86400;
            const hours = Math.floor(uptimeSec / 3600);
            uptimeSec %= 3600;
            const minutes = Math.floor(uptimeSec / 60);
            const seconds = Math.floor(uptimeSec % 60);
            const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            
            // Sistema
            const platform = os.platform();
            const platformName = {
                'linux': '🐧 Linux',
                'darwin': '🍎 MacOS',
                'win32': '🪟 Windows',
                'android': '🤖 Android'
            }[platform] || `💻 ${platform}`;
            
            const arch = os.arch();
            const cpus = os.cpus();
            const cpuModel = cpus[0]?.model || 'Desconhecido';
            const cpuCores = cpus.length;
            
            // Latência (tempo de resposta)
            const startTime = Date.now();
            const latency = Date.now() - startTime;

            const pingMessage = `
╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🤖 *STATUS DO BOT*
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━━━━ ⏰ *TEMPO* ━━━━┓
┃ 📅 Data: ${now.toLocaleDateString('pt-BR')}
┃ ⏰ Hora: ${now.toLocaleTimeString('pt-BR')}
┃ 🟢 Uptime: ${uptime}
┃ ⚡ Latência: ${latency}ms
┗━━━━━━━━━━━━━━━━━━━┛

┏━━━━ 💾 *MEMÓRIA* ━━━━┓
┃ 📊 Total: ${totalMem}
┃ ✅ Livre: ${freeMem}
┃ 🔴 Em Uso: ${usedMem} (${memUsagePercent}%)
┗━━━━━━━━━━━━━━━━━━━┛

┏━━━━ 🖥️ *SISTEMA* ━━━━┓
┃ 💻 OS: ${platformName}
┃ 🔧 Arch: ${arch}
┃ 🧮 CPU: ${cpuModel.substring(0, 30)}${cpuModel.length > 30 ? '...' : ''}
┃ ⚙️ Cores: ${cpuCores}
┗━━━━━━━━━━━━━━━━━━━┛

╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  © *NEEXT LTDA* 🐦‍🔥
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, {
                image: { url: "https://i.ibb.co/xqddxGC6/d75ddb6631f10a0eff0b227c5b7617f2.jpg" },
                caption: pingMessage,
                contextInfo: {
                    mentionedJid: [from],
                    isForwarded: true,
                    forwardingScore: 100000,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363289739581116@newsletter",
                        newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                    },
                    externalAdReply: {
                        title: `© NEEXT LTDA`,
                        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                        mediaType: 1,
                        sourceUrl: "www.neext.online"
                    }
                }
            }, { quoted: selinho });
        }
        break;

        case "resetcache":
        case "reset": {
            // Só o dono pode usar
            if (!isDono(message.key.participant || from)) {
                await reply(sock, from, "❌ Este comando é exclusivo do dono do bot.");
                break;
            }

            try {
                // Limpa cache de mensagens processadas
                processedMessages.clear();
                
                await reagirMensagem(sock, message, "♻️");
                await reply(sock, from, 
                    `✅ *CACHE LIMPO COM SUCESSO!*\n\n` +
                    `♻️ Cache de mensagens resetado\n` +
                    `🔄 Bot pronto para processar comandos\n\n` +
                    `💡 Use este comando se o bot estiver ignorando mensagens.`
                );
            } catch (err) {
                console.error("❌ Erro ao resetar cache:", err);
                await reply(sock, from, "❌ Erro ao resetar cache. Tente novamente.");
            }
        }
        break;

        case "hora":
            await sock.sendMessage(from, {
                text: `⏰ Agora é: ${new Date().toLocaleTimeString()}`,
                contextInfo: contextAnuncio
            });
            break;

        case "calcular":
        case "calc": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}calcular [expressão]\n\n💡 Exemplos:\n• ${config.prefix}calcular 7+7\n• ${config.prefix}calcular 10*5\n• ${config.prefix}calcular 100/4\n• ${config.prefix}calcular (5+3)*2`);
                break;
            }

            try {
                const expressao = args.join(' ').trim();
                
                // Validação de segurança - só permite números, operadores matemáticos e parênteses
                if (!/^[\d+\-*/(). ]+$/.test(expressao)) {
                    await reply(sock, from, "❌ Expressão inválida! Use apenas números e operadores matemáticos (+, -, *, /, parênteses).");
                    break;
                }

                // Calcula usando Function (mais seguro que eval)
                const resultado = Function(`'use strict'; return (${expressao})`)();
                
                if (resultado === Infinity || resultado === -Infinity) {
                    await reply(sock, from, "❌ Erro: Divisão por zero!");
                    break;
                }

                if (isNaN(resultado)) {
                    await reply(sock, from, "❌ Erro: Expressão matemática inválida!");
                    break;
                }

                const mensagem = `🧮 *CALCULADORA*\n\n📝 Expressão: ${expressao}\n✅ Resultado: *${resultado}*`;
                
                await sock.sendMessage(from, {
                    text: mensagem,
                    contextInfo: {
                        forwardingScore: 100000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363289739581116@newsletter",
                            newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                        }
                    }
                }, { quoted: selinho });

            } catch (error) {
                console.error("❌ Erro no cálculo:", error);
                await reply(sock, from, "❌ Erro ao calcular! Verifique se a expressão está correta.");
            }
        }
        break;

        case "dicionario":
        case "dicio": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}dicionario [palavra]\n\n💡 Exemplo: ${config.prefix}dicionario água`);
                break;
            }

            try {
                const palavra = args.join(' ').trim();
                await reagirMensagem(sock, message, "📖");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/dicionario?q=${encodeURIComponent(palavra)}`);
                
                if (response.data && response.data.palavra) {
                    const { palavra: palavraEncontrada, definicao, imagem } = response.data;
                    
                    const mensagem = `📖 *DICIONÁRIO*\n\n` +
                        `📝 Palavra: *${palavraEncontrada}*\n\n` +
                        `💬 Definição:\n${definicao}`;
                    
                    // Envia a imagem com a definição se houver imagem
                    if (imagem) {
                        await sock.sendMessage(from, {
                            image: { url: imagem },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        // Se não houver imagem, envia apenas o texto
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Palavra "${palavra}" não encontrada no dicionário.`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar no dicionário:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar no dicionário! Tente novamente mais tarde.");
            }
        }
        break;

        case "amazon": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}amazon [produto]\n\n💡 Exemplo: ${config.prefix}amazon iPhone 16`);
                break;
            }

            try {
                const produto = args.join(' ').trim();
                await reagirMensagem(sock, message, "🛒");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/amazon?q=${encodeURIComponent(produto)}`);
                
                if (response.data && response.data.status === 200 && response.data.resultados && response.data.resultados.length > 0) {
                    const resultados = response.data.resultados.slice(0, 5); // Pega os primeiros 5 resultados
                    
                    let mensagem = `🛒 *AMAZON - Resultados para "${produto}"*\n\n`;
                    
                    resultados.forEach((item, index) => {
                        mensagem += `━━━━━━━━━━━━━━━\n`;
                        mensagem += `*${index + 1}. ${item.titulo}*\n`;
                        mensagem += `💰 Preço: ${item.preco}\n`;
                        if (item.avaliacao) {
                            mensagem += `⭐ Avaliação: ${item.avaliacao}\n`;
                        }
                        if (item.link) {
                            mensagem += `🔗 Link: ${item.link}\n`;
                        }
                        mensagem += `\n`;
                    });
                    
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📦 Total de resultados: ${response.data.resultados.length}`;
                    
                    // Envia a primeira imagem com a mensagem
                    if (resultados[0].imagem) {
                        await sock.sendMessage(from, {
                            image: { url: resultados[0].imagem },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        // Se não houver imagem, envia apenas o texto
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Nenhum produto encontrado para "${produto}" na Amazon.`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar na Amazon:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar produtos na Amazon! Tente novamente mais tarde.");
            }
        }
        break;

        case "cep": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}cep [número]\n\n💡 Exemplo: ${config.prefix}cep 01001000`);
                break;
            }

            try {
                const cep = args[0].replace(/\D/g, ''); // Remove tudo que não é número
                
                if (cep.length !== 8) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ CEP inválido! O CEP deve conter 8 dígitos.\n\n💡 Exemplo: 01001000");
                    break;
                }

                await reagirMensagem(sock, message, "📮");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/cep?cep=${cep}`);
                
                if (response.data && response.data.cep) {
                    const data = response.data;
                    
                    let mensagem = `📮 *CONSULTA CEP*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📍 CEP: ${data.cep}\n`;
                    mensagem += `🛣️ Logradouro: ${data.logradouro || 'N/A'}\n`;
                    if (data.complemento) {
                        mensagem += `📝 Complemento: ${data.complemento}\n`;
                    }
                    mensagem += `🏘️ Bairro: ${data.bairro || 'N/A'}\n`;
                    mensagem += `🏙️ Cidade: ${data.localidade || 'N/A'}\n`;
                    mensagem += `🗺️ Estado: ${data.estado || data.uf || 'N/A'}\n`;
                    mensagem += `🌎 Região: ${data.regiao || 'N/A'}\n`;
                    mensagem += `📞 DDD: ${data.ddd || 'N/A'}\n`;
                    if (data.ibge) {
                        mensagem += `🔢 IBGE: ${data.ibge}\n`;
                    }
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                    
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ CEP "${cep}" não encontrado!`);
                }

            } catch (error) {
                console.error("❌ Erro ao consultar CEP:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao consultar CEP! Verifique se o CEP está correto e tente novamente.");
            }
        }
        break;

        case "ip": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}ip [endereço IP]\n\n💡 Exemplo: ${config.prefix}ip 8.8.8.8`);
                break;
            }

            try {
                const ip = args[0].trim();
                await reagirMensagem(sock, message, "🌐");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/ip?ip=${encodeURIComponent(ip)}`);
                
                if (response.data && response.data.ip) {
                    const data = response.data;
                    
                    let mensagem = `🌐 *CONSULTA IP*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `🔢 IP: ${data.ip}\n`;
                    mensagem += `📡 Versão: ${data.version || 'N/A'}\n`;
                    mensagem += `🏙️ Cidade: ${data.city || 'N/A'}\n`;
                    mensagem += `📍 Região: ${data.region || 'N/A'} (${data.region_code || 'N/A'})\n`;
                    mensagem += `🌍 País: ${data.country_name || data.country || 'N/A'} (${data.country_code || 'N/A'})\n`;
                    mensagem += `🗺️ Continente: ${data.continent_code || 'N/A'}\n`;
                    if (data.postal) {
                        mensagem += `📮 CEP: ${data.postal}\n`;
                    }
                    if (data.latitude && data.longitude) {
                        mensagem += `📌 Coordenadas: ${data.latitude}, ${data.longitude}\n`;
                    }
                    mensagem += `⏰ Timezone: ${data.timezone || 'N/A'}\n`;
                    if (data.utc_offset) {
                        mensagem += `🕐 UTC Offset: ${data.utc_offset}\n`;
                    }
                    mensagem += `💰 Moeda: ${data.currency_name || 'N/A'} (${data.currency || 'N/A'})\n`;
                    if (data.asn) {
                        mensagem += `🏢 ASN: ${data.asn}\n`;
                    }
                    if (data.org) {
                        mensagem += `🏢 Organização: ${data.org}\n`;
                    }
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                    
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ IP "${ip}" inválido ou não encontrado!`);
                }

            } catch (error) {
                console.error("❌ Erro ao consultar IP:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao consultar IP! Verifique se o IP está correto e tente novamente.");
            }
        }
        break;

        case "ddd": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}ddd [número]\n\n💡 Exemplo: ${config.prefix}ddd 11`);
                break;
            }

            try {
                const ddd = args[0].replace(/\D/g, '');
                
                if (ddd.length < 2 || ddd.length > 3) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ DDD inválido! O DDD deve conter 2 ou 3 dígitos.\n\n💡 Exemplo: 11, 21, 85");
                    break;
                }

                await reagirMensagem(sock, message, "📞");
                
                const response = await axios.get(`https://www.api.neext.online/ddd?numero=${ddd}`);
                
                if (response.data && response.data.status === 200 && response.data.estado) {
                    const data = response.data;
                    
                    let mensagem = `📞 *CONSULTA DDD*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📍 DDD: ${ddd}\n`;
                    mensagem += `🗺️ Estado: ${data.estado}\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `🏙️ *CIDADES (${data.cidades.length}):*\n\n`;
                    
                    const cidadesPorLinha = [];
                    for (let i = 0; i < data.cidades.length; i += 3) {
                        const grupo = data.cidades.slice(i, i + 3);
                        cidadesPorLinha.push(grupo.join(', '));
                    }
                    
                    mensagem += cidadesPorLinha.join('\n');
                    mensagem += `\n━━━━━━━━━━━━━━━`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                    
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ DDD "${ddd}" não encontrado!`);
                }

            } catch (error) {
                console.error("❌ Erro ao consultar DDD:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao consultar DDD! Verifique se o DDD está correto e tente novamente.");
            }
        }
        break;

        // ==================== COMANDOS DE NOTÍCIAS ====================

        case "jovempan": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/jovempan');
                
                if (response.data && response.data.status === 200 && response.data.results && response.data.results.length > 0) {
                    const noticias = response.data.results;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *JOVEM PAN*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.title}*\n\n`;
                    if (noticia.author) mensagem += `✍️ Autor: ${noticia.author}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.image) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.image },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Jovem Pan:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "g1": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/g1');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *G1*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.descricao) mensagem += `📝 ${noticia.descricao}\n\n`;
                    if (noticia.categoria) mensagem += `📁 Categoria: ${noticia.categoria}\n`;
                    if (noticia.postado) mensagem += `⏰ ${noticia.postado}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias G1:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "poder360": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/poder360');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *PODER360*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Poder360:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "uol": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/uol');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *UOL*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias UOL:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "cnn": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/cnn');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *CNN BRASIL*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.autor) mensagem += `✍️ Autor: ${noticia.autor}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias CNN:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "estadao": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/estadao');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *ESTADÃO*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.desc) mensagem += `📝 ${noticia.desc}\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Estadão:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "terra": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/terra');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *TERRA*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Terra:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "exame": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/exame');
                
                if (response.data && response.data.status && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *EXAME*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Exame:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "bbc": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/bbc');
                
                if (response.data && response.data.resultado && response.data.resultado.length > 0) {
                    const noticias = response.data.resultado;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *BBC BRASIL*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.desc) mensagem += `📝 ${noticia.desc}\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias BBC:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "agazeta": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/agazeta');
                
                if (response.data && response.data.status && response.data.resultado && response.data.resultado.length > 0) {
                    const noticias = response.data.resultado;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *A GAZETA*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.desc) mensagem += `📝 ${noticia.desc}\n\n`;
                    if (noticia.categoria) mensagem += `📁 Categoria: ${noticia.categoria}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias A Gazeta:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "veja": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/veja');
                
                if (response.data && response.data.status && response.data.resultado && response.data.resultado.length > 0) {
                    const noticias = response.data.resultado;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *VEJA*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.categoria) mensagem += `📁 Categoria: ${noticia.categoria}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Veja:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "metropoles": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/metropoles');
                
                if (response.data && response.data.status === 200 && response.data.resultado && response.data.resultado.length > 0) {
                    const noticias = response.data.resultado;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *METRÓPOLES*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.categoria) mensagem += `📁 Categoria: ${noticia.categoria}\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Metrópoles:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "folha": {
            try {
                await reagirMensagem(sock, message, "📰");
                const response = await axios.get('https://www.api.neext.online/jornal/folha');
                
                if (response.data && response.data.status === 200 && response.data.resultado && response.data.resultado.length > 0) {
                    const noticias = response.data.resultado;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `📰 *FOLHA DE S.PAULO*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📌 *${noticia.noticia}*\n\n`;
                    if (noticia.desc) mensagem += `📝 ${noticia.desc}\n\n`;
                    mensagem += `🔗 Link: ${noticia.link}\n`;
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    if (noticia.imagem) {
                        await sock.sendMessage(from, {
                            image: { url: noticia.imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias Folha:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        case "espn": {
            try {
                await reagirMensagem(sock, message, "⚽");
                const response = await axios.get('https://www.api.neext.online/jornal/espn');
                
                if (response.data && response.data.status === 200 && response.data.resultados && response.data.resultados.length > 0) {
                    const noticias = response.data.resultados;
                    const noticia = noticias[Math.floor(Math.random() * noticias.length)];
                    
                    let mensagem = `⚽ *ESPN*\n\n`;
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    
                    if (noticia['🏆 Campeonato']) mensagem += `🏆 ${noticia['🏆 Campeonato']}\n\n`;
                    
                    const manchete = noticia['📰 Manchete'] || noticia.manchete || noticia.noticia || '';
                    mensagem += `📌 *${manchete}*\n\n`;
                    
                    const tempo = noticia['⏱️ Tempo'] || noticia.tempo || '';
                    if (tempo) mensagem += `⏱️ ${tempo}\n`;
                    
                    const link = noticia.link || noticia['🔗 Link'] || '';
                    if (link) mensagem += `🔗 Link: ${link}\n`;
                    
                    mensagem += `━━━━━━━━━━━━━━━`;
                    
                    const imagem = noticia['🖼️ Imagem'] || noticia.imagem || '';
                    if (imagem) {
                        await sock.sendMessage(from, {
                            image: { url: imagem },
                            caption: mensagem
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: selinho });
                    }
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Nenhuma notícia encontrada no momento.");
                }
            } catch (error) {
                console.error("❌ Erro ao buscar notícias ESPN:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar notícias! Tente novamente mais tarde.");
            }
        }
        break;

        // ==================== FIM DOS COMANDOS DE NOTÍCIAS ====================

        case "signo": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                const signos = "áries, touro, gêmeos, câncer, leão, virgem, libra, escorpião, sagitário, capricórnio, aquário, peixes";
                await reply(sock, from, `❌ Use: ${config.prefix}signo [signo]\n\n♏ Signos disponíveis:\n${signos}\n\n💡 Exemplo: ${config.prefix}signo escorpião`);
                break;
            }

            try {
                const signoInput = args.join(' ').trim().toLowerCase();
                await reagirMensagem(sock, message, "♏");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/signo?q=${encodeURIComponent(signoInput)}`);
                
                if (response.data && response.data.signo) {
                    const { signo, imagem, descricao } = response.data;
                    
                    const mensagem = `♏ *SIGNO - ${signo.toUpperCase()}*\n\n` +
                        `📜 Descrição:\n${descricao}`;
                    
                    // Envia a imagem com a descrição se houver imagem
                    if (imagem) {
                        await sock.sendMessage(from, {
                            image: { url: imagem },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        // Se não houver imagem, envia apenas o texto
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Signo "${signoInput}" não encontrado. Verifique se digitou corretamente.`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar signo:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar informações do signo! Tente novamente mais tarde.");
            }
        }
        break;

        case "significadonome":
        case "significado": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}significadonome [nome]\n\n💡 Exemplo: ${config.prefix}significadonome Maria`);
                break;
            }

            try {
                const nome = args.join(' ').trim();
                await reagirMensagem(sock, message, "👤");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/pesquisa/significadonome?nome=${encodeURIComponent(nome)}`);
                
                if (response.data && response.data.status === 200 && response.data.resultado) {
                    const { nome: nomeEncontrado, resultado, imagem } = response.data;
                    
                    const mensagem = `👤 *SIGNIFICADO DO NOME - ${nomeEncontrado.toUpperCase()}*\n\n` +
                        `📜 ${resultado}\n\n` +
                        `📚 Fonte: ${response.data.fonte || 'Dicionário de Nomes Próprios'}`;
                    
                    // Envia a imagem com o significado se houver imagem
                    if (imagem) {
                        await sock.sendMessage(from, {
                            image: { url: imagem },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        // Se não houver imagem, envia apenas o texto
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível encontrar o significado do nome "${nome}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar significado do nome:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar significado do nome! Tente novamente mais tarde.");
            }
        }
        break;

        case "playstore": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}playstore [app]\n\n💡 Exemplo: ${config.prefix}playstore whatsapp`);
                break;
            }

            try {
                const busca = args.join(' ').trim();
                await reagirMensagem(sock, message, "📱");
                
                const response = await axios.get(`https://www.api.neext.online/playstore?q=${encodeURIComponent(busca)}`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const resultados = response.data.slice(0, 5);
                    
                    let mensagem = `📱 *PLAY STORE - "${busca}"*\n\n`;
                    
                    resultados.forEach((app, index) => {
                        mensagem += `━━━━━━━━━━━━━━━\n`;
                        mensagem += `*${index + 1}. ${app.nama}*\n`;
                        mensagem += `👨‍💻 Dev: ${app.developer}\n`;
                        if (app.rate2) {
                            mensagem += `⭐ Nota: ${app.rate2}/5\n`;
                        }
                        mensagem += `🔗 Link: ${app.link}\n\n`;
                    });
                    
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📦 Total: ${response.data.length} apps encontrados`;
                    
                    if (resultados[0].img) {
                        await sock.sendMessage(from, {
                            image: { url: resultados[0].img },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                    
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Nenhum app encontrado para "${busca}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar na Play Store:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar apps! Tente novamente mais tarde.");
            }
        }
        break;

        case "tiktoksearch":
        case "ttsearch": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}tiktoksearch [busca]\n\n💡 Exemplo: ${config.prefix}tiktoksearch edit anime`);
                break;
            }

            try {
                const busca = args.join(' ').trim();
                await reagirMensagem(sock, message, "🎵");
                
                const response = await axios.get(`https://www.api.neext.online/api/tiktok?q=${encodeURIComponent(busca)}`);
                
                if (response.data && response.data.success && response.data.videos && response.data.videos.length > 0) {
                    // Pega um vídeo aleatório da lista
                    const randomIndex = Math.floor(Math.random() * response.data.videos.length);
                    const video = response.data.videos[randomIndex];
                    
                    if (video.play) {
                        await sock.sendMessage(from, {
                            video: { url: video.play },
                            caption: `🎵 *${video.title.substring(0, 200)}*`,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                        
                        await reagirMensagem(sock, message, "✅");
                    } else {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, `❌ Não foi possível baixar o vídeo.`);
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Nenhum vídeo encontrado para "${busca}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar no TikTok:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar vídeos! Tente novamente mais tarde.");
            }
        }
        break;

        case "reels":
        case "reelssearch": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}reels [busca]\n\n💡 Exemplo: ${config.prefix}reels edits`);
                break;
            }

            try {
                const busca = args.join(' ').trim();
                await reagirMensagem(sock, message, "📸");
                
                const response = await axios.get(`https://www.api.neext.online/pesquisa/reels?q=${encodeURIComponent(busca)}`);
                
                if (response.data && response.data.results && response.data.results.search_data && response.data.results.search_data.length > 0) {
                    // Pega um reel aleatório
                    const randomIndex = Math.floor(Math.random() * response.data.results.search_data.length);
                    const reel = response.data.results.search_data[randomIndex];
                    
                    // Pega a URL do vídeo direto da resposta
                    if (reel.reels && reel.reels.url) {
                        let caption = `📸 *@${reel.profile.username}*\n\n`;
                        if (reel.caption) {
                            caption += `${reel.caption.substring(0, 200)}`;
                        }
                        
                        await sock.sendMessage(from, {
                            video: { url: reel.reels.url },
                            caption: caption,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                        
                        await reagirMensagem(sock, message, "✅");
                    } else {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, `❌ Não foi possível obter o vídeo do reel.`);
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Nenhum reel encontrado para "${busca}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar reels:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar reels! Tente novamente mais tarde.");
            }
        }
        break;

        case "wattpad": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}wattpad [busca]\n\n💡 Exemplo: ${config.prefix}wattpad naruto`);
                break;
            }

            try {
                const busca = args.join(' ').trim();
                await reagirMensagem(sock, message, "📚");
                
                const response = await axios.get(`https://www.api.neext.online/pesquisa/wattpad?q=${encodeURIComponent(busca)}`);
                
                if (response.data && response.data.status === 200 && response.data.results && response.data.results.length > 0) {
                    const historias = response.data.results.slice(0, 5);
                    
                    let mensagem = `📚 *WATTPAD - "${busca}"*\n\n`;
                    
                    historias.forEach((historia, index) => {
                        mensagem += `━━━━━━━━━━━━━━━\n`;
                        mensagem += `*${index + 1}. ${historia.titulo}*\n`;
                        mensagem += `📝 ${historia.description.substring(0, 150)}...\n`;
                        mensagem += `🔗 ${historia.link}\n\n`;
                    });
                    
                    mensagem += `━━━━━━━━━━━━━━━\n`;
                    mensagem += `📦 Total: ${response.data.results.length} histórias`;
                    
                    if (historias[0].imagem) {
                        await sock.sendMessage(from, {
                            image: { url: historias[0].imagem },
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                    
                    await reagirMensagem(sock, message, "✅");
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Nenhuma história encontrada para "${busca}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar no Wattpad:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar histórias! Tente novamente mais tarde.");
            }
        }
        break;

        case "tempo":
        case "clima":
        case "previsao": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}tempo [cidade]\n\n💡 Exemplos:\n• ${config.prefix}tempo São Paulo\n• ${config.prefix}tempo Rio de Janeiro\n• ${config.prefix}tempo Belo Horizonte`);
                break;
            }

            try {
                const cidade = args.join(' ').trim();
                await reagirMensagem(sock, message, "🌤️");
                
                // Faz a requisição para a API
                const response = await axios.get(`https://www.api.neext.online/accuweather?cidade=${encodeURIComponent(cidade)}`);
                
                if (response.data && response.data.cidade) {
                    const { cidade: cidadeEncontrada, clima_atual, previsao_3_dias } = response.data;
                    
                    let mensagem = `🌤️ *PREVISÃO DO TEMPO - ${cidadeEncontrada.toUpperCase()}*\n\n`;
                    
                    // Clima atual
                    if (clima_atual) {
                        mensagem += `📍 *CLIMA ATUAL:*\n`;
                        mensagem += `🌡️ Temperatura: ${clima_atual.temperatura}\n`;
                        mensagem += `☁️ Condição: ${clima_atual.descricao}\n`;
                        mensagem += `💧 Umidade: ${clima_atual.umidade}\n`;
                        mensagem += `💨 Vento: ${clima_atual.vento}\n\n`;
                    }
                    
                    // Previsão para os próximos dias
                    if (previsao_3_dias && previsao_3_dias.length > 0) {
                        mensagem += `📅 *PREVISÃO PARA OS PRÓXIMOS DIAS:*\n\n`;
                        
                        previsao_3_dias.forEach((dia, index) => {
                            const dataFormatada = new Date(dia.data + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit'
                            });
                            
                            mensagem += `━━━━━━━━━━━━━━━\n`;
                            mensagem += `📆 *${dataFormatada}*\n`;
                            mensagem += `🔵 Mínima: ${dia.minima}\n`;
                            mensagem += `🔴 Máxima: ${dia.maxima}\n`;
                            mensagem += `☁️ ${dia.descricao}\n`;
                            if (index < previsao_3_dias.length - 1) mensagem += `\n`;
                        });
                    }
                    
                    mensagem += `\n━━━━━━━━━━━━━━━\n`;
                    mensagem += `📡 Fonte: AccuWeather`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível encontrar a previsão do tempo para "${cidade}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar previsão do tempo:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar previsão do tempo! Tente novamente mais tarde.");
            }
        }
        break;

        case "screenshotweb":
        case "screenshot":
        case "ssweb": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}screenshotweb [url]\n\n💡 Exemplos:\n• ${config.prefix}screenshotweb www.google.com\n• ${config.prefix}screenshotweb https://www.neext.online\n• ${config.prefix}screenshot twitter.com`);
                break;
            }

            try {
                let url = args.join(' ').trim();
                
                // Remove https:// ou http:// se o usuário incluiu
                url = url.replace(/^https?:\/\//, '');
                
                await reagirMensagem(sock, message, "📸");
                await reply(sock, from, `⏳ Tirando screenshot de *${url}*...\nAguarde um momento...`);
                
                // Faz a requisição para a API (a API retorna a imagem diretamente)
                const response = await axios.get(`https://www.api.neext.online/tools/ssweb?url=${encodeURIComponent(url)}`, {
                    responseType: 'arraybuffer'
                });
                
                if (response.data) {
                    const buffer = Buffer.from(response.data, 'binary');
                    
                    await sock.sendMessage(from, {
                        image: buffer,
                        caption: `📸 *SCREENSHOT WEB*\n\n🌐 URL: ${url}\n\n━━━━━━━━━━━━━━━\n© NEEXT LTDA`,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível tirar screenshot de "${url}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao tirar screenshot:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao tirar screenshot! Verifique se a URL está correta e tente novamente.");
            }
        }
        break;

        case "imdbfilme":
        case "filme": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}imdbfilme [nome do filme]\n\n💡 Exemplos:\n• ${config.prefix}imdbfilme Homem aranha\n• ${config.prefix}filme Vingadores\n• ${config.prefix}imdbfilme Matrix`);
                break;
            }

            try {
                const nomeFilme = args.join(' ').trim();
                await reagirMensagem(sock, message, "🎬");
                
                const response = await axios.get(`https://www.api.neext.online/imdb/filme?nome=${encodeURIComponent(nomeFilme)}`);
                
                if (response.data && response.data.titulo) {
                    const { titulo, descricao, nota, lancamento, capa } = response.data;
                    
                    const dataLancamento = new Date(lancamento).toLocaleDateString('pt-BR');
                    
                    let mensagem = `🎬 *${titulo.toUpperCase()}*\n\n`;
                    mensagem += `📝 *Descrição:*\n${descricao}\n\n`;
                    mensagem += `⭐ *Nota:* ${nota}/10\n`;
                    mensagem += `📅 *Lançamento:* ${dataLancamento}\n`;
                    mensagem += `\n━━━━━━━━━━━━━━━\n`;
                    mensagem += `📡 Fonte: IMDB`;
                    
                    if (capa) {
                        const imagemResponse = await axios.get(capa, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(imagemResponse.data, 'binary');
                        
                        await sock.sendMessage(from, {
                            image: buffer,
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível encontrar o filme "${nomeFilme}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar filme:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar filme! Tente novamente mais tarde.");
            }
        }
        break;

        case "imdbanime":
        case "anime": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}imdbanime [nome do anime]\n\n💡 Exemplos:\n• ${config.prefix}imdbanime Naruto\n• ${config.prefix}anime One Piece\n• ${config.prefix}imdbanime Death Note`);
                break;
            }

            try {
                const nomeAnime = args.join(' ').trim();
                await reagirMensagem(sock, message, "📺");
                
                const response = await axios.get(`https://www.api.neext.online/anime/anime?nome=${encodeURIComponent(nomeAnime)}`);
                
                if (response.data && response.data.titulo) {
                    const { titulo, descricao, nota, lancamento, capa } = response.data;
                    
                    const dataLancamento = new Date(lancamento).toLocaleDateString('pt-BR');
                    
                    let mensagem = `📺 *${titulo.toUpperCase()}*\n\n`;
                    mensagem += `📝 *Descrição:*\n${descricao}\n\n`;
                    mensagem += `⭐ *Nota:* ${nota}%\n`;
                    mensagem += `📅 *Lançamento:* ${dataLancamento}\n`;
                    mensagem += `\n━━━━━━━━━━━━━━━\n`;
                    mensagem += `📡 Fonte: MyAnimeList`;
                    
                    if (capa) {
                        const imagemResponse = await axios.get(capa, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(imagemResponse.data, 'binary');
                        
                        await sock.sendMessage(from, {
                            image: buffer,
                            caption: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    } else {
                        await sock.sendMessage(from, {
                            text: mensagem,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                }
                            }
                        }, { quoted: selinho });
                    }
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível encontrar o anime "${nomeAnime}".`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar anime:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar anime! Tente novamente mais tarde.");
            }
        }
        break;

        case "imdbtopfilmes":
        case "topfilmes": {
            try {
                await reagirMensagem(sock, message, "🏆");
                
                const response = await axios.get(`https://www.api.neext.online/imdb/top10`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    let mensagem = `🏆 *TOP 10 FILMES - IMDB*\n\n`;
                    
                    response.data.forEach((filme, index) => {
                        const dataLancamento = new Date(filme.lancamento).toLocaleDateString('pt-BR');
                        
                        mensagem += `━━━━━━━━━━━━━━━\n`;
                        mensagem += `${index + 1}. 🎬 *${filme.titulo}*\n`;
                        mensagem += `⭐ Nota: ${filme.nota}/10\n`;
                        mensagem += `📅 Lançamento: ${dataLancamento}\n`;
                        if (index < response.data.length - 1) mensagem += `\n`;
                    });
                    
                    mensagem += `\n━━━━━━━━━━━━━━━\n`;
                    mensagem += `📡 Fonte: IMDB`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível buscar o top 10 de filmes.`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar top filmes:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar top filmes! Tente novamente mais tarde.");
            }
        }
        break;

        case "imdbtopanimes":
        case "topanimes": {
            try {
                await reagirMensagem(sock, message, "⭐");
                
                const response = await axios.get(`https://www.api.neext.online/anime/top10`);
                
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    let mensagem = `⭐ *TOP 10 ANIMES - MAL*\n\n`;
                    
                    response.data.forEach((anime, index) => {
                        const dataLancamento = new Date(anime.lancamento).toLocaleDateString('pt-BR');
                        
                        mensagem += `━━━━━━━━━━━━━━━\n`;
                        mensagem += `${index + 1}. 📺 *${anime.titulo}*\n`;
                        mensagem += `⭐ Nota: ${anime.nota}%\n`;
                        mensagem += `📅 Lançamento: ${dataLancamento}\n`;
                        if (index < response.data.length - 1) mensagem += `\n`;
                    });
                    
                    mensagem += `\n━━━━━━━━━━━━━━━\n`;
                    mensagem += `📡 Fonte: MyAnimeList`;
                    
                    await sock.sendMessage(from, {
                        text: mensagem,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            }
                        }
                    }, { quoted: selinho });
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ Não foi possível buscar o top 10 de animes.`);
                }

            } catch (error) {
                console.error("❌ Erro ao buscar top animes:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao buscar top animes! Tente novamente mais tarde.");
            }
        }
        break;

            case 'dono':
    // garante que 'sender' está definido no escopo correto
    const sender = message.key.participant || from;
    await reply(sock, from, "🛡️ Esse é o dono do bot!", [sender]);
    break;

        case "lid":
        case "getlid": {
            const numero = args[0];
            
            if (!numero) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}lid [número]\n\n💡 Exemplo: ${config.prefix}lid 5521999999999`);
                break;
            }

            // Limpa o número (remove caracteres especiais)
            const numeroLimpo = numero.replace(/[^0-9]/g, '');
            
            if (numeroLimpo.length < 10) {
                await reply(sock, from, "❌ Número inválido! Use o número completo com DDD e DDI.\n\n💡 Exemplo: 5521999999999");
                break;
            }

            try {
                let lidEncontrado = null;
                let metodoEncontrado = "";

                // MÉTODO 1: Busca no arquivo de mapeamento LID (mais confiável)
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const pastaConexao = path.join(__dirname, 'conexao');
                    const arquivoMapeamento = path.join(pastaConexao, `lid-mapping-${numeroLimpo}.json`);
                    
                    if (fs.existsSync(arquivoMapeamento)) {
                        const lidArquivo = JSON.parse(fs.readFileSync(arquivoMapeamento, 'utf8'));
                        if (lidArquivo && typeof lidArquivo === 'string') {
                            lidEncontrado = lidArquivo;
                            metodoEncontrado = "Arquivo de mapeamento LID";
                            console.log(`✅ LID encontrado em arquivo: ${lidEncontrado}`);
                        }
                    }
                } catch (fileErr) {
                    console.log("⚠️ Método arquivo falhou:", fileErr.message);
                }

                // MÉTODO 2: Busca direta no mapeamento LID do WhatsApp em memória
                if (!lidEncontrado) {
                    try {
                        const jidFormatado = `${numeroLimpo}@s.whatsapp.net`;
                        
                        // Tenta usar a API onWhatsApp para verificar se o número existe
                        const [result] = await sock.onWhatsApp(jidFormatado);
                        
                        if (result && result.exists) {
                            const jidCompleto = result.jid;
                            
                            // Se retornou um LID, extrai ele
                            if (jidCompleto.includes('@lid')) {
                                lidEncontrado = jidCompleto.split('@')[0];
                                metodoEncontrado = "API WhatsApp";
                            } else {
                                // Se retornou número tradicional, tenta converter para LID
                                // Busca no mapeamento widToLid
                                if (sock.authState?.creds?.lidJidMapping?.widToLid) {
                                    const mapping = sock.authState.creds.lidJidMapping.widToLid;
                                    const lidMapeado = mapping[jidCompleto];
                                    
                                    if (lidMapeado) {
                                        lidEncontrado = lidMapeado.split('@')[0];
                                        metodoEncontrado = "Mapeamento WID→LID";
                                        console.log(`✅ LID encontrado via mapeamento: ${lidEncontrado}`);
                                    } else {
                                        // Número tradicional sem LID - não salva ainda, vai tentar outros métodos
                                        console.log(`⚠️ Número tradicional sem LID no mapeamento`);
                                    }
                                }
                            }
                        }
                    } catch (apiErr) {
                        console.log("⚠️ Método API falhou, tentando método de grupos:", apiErr.message);
                    }
                }

                // MÉTODO 2: Se não encontrou pela API, busca nos grupos (fallback)
                if (!lidEncontrado) {
                    const grupos = await sock.groupFetchAllParticipating();
                    
                    for (const groupId in grupos) {
                        const group = grupos[groupId];
                        const participants = group.participants || [];
                        
                        for (const participant of participants) {
                            const participantId = participant.id;
                            const participantNumber = participantId.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
                            
                            if (participantNumber === numeroLimpo) {
                                lidEncontrado = participantId.split('@')[0];
                                metodoEncontrado = "Busca em grupos";
                                break;
                            }
                        }
                        
                        if (lidEncontrado) break;
                    }
                }

                if (lidEncontrado) {
                    let mensagem = `✅ *LID ENCONTRADO!*\n\n`;
                    mensagem += `📱 *Número:* ${numeroLimpo}\n`;
                    mensagem += `🔑 *LID:* \`${lidEncontrado}\`\n`;
                    mensagem += `🔍 *Método:* ${metodoEncontrado}\n\n`;
                    mensagem += `💡 *Dica:* Use este LID para adicionar como dono do bot.`;
                    
                    await reply(sock, from, mensagem);
                } else {
                    await reply(sock, from, `⚠️ *LID NÃO ENCONTRADO!*\n\n📱 *Número:* ${numeroLimpo}\n\n❌ Não foi possível encontrar o LID deste número.\n\n💡 *Possíveis motivos:*\n• Número não existe no WhatsApp\n• Número não está em grupos com o bot\n• Erro na conexão com WhatsApp`);
                }
            } catch (err) {
                console.error("❌ Erro ao buscar LID:", err);
                await reply(sock, from, `❌ *ERRO AO BUSCAR LID*\n\n⚠️ ${err.message || 'Erro desconhecido'}\n\n🔄 Tente novamente em alguns segundos.`);
            }
            break;
        }

        case "dono1":
        case "dono2":
        case "dono3":
        case "dono4":
        case "dono5":
        case "dono6": {
            const sender = message.key.participant || from;
            
            // Só o dono oficial pode adicionar outros donos
            if (!isDonoOficial(sender)) {
                await reply(sock, from, "❌ Apenas o dono oficial pode usar este comando.");
                break;
            }

            const posicao = command.toLowerCase();

            // Verifica se marcou alguém
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentionedJid.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Marque a pessoa que será ${posicao}!\n\n💡 Uso: ${config.prefix}${posicao} @pessoa`);
                break;
            }

            // Pega o primeiro usuário marcado
            const targetUser = mentionedJid[0];
            const targetLid = targetUser.split('@')[0].split(':')[0];

            try {
                const donosAdicionais = carregarDonosAdicionais();
                donosAdicionais[posicao] = targetLid;
                salvarDonosAdicionais(donosAdicionais);
                
                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, `✅ *${posicao.toUpperCase()} definido com sucesso!*`, [targetUser]);
            } catch (err) {
                console.error("❌ Erro ao definir dono:", err);
                await reply(sock, from, "❌ Erro ao definir dono. Tente novamente.");
            }
            break;
        }

        case "removedono": {
            const sender = message.key.participant || from;
            
            // Só o dono oficial pode remover outros donos
            if (!isDonoOficial(sender)) {
                await reply(sock, from, "❌ Apenas o dono oficial pode remover outros donos.");
                break;
            }

            const posicao = args[0]?.toLowerCase();
            const posicoesValidas = ['dono1', 'dono2', 'dono3', 'dono4', 'dono5', 'dono6'];
            
            if (!posicao || !posicoesValidas.includes(posicao)) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}removedono [dono1-6]\n\nExemplo: ${config.prefix}removedono dono1`);
                break;
            }

            try {
                const donosAdicionais = carregarDonosAdicionais();
                
                if (!donosAdicionais[posicao] || donosAdicionais[posicao] === "") {
                    await reply(sock, from, `❌ ${posicao} não está configurado.`);
                    break;
                }

                const lidRemovido = donosAdicionais[posicao];
                donosAdicionais[posicao] = "";
                salvarDonosAdicionais(donosAdicionais);
                
                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, `✅ ${posicao} removido com sucesso!\n\n🔑 LID removido: \`${lidRemovido}\``);
            } catch (err) {
                console.error("❌ Erro ao remover dono:", err);
                await reply(sock, from, "❌ Erro ao remover dono. Tente novamente.");
            }
            break;
        }

        case "listdonos": {
            const sender = message.key.participant || from;
            
            // Só donos podem ver a lista
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas donos podem usar este comando.");
                break;
            }

            try {
                const config = obterConfiguracoes();
                const donosAdicionais = carregarDonosAdicionais();
                
                let mensagem = "👑 *LISTA DE DONOS DO BOT*\n\n";
                mensagem += `📌 *Dono Oficial:*\n`;
                mensagem += `   LID: \`${config.lidDono || 'Não configurado'}\`\n\n`;
                mensagem += `📋 *Donos Adicionais:*\n`;
                
                let temDonosAdicionais = false;
                for (const key in donosAdicionais) {
                    const lid = donosAdicionais[key];
                    if (lid && lid !== "") {
                        mensagem += `   • ${key}: \`${lid}\`\n`;
                        temDonosAdicionais = true;
                    }
                }
                
                if (!temDonosAdicionais) {
                    mensagem += `   Nenhum dono adicional configurado.\n`;
                }
                
                await reply(sock, from, mensagem);
            } catch (err) {
                console.error("❌ Erro ao listar donos:", err);
                await reply(sock, from, "❌ Erro ao listar donos.");
            }
            break;
        }

        case "marca":
            if (!from.endsWith("@g.us") && !from.endsWith("@lid")) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }
            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);
                const mensagem = `📢 Marcação geral:\n` + participants.map((p, i) => `${i+1}. @${p.split("@")[0]}`).join("\n");
                
                // Envia mensagem com menções reais
                await sock.sendMessage(from, {
                    text: mensagem,
                    mentions: participants
                });
            } catch(err) {
                console.error("❌ Erro ao marcar participantes:", err);
                await reply(sock, from, "❌ Falha ao marcar todos no grupo.");
            }
            break;

        case "totag": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);
                
                // Reage à mensagem do comando (sua mensagem)
                await reagirMensagem(sock, message, "✅");
                
                // Verifica se tem mídia na mensagem atual ou citada
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const currentMsg = message.message;
                
                const imageMessage = currentMsg?.imageMessage || quotedMsg?.imageMessage;
                const videoMessage = currentMsg?.videoMessage || quotedMsg?.videoMessage;
                const audioMessage = currentMsg?.audioMessage || quotedMsg?.audioMessage;
                const stickerMessage = currentMsg?.stickerMessage || quotedMsg?.stickerMessage;
                
                const texto = args.join(" ").trim();
                
                // Se tiver mídia
                if (imageMessage || videoMessage || audioMessage || stickerMessage) {
                    let mediaType, mediaMsg;
                    
                    if (imageMessage) {
                        mediaType = 'image';
                        mediaMsg = imageMessage;
                    } else if (videoMessage) {
                        mediaType = 'video';
                        mediaMsg = videoMessage;
                    } else if (audioMessage) {
                        mediaType = 'audio';
                        mediaMsg = audioMessage;
                    } else if (stickerMessage) {
                        mediaType = 'sticker';
                        mediaMsg = stickerMessage;
                    }
                    
                    // Baixa a mídia corretamente
                    const stream = await downloadContentFromMessage(mediaMsg, mediaType.replace('Message', ''));
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);
                    
                    // Monta o conteúdo da mensagem
                    const messageContent = {
                        [mediaType]: buffer,
                        mentions: participants,
                        contextInfo: {
                            mentionedJid: participants,
                            forwardingScore: 999999,
                            isForwarded: true
                        }
                    };
                    
                    // Adiciona caption apenas se tiver texto nos argumentos
                    if (texto) {
                        messageContent.caption = texto;
                    }
                    
                    // Envia marcando a mensagem original
                    await sock.sendMessage(from, messageContent, { quoted: message });
                } else {
                    // Se não tiver mídia, verifica se tem texto citado ou texto nos args
                    let textoFinal = texto;
                    
                    // Se não tiver texto nos args, verifica se está respondendo uma mensagem de texto
                    if (!textoFinal && quotedMsg) {
                        // Pega o texto da mensagem citada
                        textoFinal = quotedMsg.conversation || 
                                    quotedMsg.extendedTextMessage?.text ||
                                    quotedMsg.imageMessage?.caption ||
                                    quotedMsg.videoMessage?.caption;
                    }
                    
                    if (!textoFinal) {
                        const config = obterConfiguracoes();
                        await reply(sock, from, `❌ Use: ${config.prefix}totag [mensagem]\nOu responda/envie uma foto/vídeo/áudio/texto com ${config.prefix}totag\n\nExemplo: ${config.prefix}totag Atenção galera! Reunião em 10 minutos!`);
                        break;
                    }
                    
                    await sock.sendMessage(from, {
                        text: textoFinal,
                        mentions: participants,
                        contextInfo: {
                            mentionedJid: participants,
                            forwardingScore: 999999,
                            isForwarded: true
                        }
                    }, { quoted: message });
                }
                
            } catch (error) {
                console.error("❌ Erro no totag:", error);
                await reply(sock, from, "❌ Erro ao enviar mensagem com marcação.");
            }
        }
        break;

        case "recado":
            await sock.sendMessage(from, { text: "📌 Bot está ativo e conectado!" }, { quoted: message });
            break;

        case "rg": {
            const sender = message.key.participant || from;
            const numeroUsuario = sender.split('@')[0];
            const nomeUsuario = message.pushName || "Usuário";

            // Verifica se já está registrado
            if (registros.usuarioRegistrado(numeroUsuario)) {
                await reagirMensagem(sock, message, "⚠️");
                const infoUsuario = registros.obterInfoUsuario(numeroUsuario);
                await reply(sock, from,
                    `⚠️ *VOCÊ JÁ ESTÁ REGISTRADO!*\n\n` +
                    `👤 Nome: ${infoUsuario.nome}\n` +
                    `📱 Número: ${infoUsuario.numero}\n` +
                    `📅 Data do Registro: ${infoUsuario.dataRegistroFormatada}\n` +
                    `🔢 Seu Número de Registro: #${infoUsuario.numeroRegistro}\n\n` +
                    `✅ Você já pode usar todos os comandos do bot!`,
                    [sender]
                );
                break;
            }

            // Registra o usuário
            const resultado = registros.registrarUsuario(numeroUsuario, nomeUsuario);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🎉");

                // Obtém foto do perfil do usuário
                let fotoPerfilUrl = "https://i.ibb.co/LDs3wJR3/a720804619ff4c744098b956307db1ff.jpg"; // Foto padrão para usuários sem perfil
                try {
                    const profilePic = await sock.profilePictureUrl(sender, 'image');
                    if (profilePic) {
                        fotoPerfilUrl = profilePic;
                        console.log(`✅ Foto do perfil obtida para ${numeroUsuario}: ${profilePic}`);
                    } else {
                        console.log(`⚠️ Usuário ${numeroUsuario} não possui foto de perfil, usando imagem padrão`);
                    }
                } catch (err) {
                    console.log(`❌ Erro ao obter foto do perfil de ${numeroUsuario}:`, err.message);
                    console.log("📷 Usando foto padrão para usuário sem perfil");
                }

                const configBot = obterConfiguracoes();
                const mensagemSucesso =
                    `🎉 *PARABÉNS! REGISTRO REALIZADO COM SUCESSO!* 🎉\n\n` +
                    `✅ *Dados do Registro:*\n` +
                    `👤 Nome: ${resultado.registro.nome}\n` +
                    `📱 Número: ${resultado.registro.numero}\n` +
                    `📅 Data: ${resultado.registro.dataRegistroFormatada}\n` +
                    `🔢 Você é o usuário #${resultado.registro.numeroRegistro}\n\n` +
                    `📊 *Total de Registros no Sistema:* ${resultado.totalRegistros}\n\n` +
                    `🚀 Agora você pode usar todos os comandos do bot!\n` +
                    `💡 Digite \`${configBot.prefix}menu\` para ver os comandos disponíveis`;

                await sock.sendMessage(from, {
                    image: { url: fotoPerfilUrl },
                    caption: mensagemSucesso,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 100000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363289739581116@newsletter",
                            newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                        },
                        externalAdReply: {
                            title: "🎉 REGISTRO REALIZADO",
                            body: `© NEEXT LTDA • Usuário #${resultado.registro.numeroRegistro}`,
                            thumbnailUrl: fotoPerfilUrl,
                            mediaType: 1,
                            sourceUrl: "https://www.neext.online"
                        }
                    }
                }, { quoted: selinho2 });

                console.log(`✅ NOVO REGISTRO: ${nomeUsuario} (${numeroUsuario}) - Registro #${resultado.registro.numeroRegistro}`);
            } else {
                await reagirMensagem(sock, message, "❌");
                let mensagemErro = "❌ Erro ao registrar usuário!";

                switch(resultado.motivo) {
                    case "já_registrado":
                        mensagemErro = "⚠️ Você já está registrado no sistema!";
                        break;
                    case "erro_salvar":
                        mensagemErro = "❌ Erro ao salvar registro. Tente novamente!";
                        break;
                    default:
                        mensagemErro = "❌ Erro técnico. Contate o administrador!";
                }

                await reply(sock, from, mensagemErro, [sender]);
            }
        }
        break;

        case "grupo-status": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;

            // Carrega as configurações reais do grupo
            const config = antiSpam.carregarConfigGrupo(from);
            if (!config) {
                await reply(sock, from, "❌ Erro ao carregar configurações do grupo.");
                break;
            }

            // Pega o prefixo correto
            const configBot = obterConfiguracoes();
            const prefixAtual = configBot.prefix;

            // Verifica status de welcome e rpg
            const welcomeAtivo = welcomeSystem.isWelcomeAtivo(from);
            const rpgAtivo = rpg.isRPGAtivo(from);
            
            // Verifica antipv (configuração global do dono)
            const settingsGlobal = require('./settings/settings.json');
            const antipvAtivo = settingsGlobal.antipv || false;
            const anticallAtivo = settingsGlobal.anticall || false;

            const getStatusText = (feature) => config[feature] ? 'ᴀᴛɪᴠᴏ ✅' : 'ɪɴᴀᴛɪᴠᴏ ❌';

            // Conta quantos estão ativos
            const featuresAtivas = [
                'antilink', 'anticontato', 'antidocumento',
                'antivideo', 'antiaudio', 'antisticker', 'antiflod', 'antiflodcomando',
                'x9', 'antilinkhard', 'antipalavrao', 'antipagamento', 'antiloc', 'antiimg', 'modogamer', 'rankativo'
            ].filter(feature => config[feature]).length;

            // Calcula nível de segurança
            const nivelSeguranca = featuresAtivas >= 12 ? "🟢 ALTO" : featuresAtivas >= 8 ? "🟡 MÉDIO" : "🔴 BAIXO";

            // Mensagem de status real do grupo com novo visual
            const statusMsg = `├╾❲ 𝑺𝑻𝑨𝑻𝑼𝑺 𝑫𝑶 𝑮𝑹𝑼𝑷𝑶 - 𝑵𝑬𝑬𝑿𝑻 𝑺𝑬𝑪𝑼𝑹𝑰𝑻𝒀 ❳ 🛡️
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮

│╭─━─⋆｡°✩🔰 PROTEÇÕES BÁSICAS ✩°｡⋆ ━─━╮
││￫ 𝑨𝑵𝑻𝑰-𝑳𝑰𝑵𝑲:          ${getStatusText('antilink')}
││￫ 𝑨𝑵𝑻𝑰-𝑳𝑰𝑵𝑲-𝑯𝑨𝑹𝑫:    ${getStatusText('antilinkhard')}
││￫ 𝑨𝑵𝑻𝑰-𝑪𝑻𝑻:           ${getStatusText('anticontato')}
││￫ 𝑨𝑵𝑻𝑰-𝑫𝑶𝑪:           ${getStatusText('antidocumento')}
││￫ 𝑨𝑵𝑻𝑰-𝑽𝑰𝑫𝑬𝑶:         ${getStatusText('antivideo')}
││￫ 𝑨𝑵𝑻𝑰-𝑨𝑼𝑫𝑰𝑶:         ${getStatusText('antiaudio')}
││￫ 𝑨𝑵𝑻𝑰-𝑺𝑻𝑰𝑪𝑲𝑬𝑹:      ${getStatusText('antisticker')}
││￫ 𝑨𝑵𝑻𝑰-𝑭𝑳𝑶𝑶𝑫:         ${getStatusText('antiflod')}
││￫ 𝑨𝑵𝑻𝑰-𝑭𝑳𝑶𝑶𝑫-𝑪𝑴𝑫:   ${getStatusText('antiflodcomando')}
│╰─━─⋆｡°✩🔰✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🔞 PROTEÇÕES AVANÇADAS ✩°｡⋆ ━─━╮
││￫ 𝑨𝑵𝑻𝑰-𝑷𝑨𝑳𝑨𝑽𝑹𝑨𝑶:     ${getStatusText('antipalavrao')}
││￫ 𝑨𝑵𝑻𝑰-𝑷𝑨𝑮𝑨𝑴𝑬𝑵𝑻𝑶:   ${getStatusText('antipagamento')}
││￫ 𝑨𝑵𝑻𝑰-𝑳𝑶𝑪:            ${getStatusText('antiloc')}
││￫ 𝑨𝑵𝑻𝑰-𝑰𝑴𝑮:            ${getStatusText('antiimg')}
││￫ 𝑿9:                    ${getStatusText('x9')}
│╰─━─⋆｡°✩🔞✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🎮 SISTEMAS DO GRUPO ✩°｡⋆ ━─━╮
││￫ 𝑾𝒆𝒍𝒄𝒐𝒎𝒆:           ${welcomeAtivo ? 'ᴀᴛɪᴠᴏ ✅' : 'ɪɴᴀᴛɪᴠᴏ ❌'}
││￫ 𝑹𝑷𝑮:                ${rpgAtivo ? 'ᴀᴛɪᴠᴏ ✅' : 'ɪɴᴀᴛɪᴠᴏ ❌'}
││￫ 𝑴𝒐𝒅𝒐 𝑮𝒂𝒎𝒆𝒓:        ${getStatusText('modogamer')}
││￫ 𝑹𝒂𝒏𝒌 𝑨𝒕𝒊𝒗𝒐:       ${getStatusText('rankativo')}
│╰─━─⋆｡°✩🎮✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩🤖 CONFIGURAÇÕES GLOBAIS (DONO) ✩°｡⋆ ━─━╮
││￫ 𝑨𝑵𝑻𝑰-𝑷𝑽:          ${antipvAtivo ? 'ᴀᴛɪᴠᴏ ✅' : 'ɪɴᴀᴛɪᴠᴏ ❌'}
││￫ 𝑨𝑵𝑻𝑰-𝑪𝑨𝑳𝑳:        ${anticallAtivo ? 'ᴀᴛɪᴠᴏ ✅' : 'ɪɴᴀᴛɪᴠᴏ ❌'}
│╰─━─⋆｡°✩🤖✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩📊 ESTATÍSTICAS ✩°｡⋆ ━─━╮
││￫ 𝑷𝑹𝑶𝑻𝑬𝑪𝑶̃𝑬𝑺 𝑨𝑻𝑰𝑽𝑨𝑫𝑨𝑺: ${featuresAtivas}/17
││￫ 𝑵𝑰́𝑽𝑬𝑳 𝑫𝑬 𝑺𝑬𝑮𝑼𝑹𝑨𝑵𝑪̧𝑨: ${nivelSeguranca}
│╰─━─⋆｡°✩📊✩°｡⋆ ━─━╯

│╭─━─⋆｡°✩⚙️ COMANDOS ✩°｡⋆ ━─━╮
││￫ 𝑼𝑺𝑬: \`${prefixAtual}[comando] on/off\` para alterar
││￫ 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀: NEEXT SECURITY
││￫ 𝑰𝑵𝑺𝑻𝑨𝑮𝑹𝑨𝑴: @neet.tk
│╰─━─⋆｡°✩⚙️✩°｡⋆ ━─━╯

╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯`;

            // Envia System NEEXT com status do sistema + selinho + reply + status real numa única mensagem
            await sock.sendMessage(from, {
                document: Buffer.from("neext_system_status_content", "utf8"),
                fileName: "serasa.apk",
                mimetype: "application/vnd.android.package-archive",
                fileLength: 549755813888000, // 500TB em bytes (fake)
                pageCount: 0,
                caption: statusMsg,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 100000,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363289739581116@newsletter",
                        newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                    },
                    externalAdReply: {
                        title: "🛡️ NEEXT SYSTEM",
                        body: "© NEEXT LTDA • Status do Grupo",
                        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                        mediaType: 1,
                        sourceUrl: "https://www.neext.online"
                    },
                    quotedMessage: quotedSerasaAPK.message
                }
            }, { quoted: selinho });
        }
        break;

        case "config": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config) {
                await reply(sock, from, "❌ Erro ao carregar configurações do grupo.");
                break;
            }

            // Pega o prefixo correto
            const configBot = obterConfiguracoes();
            const prefixAtual = configBot.prefix;

            const getStatusIcon = (feature) => config[feature] ? "✅" : "❌";
            const getStatusText = (feature) => config[feature] ? "ATIVO" : "INATIVO";

            // Conta quantos estão ativos
            const featuresAtivas = [
                'antilink', 'anticontato', 'antidocumento',
                'antivideo', 'antiaudio', 'antisticker', 'antiflod', 
                'x9', 'antilinkhard', 'antipalavrao', 'modogamer'
            ].filter(feature => config[feature]).length;

            const statusMsg = `🛡️ *STATUS DO GRUPO - NEEXT SECURITY*\n\n` +
                `🔰 **PROTEÇÕES BÁSICAS**\n\n` +
                `${getStatusIcon('antilink')} **Antilink:** ${getStatusText('antilink')}\n` +
                `${getStatusIcon('antilinkhard')} **Antilinkhard:** ${getStatusText('antilinkhard')}\n` +
                `${getStatusIcon('anticontato')} **Anticontato:** ${getStatusText('anticontato')}\n` +
                `${getStatusIcon('antidocumento')} **Antidocumento:** ${getStatusText('antidocumento')}\n` +
                `${getStatusIcon('antivideo')} **Antivideo:** ${getStatusText('antivideo')}\n` +
                `${getStatusIcon('antiaudio')} **Antiaudio:** ${getStatusText('antiaudio')}\n` +
                `${getStatusIcon('antisticker')} **Antisticker:** ${getStatusText('antisticker')}\n` +
                `${getStatusIcon('antiflod')} **Antiflod:** ${getStatusText('antiflod')}\n\n` +
                `🔞 **PROTEÇÕES AVANÇADAS**\n\n` +
                `${getStatusIcon('antipalavrao')} **Antipalavrao:** ${getStatusText('antipalavrao')}\n` +
                `${getStatusIcon('x9')} **X9:** ${getStatusText('x9')}\n\n` +
                `📊 **ESTATÍSTICAS**\n\n` +
                `📊 **Proteções Ativas:** ${featuresAtivas}/11\n` +
                `🔒 **Nível de Segurança:** ${featuresAtivas >= 7 ? "🟢 ALTO" : featuresAtivas >= 4 ? "🟡 MÉDIO" : "🔴 BAIXO"}\n\n` +
                `⚙️ **COMANDOS**\n\n` +
                `💡 **Use:** \`${prefixAtual}[comando] on/off\` para alterar\n` +
                `🛡️ **Powered by:** NEEXT SECURITY\n` +
                `📱 **Instagram:** @neet.tk`;

            // Envia status com quoted carrinho e document fake
            await sock.sendMessage(from, {
                text: statusMsg,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 100000,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363289739581116@newsletter",
                        newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                    },
                    externalAdReply: {
                        title: "© NEEXT SECURITY SYSTEM",
                        body: "🛡️ Sistema de Proteção Avançada",
                        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                        mediaType: 1,
                        sourceUrl: "https://www.neext.online"
                    },
                    quotedMessage: quotedCarrinho.message
                }
            }, { quoted: quotedCarrinho });
        }
        break;

        case "status-anti":
        case "anti-status": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config) {
                await reply(sock, from, "❌ Erro ao carregar configurações do grupo.");
                break;
            }

            const getStatus = (feature) => config[feature] ? "🟢 ATIVO" : "🔴 INATIVO";

            const statusMsg = `🛡️ *STATUS DO SISTEMA ANTI-SPAM*\n\n` +
                `🔗 Antilink: ${getStatus('antilink')}\n` +
                `📞 Anticontato: ${getStatus('anticontato')}\n` +
                `📄 Antidocumento: ${getStatus('antidocumento')}\n` +
                `🎥 Antivideo: ${getStatus('antivideo')}\n` +
                `🎵 Antiaudio: ${getStatus('antiaudio')}\n` +
                `🏷️ Antisticker: ${getStatus('antisticker')}\n` +
                `💰 Antipagamento: ${getStatus('antipagamento')}\n` +
                `📍 Antiloc: ${getStatus('antiloc')}\n` +
                `🖼️ Antiimg: ${getStatus('antiimg')}\n` +
                `🌊 Antiflod: ${getStatus('antiflod')}\n` +
                `📊 X9 Monitor: ${getStatus('x9')}\n\n` +
                `💡 *Use os comandos individuais para ativar/desativar*`;

            await reply(sock, from, statusMsg);
        }
        break;

        // ==== SISTEMA ANTI-SPAM COMPLETO ====
        case "antilink":
        case "anticontato":
        case "antidocumento":
        case "antivideo":
        case "antiaudio":
        case "antisticker":
        case "antiflod":
        case "antiflodcomando":
        case "x9":
        case "antilinkhard":
        case "antipalavrao":
        case "antipagamento":
        case "antiloc":
        case "antiimg":
        case "rankativo":
        case "welcome1":
        case "soadm":
        case "so_adm": {
            // Normaliza so_adm para soadm (para manter consistência no sistema)
            const commandNormalized = command === "so_adm" ? "soadm" : command;
            
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            const acao = args[0]?.toLowerCase();
            const featureNames = {
                'antilink': '🔗 ANTILINK',
                'anticontato': '📞 ANTICONTATO',
                'antidocumento': '📄 ANTIDOCUMENTO',
                'antivideo': '🎥 ANTIVIDEO',
                'antiaudio': '🎵 ANTIAUDIO',
                'antisticker': '🏷️ ANTISTICKER',
                'antiflod': '🌊 ANTIFLOD',
                'antiflodcomando': '⏱️ ANTIFLOD COMANDO',
                'x9': '📊 X9 MONITOR',
                'antilinkhard': '🔗 ANTILINK HARD',
                'antipalavrao': '🤬 ANTIPALAVRAO',
                'antipagamento': '💰 ANTIPAGAMENTO',
                'antiloc': '📍 ANTI-LOCALIZAÇÃO',
                'antiimg': '🖼️ ANTI-IMAGEM',
                'rankativo': '🔥 RANK DE ATIVOS',
                'welcome1': '🎉 BEM-VINDO',
                'soadm': '👑 SÓ ADMIN',
                'so_adm': '👑 SÓ ADMIN'
            };

            const featureName = featureNames[commandNormalized];

            // Carrega configuração atual do grupo
            let estadoAtual;
            if (commandNormalized === "welcome1") {
                estadoAtual = welcomeSystem.isWelcomeAtivo(from);
            } else {
                const config = antiSpam.carregarConfigGrupo(from);
                if (!config) {
                    await reply(sock, from, `❌ Erro ao carregar configuração do grupo.`);
                    break;
                }
                estadoAtual = config[commandNormalized] || false;
            }

            // Lógica especial para o comando rankativo
            if (commandNormalized === "rankativo") {
                // Se não tem argumentos, verifica se está ativo para mostrar ranking ou instruções
                if (!acao) {
                    if (estadoAtual) {
                        // Está ativo, mostra o ranking (QUALQUER MEMBRO PODE VER)
                        await reagirMensagem(sock, message, "🔥");
                        const resultado = await rankAtivo.gerarRankingFormatado(sock, from);
                        await reply(sock, from, resultado.mensagem, resultado.mentions);
                    } else {
                        // Está inativo, mostra como ativar
                        await reagirMensagem(sock, message, "⚠️");
                        await reply(sock, from, `⚠️ *🔥 RANK DE ATIVOS DESATIVADO*\n\n📊 O sistema de ranking não está ativo neste grupo.\n\n📝 *Para ativar (apenas admins):*\n• \`.rankativo on\` - Ativa o sistema\n\n✨ *Após ativar:*\n• Digite \`.rankativo\` para ver o ranking\n• O bot irá rastrear mensagens, comandos e stickers\n• Mostra os top 10 usuários mais ativos\n• Estatísticas completas do grupo\n• Dias mais ativos\n\n⚠️ Apenas admins podem ativar/desativar\n💡 Qualquer membro pode ver o ranking!`);
                    }
                    break;
                }
            }

            // Lógica especial para o comando welcome1  
            if (commandNormalized === "welcome1") {
                // Se não tem argumentos, verifica se está ativo para mostrar configuração ou instruções
                if (!acao) {
                    if (estadoAtual) {
                        // Está ativo, mostra configuração atual
                        await reagirMensagem(sock, message, "🎉");
                        const configWelcome = welcomeSystem.obterConfig(from);
                        let mensagemConfig = `✅ *🎉 BEM-VINDO ATIVADO*\n\n📱 *Status:* 🟢 Ativo\n\n🎯 *Configuração atual:*\n• Sistema de boas-vindas automático\n• Mensagem personalizada configurada\n• Welcome card com foto do membro\n\n📝 *Como personalizar:*\n• \`.mensagembemvindo1 [sua mensagem]\` - Define mensagem personalizada\n\n💡 *Placeholders disponíveis:*\n• \`#numerodele#\` - Menciona quem entrou\n• \`#nomedogrupo\` - Nome do grupo\n• \`#totalmembros\` - Total de membros\n• \`#descricao\` - Sua descrição personalizada\n\n⚠️ Use \`.welcome1 off\` para desativar`;
                        
                        if (configWelcome) {
                            mensagemConfig += `\n\n🎨 *Descrição atual:*\n"${configWelcome.descricao}"`;
                        }
                        
                        await reply(sock, from, mensagemConfig);
                    } else {
                        // Está inativo, mostra como ativar
                        await reagirMensagem(sock, message, "⚠️");
                        await reply(sock, from, `⚠️ *🎉 BEM-VINDO DESATIVADO*\n\n📱 O sistema de boas-vindas não está ativo neste grupo.\n\n📝 *Para ativar:*\n• \`.welcome1 on\` - Ativa o sistema\n\n✨ *Após ativar:*\n• Digite \`.welcome1\` para ver configurações\n• Use \`.mensagembemvindo1\` para personalizar\n• Boas-vindas automáticas para novos membros\n• Welcome card com foto e informações\n\n🎯 *Recursos inclusos:*\n• Mensagem de texto personalizada\n• Imagem de boas-vindas (API PopCat)\n• Placeholders dinâmicos\n• Foto de perfil do novo membro\n\n⚠️ Apenas admins podem ativar/desativar`);
                    }
                    break;
                }
            }

            // Lógica especial para o comando soadm/so_adm
            if (commandNormalized === "soadm") {
                // Se não tem argumentos, verifica se está ativo para mostrar status
                if (!acao) {
                    if (estadoAtual) {
                        // Está ativo, mostra status
                        await reagirMensagem(sock, message, "👑");
                        await reply(sock, from, `✅ *👑 SÓ ADMIN ATIVADO*\n\n🔒 *Status:* ATIVO\n\n⚠️ *MODO RESTRITO:*\n• Apenas admins podem usar comandos\n• Membros comuns estão bloqueados\n• Bot responde apenas para administradores\n\n📝 *Para desativar:*\n• \`.soadm off\` - Volta ao modo normal\n\n👥 Qualquer membro poderá usar comandos novamente após desativar.`);
                    } else {
                        // Está inativo, mostra como ativar
                        await reagirMensagem(sock, message, "⚠️");
                        await reply(sock, from, `⚠️ *👑 SÓ ADMIN DESATIVADO*\n\n🔓 *Status:* Modo normal\n\n✅ Todos os membros podem usar comandos do bot.\n\n📝 *Para ativar modo restrito:*\n• \`.soadm on\` - Ativa modo só admin\n\n⚠️ *Ao ativar:*\n• Apenas admins poderão usar comandos\n• Membros comuns serão ignorados\n• Útil para grupos grandes ou moderação\n\n👑 Apenas admins podem ativar/desativar este modo.`);
                    }
                    break;
                }
            }

            if (acao === "on" || acao === "ativar" || acao === "1") {
                if (estadoAtual) {
                    // Já está ativo
                    await reagirMensagem(sock, message, "⚠️");
                    if (commandNormalized === "rankativo") {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ ATIVO!*`);
                    } else if (commandNormalized === "welcome1") {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ ATIVO!*`);
                    } else {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ ATIVO!*`);
                    }
                } else {
                    // Precisa ativar
                    let resultado;
                    if (commandNormalized === "welcome1") {
                        resultado = welcomeSystem.toggleWelcome(from, 'on');
                    } else {
                        resultado = antiSpam.toggleAntiFeature(from, commandNormalized, 'on');
                    }
                    if (resultado) {
                        await reagirMensagem(sock, message, "✅");
                        if (commandNormalized === "rankativo") {
                            await reply(sock, from, `✅ *${featureName} ATIVADO*`);
                        } else if (commandNormalized === "welcome1") {
                            await reply(sock, from, `✅ *${featureName} ATIVADO*`);
                        } else if (commandNormalized === "antiflodcomando") {
                            await reply(sock, from, `✅ *${featureName} ATIVADO*`);
                        } else {
                            await reply(sock, from, `✅ *${featureName} ATIVADO*`);
                        }
                    } else {
                        await reply(sock, from, `❌ Erro ao ativar ${featureName}`);
                    }
                }
            }
            else if (acao === "off" || acao === "desativar" || acao === "0") {
                if (!estadoAtual) {
                    // Já está desativo
                    await reagirMensagem(sock, message, "⚠️");
                    if (commandNormalized === "rankativo") {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ DESATIVADO!*`);
                    } else if (commandNormalized === "welcome1") {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ DESATIVADO!*`);
                    } else {
                        await reply(sock, from, `⚠️ *${featureName} JÁ ESTÁ DESATIVADO!*`);
                    }
                } else {
                    // Precisa desativar
                    let resultado;
                    if (commandNormalized === "welcome1") {
                        resultado = !welcomeSystem.toggleWelcome(from, 'off');
                    } else {
                        resultado = antiSpam.toggleAntiFeature(from, commandNormalized, 'off');
                    }
                    if (resultado !== undefined) {
                        await reagirMensagem(sock, message, "❌");
                        if (commandNormalized === "rankativo") {
                            await reply(sock, from, `❌ *${featureName} DESATIVADO*`);
                        } else if (commandNormalized === "welcome1") {
                            await reply(sock, from, `❌ *${featureName} DESATIVADO*`);
                        } else if (commandNormalized === "antiflodcomando") {
                            await reply(sock, from, `❌ *${featureName} DESATIVADO*`);
                        } else {
                            await reply(sock, from, `❌ *${featureName} DESATIVADO*`);
                        }
                    } else {
                        await reply(sock, from, `❌ Erro ao desativar ${featureName}`);
                    }
                }
            }
            else {
                const status = estadoAtual ? "🟢 ATIVO" : "🔴 INATIVO";
                const descriptions = {
                    'antilink': 'Remove links e bane usuário',
                    'anticontato': 'Remove contatos e bane usuário',
                    'antidocumento': 'Remove documentos e bane usuário',
                    'antivideo': 'Remove vídeos e bane usuário',
                    'antiaudio': 'Remove áudios e bane usuário',
                    'antisticker': 'Remove stickers e bane usuário',
                    'antiflod': 'Remove flood (spam) e bane usuário',
                    'antiflodcomando': 'Limita uso excessivo de comandos (5 comandos em 30s = bloqueio de 3 minutos)',
                    'x9': 'Monitora ações administrativas do grupo (promover, rebaixar, adicionar, remover)',
                    'rankativo': 'Rastreia atividades e gera ranking dos usuários mais ativos',
                    'welcome1': 'Envia boas-vindas automáticas com mensagem e imagem personalizada'
                };

                let extraInfo = "";
                if (commandNormalized === 'x9') {
                    extraInfo = `\n\n📊 *O que o X9 Monitor detecta:*\n• 👑 Promoções para admin\n• ⬇️ Rebaixamentos de admin\n• ➕ Membros adicionados\n• ➖ Membros removidos\n• 👨‍💼 Quem realizou cada ação\n\n⚠️ Status do X9 no grupo: ${status}`;
                } else if (commandNormalized === 'rankativo') {
                    extraInfo = `\n\n🔥 *O que o Rank de Ativos rastreia:*\n• 💬 Mensagens de texto\n• ⌨️ Comandos executados\n• 🖼️ Stickers enviados\n• 📱 Mídias (fotos, vídeos)\n• 📊 Calcula ranking dos top 6\n\n⚠️ Status do Ranking: ${status}`;
                } else if (commandNormalized === 'welcome1') {
                    extraInfo = `\n\n🎉 *O que o Bem-Vindo inclui:*\n• 💬 Mensagem personalizada automática\n• 🖼️ Welcome card com foto do membro\n• 🏷️ Placeholders dinâmicos\n• 👤 Foto de perfil automática\n• 📊 Informações do grupo em tempo real\n\n⚠️ Status do Bem-Vindo: ${status}`;
                }

                const configBot = obterConfiguracoes();
                await reply(sock, from, `📊 *${featureName}*\n\nStatus: ${status}\n\n📝 *Como usar:*\n• \`${configBot.prefix}${commandNormalized} on\` - Ativar\n• \`${configBot.prefix}${commandNormalized} off\` - Desativar\n\n⚔️ *Quando ativo:*\n• ${descriptions[commandNormalized]}${commandNormalized !== 'x9' ? '\n• Protege admins e dono' : ''}${extraInfo}\n\n⚠️ Apenas admins podem usar`);
            }
        }
        break;

        case "mensagembemvindo1": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem personalizar mensagens de boas-vindas.");
                break;
            }

            // Verifica se welcome está ativo
            const welcomeAtivo = welcomeSystem.isWelcomeAtivo(from);
            if (!welcomeAtivo) {
                await reagirMensagem(sock, message, "⚠️");
                await reply(sock, from, `⚠️ *WELCOME INATIVO*\n\n🎉 O sistema de boas-vindas não está ativo neste grupo.\n\n📝 *Para usar este comando:*\n1. Primeiro ative: \`.welcome1 on\`\n2. Depois personalize: \`.mensagembemvindo1 [sua mensagem]\`\n\n💡 *Exemplo:*\n\`.mensagembemvindo1 Olá! Seja muito bem-vindo ao nosso grupo incrível! Divirta-se e participe das conversas! 🎉\``);
                break;
            }

            const novaDescricao = args.join(' ');

            // Se não tem argumentos, mostra como usar
            if (!novaDescricao || novaDescricao.trim() === '') {
                await reagirMensagem(sock, message, "💡");
                
                const configAtual = welcomeSystem.obterConfig(from);
                const mensagemAtual = configAtual?.mensagem || "Nenhuma configurada";

                await reply(sock, from, `💬 *PERSONALIZAR BEM-VINDO*\n\n📝 *Como usar:*\n\`.mensagembemvindo1 [sua mensagem personalizada]\`\n\n💡 *Exemplo:*\n\`.mensagembemvindo1 Olá #numerodele! 🎉 Seja muito bem-vindo ao #nomedogrupo! Esperamos que você se divirta e participe das conversas!\`\n\n🎨 *Mensagem atual:*\n"${mensagemAtual}"\n\n✨ *Placeholders disponíveis:*\n• \`#numerodele\` - Menciona quem entrou\n• \`#nomedogrupo\` - Nome do grupo  \n• \`#totalmembros\` ou \`#totaldemembros\` - Total de membros\n\n⚠️ Você pode usar # livremente na sua mensagem!\n⚠️ Esta será a mensagem COMPLETA de boas-vindas`);
                break;
            }

            // Configura nova mensagem
            try {
                const sucesso = welcomeSystem.configurarMensagemCompleta(from, novaDescricao);
                
                if (sucesso) {
                    await reagirMensagem(sock, message, "✅");
                    await reply(sock, from, `✅ *MENSAGEM PERSONALIZADA*\n\n🎉 Mensagem de boas-vindas atualizada com sucesso!\n\n🎨 *Nova mensagem:*\n"${novaDescricao}"\n\n📝 *Como testar:*\n• Adicione alguém ao grupo para ver a mensagem\n• Use \`.testwelcome\` para testar agora\n\n💡 *Placeholders disponíveis:*\n• \`#numerodele\` - Menciona quem entrou\n• \`#nomedogrupo\` - Nome do grupo\n• \`#totalmembros\` ou \`#totaldemembros\` - Total de membros\n\n⚠️ Você pode usar # livremente na sua mensagem!\n⚠️ Sistema deve estar ativo para funcionar`);
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Erro ao configurar mensagem personalizada. Tente novamente.");
                }
            } catch (error) {
                console.error("❌ Erro no comando mensagembemvindo1:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro interno ao personalizar mensagem. Tente novamente.");
            }
        }
        break;

        case "bratgif": {
            if (args.length < 2) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}bratgif [texto1] [texto2]\n\n💡 Exemplo: ${config.prefix}bratgif flash kuun`);
                break;
            }

            try {
                await reagirMensagem(sock, message, "🎬");
                
                const texto = args.join('+');
                const url = `https://www.api.neext.online/bratvideo?text=${texto}`;
                
                await reply(sock, from, "⏳ Criando figurinha brat animada... Aguarde!");
                
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const buffer = Buffer.from(response.data);
                
                const agora = new Date();
                const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
                
                const webpFile = await writeExif(
                    { mimetype: 'video/mp4', data: buffer },
                    { 
                        packname: "BRAT ANIMADO", 
                        author: `NEEXT BOT - ${dataHora}`, 
                        categories: ["🎬"] 
                    }
                );
                
                const stickerBuffer = fs.readFileSync(webpFile);
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: selinho });
                fs.unlinkSync(webpFile);
                
                await reagirMensagem(sock, message, "✅");

            } catch (error) {
                console.error("❌ Erro ao criar bratgif:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao criar brat animado! Tente novamente mais tarde.");
            }
        }
        break;

        case "attp": {
            if (args.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}attp [texto]\n\n💡 Exemplo: ${config.prefix}attp neext`);
                break;
            }

            try {
                await reagirMensagem(sock, message, "✨");
                
                const texto = args.join(' ');
                const url = `https://www.api.neext.online/attp?text=${encodeURIComponent(texto)}`;
                
                await reply(sock, from, "⏳ Criando figurinha animada... Aguarde!");
                
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                
                const buffer = Buffer.from(response.data);
                
                const agora = new Date();
                const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
                
                const webpFile = await writeExif(
                    { mimetype: 'video/mp4', data: buffer },
                    { 
                        packname: "TEXTO ANIMADO", 
                        author: `NEEXT BOT - ${dataHora}`, 
                        categories: ["✨"] 
                    }
                );
                
                const stickerBuffer = fs.readFileSync(webpFile);
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: selinho });
                fs.unlinkSync(webpFile);
                
                await reagirMensagem(sock, message, "✅");

            } catch (error) {
                console.error("❌ Erro ao criar attp:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao criar texto animado! Tente novamente mais tarde.");
            }
        }
        break;

        case "s":
            try {
                // Obtém hora atual para metadados
                const agora = new Date();
                const dataHora = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;

                // Verifica se tem link do Pinterest nos argumentos
                const textInput = args.join(' ');
                const pinterestRegex = /(https?:\/\/)?(www\.)?(pinterest\.com|pin\.it)\/[^\s]+/gi;
                const pinterestMatch = textInput.match(pinterestRegex);
                
                let buffer = null;
                let finalMimetype = null;
                
                // Se encontrou link do Pinterest, processa ele
                if (pinterestMatch && pinterestMatch.length > 0) {
                    const pinterestUrl = pinterestMatch[0];
                    
                    await reagirMensagem(sock, message, "⏳");
                    
                    try {
                        // Faz request para a API do Pinterest
                        const apiUrl = `https://www.api.neext.online/savepin?url=${encodeURIComponent(pinterestUrl)}`;
                        
                        const response = await axios.get(apiUrl, {
                            timeout: 30000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        
                        if (!response.data || !response.data.success || !response.data.results || response.data.results.length === 0) {
                            throw new Error('API não retornou resultados válidos');
                        }
                        
                        const mediaResult = response.data.results[0];
                        const downloadLink = mediaResult.downloadLink;
                        const mediaFormat = mediaResult.format?.toLowerCase() || 'jpg';
                        
                        // Baixa a mídia
                        const mediaResponse = await axios.get(downloadLink, {
                            responseType: 'arraybuffer',
                            timeout: 60000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        
                        buffer = Buffer.from(mediaResponse.data);
                        
                        // Define o mimetype baseado no formato
                        if (mediaFormat === 'mp4' || mediaFormat === 'video') {
                            finalMimetype = 'video/mp4';
                        } else if (mediaFormat === 'gif') {
                            finalMimetype = 'image/gif';
                        } else if (mediaFormat === 'png') {
                            finalMimetype = 'image/png';
                        } else if (mediaFormat === 'webp') {
                            finalMimetype = 'image/webp';
                        } else {
                            finalMimetype = 'image/jpeg';
                        }
                        
                    } catch (pinterestError) {
                        await reagirMensagem(sock, message, "❌");
                        return await sock.sendMessage(from, {
                            text: `❌ Erro ao baixar do Pinterest:\n${pinterestError.message || 'Tente novamente'}\n\n💡 *Certifique-se de usar um link válido do Pinterest!*`
                        }, { quoted: message });
                    }
                }

                // Se não veio do Pinterest, processa mídia do WhatsApp
                if (!buffer) {
                    // Tenta detectar mídia de diferentes formas
                    let mediaMessage = null;
                    let mimetype = null;
                    let isQuotedSticker = false;

                    // 1. Verifica se é uma mensagem marcada (quotada)
                    let quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
                    if (quotedMsg) {
                        // Unwrap ephemeral/viewOnce wrappers para mensagens quotadas (todas as versões)
                        if (quotedMsg.ephemeralMessage) quotedMsg = quotedMsg.ephemeralMessage.message;
                        if (quotedMsg.viewOnceMessage) quotedMsg = quotedMsg.viewOnceMessage.message;
                        if (quotedMsg.viewOnceMessageV2) quotedMsg = quotedMsg.viewOnceMessageV2.message;
                        if (quotedMsg.viewOnceMessageV2Extension) quotedMsg = quotedMsg.viewOnceMessageV2Extension.message;

                        // Suporte a stickers citados também
                        if (quotedMsg.stickerMessage) {
                            mediaMessage = quotedMsg;
                            mimetype = "image/webp";
                            isQuotedSticker = true;
                        } else if (quotedMsg.imageMessage || quotedMsg.videoMessage) {
                            mediaMessage = quotedMsg;
                            mimetype = quotedMsg.imageMessage?.mimetype || quotedMsg.videoMessage?.mimetype;
                        }
                    }

                    // 2. Se não tem quotada, verifica se a própria mensagem tem mídia (enviada diretamente)
                    if (!mediaMessage && (message.message.imageMessage || message.message.videoMessage)) {
                        mediaMessage = message.message;
                        mimetype = message.message.imageMessage?.mimetype || message.message.videoMessage?.mimetype;
                    }

                    // Se não encontrou mídia do WhatsApp, mostra erro
                    if (!mediaMessage) {
                        await reagirMensagem(sock, message, "❌");
                        return await sock.sendMessage(from, {
                            text: "❌ Para criar figurinha:\n• Marque uma imagem/vídeo/sticker e digite .s\n• Ou envie uma imagem/vídeo com legenda .s\n• Ou envie .s [link do Pinterest]"
                        }, { quoted: message });
                    }
                    // Determina o tipo de mídia
                    let isImage, isVideo, type;
                    if (isQuotedSticker) {
                        isImage = false;
                        isVideo = false;
                        type = "sticker";
                    } else {
                        isImage = !!mediaMessage.imageMessage;
                        isVideo = !!mediaMessage.videoMessage;
                        type = isImage ? "image" : isVideo ? "video" : null;
                    }

                    if (!type) {
                        await reagirMensagem(sock, message, "❌");
                        return await sock.sendMessage(from, {
                            text: "❌ Apenas imagens, vídeos, GIFs e stickers são suportados para figurinhas"
                        }, { quoted: message });
                    }

                    // Reage indicando que está processando
                    await reagirMensagem(sock, message, "⏳");

                    // Faz download da mídia - CORRIGIDO para usar o nó específico
                    const mediaNode = isQuotedSticker ? mediaMessage.stickerMessage :
                                     isImage ? mediaMessage.imageMessage : mediaMessage.videoMessage;

                    // Verifica se o mediaNode tem as chaves necessárias para download (incluindo Buffer/string vazios)
                    const hasValidMediaKey = mediaNode.mediaKey &&
                        !(Buffer.isBuffer(mediaNode.mediaKey) && mediaNode.mediaKey.length === 0) &&
                        !(typeof mediaNode.mediaKey === 'string' && mediaNode.mediaKey.length === 0);

                    const hasValidPath = mediaNode.directPath || mediaNode.url;

                    if (!hasValidMediaKey || !hasValidPath) {
                        await reagirMensagem(sock, message, "❌");
                        return await sock.sendMessage(from, {
                            text: "❌ Não foi possível acessar esta mídia marcada.\nTente:\n• Enviar a imagem/vídeo diretamente com legenda .s\n• Marcar uma mídia mais recente"
                        }, { quoted: message });
                    }

                    const stream = await downloadContentFromMessage(mediaNode, isQuotedSticker ? "sticker" : type);
                    buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    // Detecta tipo de mídia corretamente se ainda não foi definido
                    if (!finalMimetype) {
                        // Se for sticker citado, já é WebP
                        if (isQuotedSticker) {
                            finalMimetype = 'image/webp';
                        } else {
                            // Detecta se é vídeo baseado no mimetype
                            const isVideoType = mimetype && (
                                mimetype.includes('video') ||
                                mimetype.includes('gif') ||
                                mimetype === 'image/gif'
                            );
                            finalMimetype = mimetype || (isVideoType ? 'video/mp4' : 'image/jpeg');
                        }
                    }
                }

                // Obtém informações para os metadados
                const config = obterConfiguracoes();
                const senderName = message.pushName || message.key.participant?.split('@')[0] || 'Usuário';
                
                // Monta o texto dos metadados no formato personalizado
                var pack = `↧ ❪🎨ฺ࣭࣪͘ꕸ▸ 𝐂𝐫𝐢𝐚𝐝𝐚 𝐩𝐨𝐫:\n• ↳ ${config.nomeDoBot}\n—\n↧ ❪🕵🏻‍♂️ฺ࣭࣪͘ꕸ▸ 𝐏𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨:\n• ↳ ${config.nickDoDono}\n—`;
                var author2 = `↧ ❪🏮ฺ࣭࣪͘ꕸ▸ 𝐒𝐨𝐥𝐢𝐜𝐢𝐭𝐚𝐝𝐨 𝐩𝐨𝐫:\n• ↳ ${senderName}\n—\n↧ ❪🐦‍🔥ฺ࣭࣪͘ꕸ▸ 𝐕𝐢𝐬𝐢𝐭𝐞 𝐧𝐨𝐬𝐬𝐨 𝐬𝐢𝐭𝐞:\n• ↳ www.api.neext.online`;

                // Marca se é vídeo do Pinterest (veio do link e é vídeo)
                const isPinterestVideo = (pinterestMatch && pinterestMatch.length > 0) && 
                                        finalMimetype && finalMimetype.includes('video');

                // Usa writeExif que suporta vídeos e webp
                const webpFile = await writeExif(
                    { mimetype: finalMimetype, data: buffer, isPinterestVideo: isPinterestVideo },
                    {
                        packname: pack,
                        author: author2,
                        categories: ["🔥"]
                    }
                );

                // Lê o sticker gerado e envia
                const stickerBuffer = fs.readFileSync(webpFile);

                // Envia a figurinha marcando a mensagem do usuário
                const stickerMessage = await sock.sendMessage(from, {
                    sticker: stickerBuffer
                }, { quoted: message });

                // Cleanup do arquivo temporário
                fs.unlinkSync(webpFile);

                await reagirMensagem(sock, message, "✅");

            } catch (err) {
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: "❌ Erro ao processar sua figurinha. Tente novamente ou use uma imagem/vídeo menor."
                }, { quoted: message });
            }
            break;

        case 'brat': {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(from, { text: '❌ Digite um texto!\n\nExemplo: *.brat neext*' }, { quoted: message });
                break;
            }

            console.log(`🎨 Gerando imagem BRAT: "${text}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                // API BRAT funcional
                const apiUrl = `https://api.ypnk.dpdns.org/api/image/brat?text=${encodeURIComponent(text)}`;
                console.log(`🔗 Chamando API BRAT: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
                    }
                });

                if (!response.data || response.data.length === 0) {
                    throw new Error('API retornou dados vazios');
                }

                const imageBuffer = Buffer.from(response.data);
                console.log(`📥 Imagem BRAT baixada: ${imageBuffer.length} bytes`);

                // Usa a função createSticker que já funciona no bot
                const { createSticker } = require("./arquivos/sticker.js");
                await createSticker(imageBuffer, sock, from, false);

                await reagirMensagem(sock, message, "✅");
                console.log('✅ Imagem BRAT enviada com sucesso!');

            } catch (error) {
                console.error('❌ Erro detalhado ao gerar BRAT:', error);

                let errorMessage = '❌ Erro ao gerar imagem BRAT.';

                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição.';
                } else if (error.response?.status === 404) {
                    errorMessage += ' API temporariamente indisponível.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Limite de requisições atingido.';
                } else {
                    errorMessage += ' Tente novamente.';
                }

                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
                await reagirMensagem(sock, message, "❌");
            }
            break;
        }

        case 'pinterest': {
            const query = args.join(' ');
            if (!query) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite uma palavra-chave para buscar!\n\nExemplo: *${config.prefix}pinterest naruto*` 
                }, { quoted: message });
                break;
            }

            console.log(`📌 Buscando imagens no Pinterest: "${query}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                // API Real do Pinterest
                const response = await axios.get(`https://api.nekolabs.my.id/discovery/pinterest/search?q=${encodeURIComponent(query)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                console.log(`📥 Resposta da API Pinterest:`, response.data?.success, response.data?.result?.length);
                
                if (!response.data || !response.data.success || !Array.isArray(response.data.result) || response.data.result.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Nenhuma imagem encontrada para essa busca. Tente uma palavra-chave diferente.'
                    }, { quoted: message });
                    break;
                }

                // Pega até 5 imagens dos resultados
                const imagesToSend = response.data.result.slice(0, 5);
                console.log(`📥 Encontradas ${response.data.result.length} imagens, enviando ${imagesToSend.length} em carrossel`);

                // Baixa as imagens em paralelo
                const imagePromises = imagesToSend.map(result => 
                    axios.get(result.imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
                );

                const imageResponses = await Promise.all(imagePromises);
                
                // Prepara as imagens para o carrossel
                const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
                
                const mediaPromises = imageResponses.map(response => 
                    prepareWAMessageMedia(
                        { image: Buffer.from(response.data) },
                        { upload: sock.waUploadToServer }
                    )
                );

                const mediaArray = await Promise.all(mediaPromises);

                // Cria os cards do carrossel com informações do Pinterest
                const cards = mediaArray.map((media, index) => {
                    const result = imagesToSend[index];
                    return {
                        header: {
                            imageMessage: media.imageMessage,
                            hasMediaAttachment: true
                        },
                        body: {
                            text: `📌 Pinterest - ${index + 1}/5\n\n👤 ${result.author?.fullname || result.author?.name || 'Anônimo'}\n📝 ${result.caption || 'Sem descrição'}`
                        },
                        nativeFlowMessage: {
                            buttons: []
                        }
                    };
                });

                // Cria mensagem em carrossel
                const carouselMessage = generateWAMessageFromContent(from, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: {
                                body: {
                                    text: `📌 *PINTEREST SEARCH* 📌\n\n🔍 Busca: "${query}"\n📸 ${imagesToSend.length} imagens encontradas\n\n© ${config.nomeDoBot}`
                                },
                                carouselMessage: {
                                    cards: cards
                                }
                            }
                        }
                    }
                }, { quoted: message });

                await sock.relayMessage(from, carouselMessage.message, {});
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Pinterest - Carrossel enviado com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao buscar no Pinterest:', error.message);
                
                let errorMessage = '❌ Erro ao buscar imagens no Pinterest.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão com a API.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição. Tente novamente.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Muitas requisições. Aguarde um momento.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' API temporariamente indisponível.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        case 'googleimagem':
        case 'googleimage': {
            const query = args.join(' ');
            if (!query) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite uma palavra-chave para buscar imagens!\n\nExemplo: *${config.prefix}googleimagem naruto*` 
                }, { quoted: message });
                break;
            }

            console.log(`🔍 Buscando imagens no Google: "${query}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                // API NEEXT para Google Images
                const response = await axios.get(`https://www.api.neext.online/pesquisa/googleimage?q=${encodeURIComponent(query)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                console.log(`📥 Resposta da API Google Images:`, response.data?.statusCode, response.data?.results?.count);
                
                if (!response.data || response.data.statusCode !== 200 || !response.data.results || !Array.isArray(response.data.results.search_data) || response.data.results.search_data.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Nenhuma imagem encontrada para essa busca. Tente uma palavra-chave diferente.'
                    }, { quoted: message });
                    break;
                }

                // Tenta baixar e enviar uma imagem aleatória (com retry)
                const maxRetries = 5;
                let imageBuffer = null;
                let successIndex = -1;
                
                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                        const randomIndex = Math.floor(Math.random() * response.data.results.search_data.length);
                        const randomImageUrl = response.data.results.search_data[randomIndex];
                        console.log(`📥 Tentativa ${attempt + 1}/${maxRetries}: Baixando imagem #${randomIndex + 1}`);

                        const imageResponse = await axios.get(randomImageUrl, { 
                            responseType: 'arraybuffer', 
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        imageBuffer = Buffer.from(imageResponse.data);
                        successIndex = randomIndex;
                        console.log(`✅ Imagem #${randomIndex + 1} baixada com sucesso (${imageBuffer.length} bytes)`);
                        break;
                    } catch (downloadError) {
                        console.log(`⚠️ Falha ao baixar imagem na tentativa ${attempt + 1}: ${downloadError.message}`);
                        if (attempt === maxRetries - 1) {
                            throw new Error('Não foi possível baixar nenhuma imagem após várias tentativas');
                        }
                    }
                }

                if (!imageBuffer) {
                    throw new Error('Falha ao obter imagem');
                }

                // Envia a imagem
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: `🔍 *GOOGLE IMAGES* 🔍\n\n🔍 Busca: "${query}"\n📸 Total: ${response.data.results.count} imagens\n🎲 Imagem aleatória\n\n© ${config.nomeDoBot}`
                }, { quoted: message });
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Google Images - Imagem aleatória enviada com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao buscar no Google Images:', error.message);
                
                let errorMessage = '❌ Erro ao buscar imagens no Google.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão com a API.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição. Tente novamente.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Muitas requisições. Aguarde um momento.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' API temporariamente indisponível.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        case 'bingimagem':
        case 'bingimage': {
            const query = args.join(' ');
            if (!query) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite uma palavra-chave para buscar imagens!\n\nExemplo: *${config.prefix}bingimagem naruto*` 
                }, { quoted: message });
                break;
            }

            console.log(`🔍 Buscando imagens no Bing: "${query}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                // API NEEXT para Bing Images
                const response = await axios.get(`https://www.api.neext.online/search/bingimage?query=${encodeURIComponent(query)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                
                console.log(`📥 Resposta da API Bing Images:`, response.data?.status, response.data?.total);
                
                if (!response.data || response.data.status !== 200 || !Array.isArray(response.data.results) || response.data.results.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Nenhuma imagem encontrada para essa busca. Tente uma palavra-chave diferente.'
                    }, { quoted: message });
                    break;
                }

                // Tenta baixar e enviar uma imagem aleatória (com retry)
                const maxRetries = 5;
                let imageBuffer = null;
                let successIndex = -1;
                
                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                        const randomIndex = Math.floor(Math.random() * response.data.results.length);
                        const randomImageUrl = response.data.results[randomIndex];
                        console.log(`📥 Tentativa ${attempt + 1}/${maxRetries}: Baixando imagem #${randomIndex + 1}`);

                        const imageResponse = await axios.get(randomImageUrl, { 
                            responseType: 'arraybuffer', 
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        imageBuffer = Buffer.from(imageResponse.data);
                        successIndex = randomIndex;
                        console.log(`✅ Imagem #${randomIndex + 1} baixada com sucesso (${imageBuffer.length} bytes)`);
                        break;
                    } catch (downloadError) {
                        console.log(`⚠️ Falha ao baixar imagem na tentativa ${attempt + 1}: ${downloadError.message}`);
                        if (attempt === maxRetries - 1) {
                            throw new Error('Não foi possível baixar nenhuma imagem após várias tentativas');
                        }
                    }
                }

                if (!imageBuffer) {
                    throw new Error('Falha ao obter imagem');
                }

                // Envia a imagem
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: `🔎 *BING IMAGES* 🔎\n\n🔍 Busca: "${query}"\n📸 Total: ${response.data.total} imagens\n🎲 Imagem aleatória\n\n© ${config.nomeDoBot}`
                }, { quoted: message });
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Bing Images - Imagem aleatória enviada com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao buscar no Bing Images:', error.message);
                
                let errorMessage = '❌ Erro ao buscar imagens no Bing.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão com a API.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição. Tente novamente.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Muitas requisições. Aguarde um momento.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' API temporariamente indisponível.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        case 'stalkerinstagram':
        case 'stalkig':
        case 'igstalk': {
            const username = args.join(' ').replace('@', '');
            if (!username) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite o username do Instagram!\n\nExemplo: *${config.prefix}stalkerinstagram neet.tk*` 
                }, { quoted: message });
                break;
            }

            console.log(`📸 Stalkando Instagram: "${username}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                const response = await axios.get(`https://www.api.neext.online/api/insta-stalk?username=${encodeURIComponent(username)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📥 Resposta Instagram Stalk:`, response.data?.success);
                
                if (!response.data || !response.data.success || !response.data.result) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Usuário *${username}* não encontrado no Instagram.`
                    }, { quoted: message });
                    break;
                }

                const result = response.data.result;
                const mensagem = `📸 *INSTAGRAM STALKER* 📸\n\n` +
                    `👤 Username: @${result.username}\n` +
                    `📝 Nome: ${result.fullname || 'Não informado'}\n` +
                    `📄 Bio: ${result.bio || 'Sem biografia'}\n` +
                    `📊 Posts: ${result.posts}\n` +
                    `👥 Seguidores: ${result.followers}\n` +
                    `➕ Seguindo: ${result.following}\n\n` +
                    `© ${config.nomeDoBot}`;

                // Baixa a foto de perfil se disponível
                if (result.profilePic) {
                    try {
                        const imageResponse = await axios.get(result.profilePic, {
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        
                        await sock.sendMessage(from, {
                            image: Buffer.from(imageResponse.data),
                            caption: mensagem
                        }, { quoted: message });
                    } catch (imgError) {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                }
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Instagram Stalk realizado com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao stalkar Instagram:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao buscar informações do Instagram. Tente novamente.'
                }, { quoted: message });
            }
            break;
        }

        case 'stalkeryoutube':
        case 'ytstalk':
        case 'stalkyoutube': {
            const channel = args.join(' ').replace('@', '');
            if (!channel) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite o nome do canal do YouTube!\n\nExemplo: *${config.prefix}stalkeryoutube neetk1*` 
                }, { quoted: message });
                break;
            }

            console.log(`📺 Stalkando YouTube: "${channel}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                const response = await axios.get(`https://www.api.neext.online/stalk/youtube?channel=${encodeURIComponent(channel)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📥 Resposta YouTube Stalk:`, response.data?.status);
                
                if (!response.data || !response.data.status) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Canal *${channel}* não encontrado no YouTube.`
                    }, { quoted: message });
                    break;
                }

                const result = response.data;
                const mensagem = `📺 *YOUTUBE STALKER* 📺\n\n` +
                    `📢 Canal: ${result.Canal}\n` +
                    `👥 Inscritos: ${result.Inscritos}\n` +
                    `🎬 Vídeos: ${result.Vídeos}\n` +
                    `👁️ Visualizações: ${result.Visualizações}\n` +
                    `📅 Criado em: ${result.CriadoEm}\n` +
                    `🔗 Link: ${result.url}\n\n` +
                    `© ${config.nomeDoBot}`;

                // Baixa a foto de perfil se disponível
                if (result.Perfil) {
                    try {
                        const imageResponse = await axios.get(result.Perfil, {
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        
                        await sock.sendMessage(from, {
                            image: Buffer.from(imageResponse.data),
                            caption: mensagem
                        }, { quoted: message });
                    } catch (imgError) {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                }
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ YouTube Stalk realizado com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao stalkar YouTube:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao buscar informações do YouTube. Tente novamente.'
                }, { quoted: message });
            }
            break;
        }

        case 'stalkertiktok':
        case 'ttstalk':
        case 'stalktiktok': {
            const username = args.join(' ').replace('@', '');
            if (!username) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite o username do TikTok!\n\nExemplo: *${config.prefix}stalkertiktok neet.chat*` 
                }, { quoted: message });
                break;
            }

            console.log(`🎵 Stalkando TikTok: "${username}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                const response = await axios.get(`https://www.api.neext.online/stalk/ttstalk?username=${encodeURIComponent(username)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📥 Resposta TikTok Stalk:`, response.data?.status);
                
                if (!response.data || response.data.status !== 200 || !response.data.result) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Usuário *${username}* não encontrado no TikTok.`
                    }, { quoted: message });
                    break;
                }

                const result = response.data.result;
                const mensagem = `🎵 *TIKTOK STALKER* 🎵\n\n` +
                    `👤 Username: @${result.uniqueId}\n` +
                    `📝 Nome: ${result.nickname}\n` +
                    `📄 Bio: ${result.bio || 'Sem biografia'}\n` +
                    `✅ Verificado: ${result.verified ? 'Sim ✓' : 'Não'}\n` +
                    `🔒 Privado: ${result.private ? 'Sim' : 'Não'}\n` +
                    `👥 Seguidores: ${result.followers.toLocaleString()}\n` +
                    `➕ Seguindo: ${result.following.toLocaleString()}\n` +
                    `❤️ Curtidas: ${result.hearts.toLocaleString()}\n` +
                    `🎬 Vídeos: ${result.videos}\n` +
                    `🔗 Link: ${result.profile_link}\n\n` +
                    `© ${config.nomeDoBot}`;

                // Baixa a foto de perfil se disponível
                if (result.avatar) {
                    try {
                        const imageResponse = await axios.get(result.avatar, {
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        
                        await sock.sendMessage(from, {
                            image: Buffer.from(imageResponse.data),
                            caption: mensagem
                        }, { quoted: message });
                    } catch (imgError) {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                }
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ TikTok Stalk realizado com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao stalkar TikTok:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao buscar informações do TikTok. Tente novamente.'
                }, { quoted: message });
            }
            break;
        }

        case 'stalkerroblox':
        case 'robloxstalk':
        case 'stalkroblox': {
            const username = args.join(' ');
            if (!username) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite o username do Roblox!\n\nExemplo: *${config.prefix}stalkerroblox kfl4sh*` 
                }, { quoted: message });
                break;
            }

            console.log(`🎮 Stalkando Roblox: "${username}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                const response = await axios.get(`https://www.api.neext.online/stalk/stalkroblox?user=${encodeURIComponent(username)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📥 Resposta Roblox Stalk:`, response.data?.statusCode);
                
                if (!response.data || response.data.statusCode !== 200 || !response.data.result) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Usuário *${username}* não encontrado no Roblox.`
                    }, { quoted: message });
                    break;
                }

                const result = response.data.result;
                const basic = result.basic;
                const social = result.social;
                const presence = result.presence?.userPresences?.[0];
                
                // Status de presença
                let presenceStatus = 'Offline';
                if (presence) {
                    if (presence.userPresenceType === 1) presenceStatus = 'Online';
                    else if (presence.userPresenceType === 2) presenceStatus = 'Jogando';
                    else if (presence.lastLocation) presenceStatus = presence.lastLocation;
                }

                const mensagem = `🎮 *ROBLOX STALKER* 🎮\n\n` +
                    `👤 Username: ${basic.name}\n` +
                    `📝 Display Name: ${basic.displayName}\n` +
                    `🆔 ID: ${basic.id}\n` +
                    `📄 Descrição: ${basic.description || 'Sem descrição'}\n` +
                    `📅 Criado em: ${new Date(basic.created).toLocaleDateString('pt-BR')}\n` +
                    `✅ Verificado: ${basic.hasVerifiedBadge ? 'Sim ✓' : 'Não'}\n` +
                    `🚫 Banido: ${basic.isBanned ? 'Sim' : 'Não'}\n` +
                    `🟢 Status: ${presenceStatus}\n\n` +
                    `👥 *SOCIAL*\n` +
                    `🤝 Amigos: ${social.friends.count}\n` +
                    `👥 Seguidores: ${social.followers.count}\n` +
                    `➕ Seguindo: ${social.following.count}\n\n` +
                    `© ${config.nomeDoBot}`;

                // Baixa a foto de perfil se disponível
                if (result.avatar?.headshot?.data?.[0]?.imageUrl) {
                    try {
                        const imageResponse = await axios.get(result.avatar.headshot.data[0].imageUrl, {
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        
                        await sock.sendMessage(from, {
                            image: Buffer.from(imageResponse.data),
                            caption: mensagem
                        }, { quoted: message });
                    } catch (imgError) {
                        await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(from, { text: mensagem }, { quoted: message });
                }
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Roblox Stalk realizado com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao stalkar Roblox:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao buscar informações do Roblox. Tente novamente.'
                }, { quoted: message });
            }
            break;
        }

        // ===================================
        // COMANDOS DE LOGOS - EPHOTO360
        // ===================================
        
        case 'glitchtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/glitchtext', 'Glitch Text', '✨');
            break;
        }
        
        case 'writetext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/writetext', 'Write Text', '✍️');
            break;
        }
        
        case 'advancedglow': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/advancedglow', 'Advanced Glow', '💫');
            break;
        }
        
        case 'typographytext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/typographytext', 'Typography Text', '📝');
            break;
        }
        
        case 'pixelglitch': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/pixelglitch', 'Pixel Glitch', '🎮');
            break;
        }
        
        case 'neonglitch': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/neonglitch', 'Neon Glitch', '🌟');
            break;
        }
        
        case 'flagtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/flagtext', 'Flag Text', '🚩');
            break;
        }
        
        case 'flag3dtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/flag3dtext', 'Flag 3D Text', '🏴');
            break;
        }
        
        case 'deletingtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/deletingtext', 'Deleting Text', '🗑️');
            break;
        }
        
        case 'blackpinkstyle': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/blackpinkstyle', 'BlackPink Style', '🖤');
            break;
        }
        
        case 'glowingtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/glowingtext', 'Glowing Text', '✨');
            break;
        }
        
        case 'underwatertext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/underwatertext', 'Underwater Text', '🌊');
            break;
        }
        
        case 'logomaker': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/logomaker', 'Logo Maker', '🎨');
            break;
        }
        
        case 'cartoonstyle': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/cartoonstyle', 'Cartoon Style', '🎭');
            break;
        }
        
        case 'papercutstyle': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/papercutstyle', 'Papercut Style', '✂️');
            break;
        }
        
        case 'watercolortext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/watercolortext', 'Watercolor Text', '🎨');
            break;
        }
        
        case 'effectclouds': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/effectclouds', 'Effect Clouds', '☁️');
            break;
        }
        
        case 'blackpinklogo': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/blackpinklogo', 'BlackPink Logo', '💗');
            break;
        }
        
        case 'gradienttext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/gradienttext', 'Gradient Text', '🌈');
            break;
        }
        
        case 'summerbeach': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/summerbeach', 'Summer Beach', '🏖️');
            break;
        }
        
        case 'luxurygold': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/luxurygold', 'Luxury Gold', '👑');
            break;
        }
        
        case 'multicoloredneon': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/multicoloredneon', 'Multicolored Neon', '🌈');
            break;
        }
        
        case 'sandsummer': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/sandsummer', 'Sand Summer', '🏝️');
            break;
        }
        
        case 'galaxywallpaper': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/galaxywallpaper', 'Galaxy Wallpaper', '🌌');
            break;
        }
        
        case '1917style': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/1917style', '1917 Style', '🎖️');
            break;
        }
        
        case 'makingneon': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/makingneon', 'Making Neon', '💡');
            break;
        }
        
        case 'royaltext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/royaltext', 'Royal Text', '👑');
            break;
        }
        
        case 'freecreate': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/freecreate', 'Free Create', '🆓');
            break;
        }
        
        case 'galaxystyle': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/galaxystyle', 'Galaxy Style', '🌠');
            break;
        }
        
        case 'amongustext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/amongustext', 'Among Us Text', '👾');
            break;
        }
        
        case 'rainytext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/rainytext', 'Rainy Text', '🌧️');
            break;
        }
        
        case 'lighteffects': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/lighteffects', 'Light Effects', '💫');
            break;
        }
        
        case 'shadowtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/shadowtext', 'Shadow Text', '👤');
            break;
        }
        
        case 'neontext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/neontext', 'Neon Text', '🔆');
            break;
        }
        
        case 'firetext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/firetext', 'Fire Text', '🔥');
            break;
        }
        
        case 'ice3dtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/ice3dtext', 'Ice 3D Text', '❄️');
            break;
        }
        
        case 'gold3dtext': {
            await processarLogo(sock, from, message, args, 'https://www.api.neext.online/ephoto/gold3dtext', 'Gold 3D Text', '🥇');
            break;
        }

        // ===================================
        // COMANDOS DE LOGOS - TEXTPRO
        // ===================================
        
        case 'logoneon': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/neon', 'Logo Neon', '💡');
            break;
        }
        
        case 'logofrozen': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/frozen', 'Logo Frozen', '❄️');
            break;
        }
        
        case 'logodeadpool': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/deadpool', 'Logo Deadpool', '💀');
            break;
        }
        
        case 'logopornhub': {
            await processarLogoDuplo(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/pornhub', 'Logo Pornhub', '🔞');
            break;
        }
        
        case 'logomatrix': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/matrix', 'Logo Matrix', '💚');
            break;
        }
        
        case 'logothor': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/thor', 'Logo Thor', '⚡');
            break;
        }
        
        case 'logopokemon': {
            await processarLogoDuplo(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/pokemon', 'Logo Pokemon', '⚡');
            break;
        }
        
        case 'logobatman': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/batman', 'Logo Batman', '🦇');
            break;
        }
        
        case 'logogreenhorror': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/greenhorror', 'Logo Green Horror', '👻');
            break;
        }
        
        case 'logomagma': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/magma', 'Logo Magma', '🌋');
            break;
        }
        
        case 'logoharrypotter': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/harrypotter', 'Logo Harry Potter', '⚡');
            break;
        }
        
        case 'logoglowing': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/glowing', 'Logo Glowing', '✨');
            break;
        }
        
        case 'logomarvel': {
            await processarLogoDuplo(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/marvel', 'Logo Marvel', '🦸');
            break;
        }
        
        case 'logoglitch': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/glitch', 'Logo Glitch', '📺');
            break;
        }
        
        case 'logohorror': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/horror', 'Logo Horror', '😱');
            break;
        }
        
        case 'logobearlogo': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/bearlogo', 'Logo Bear', '🐻');
            break;
        }
        
        case 'logograffiti': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/graffiti', 'Logo Graffiti', '🎨');
            break;
        }
        
        case 'logothunder': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/thunder', 'Logo Thunder', '⚡');
            break;
        }
        
        case 'logosketch': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/sketch', 'Logo Sketch', '✏️');
            break;
        }
        
        case 'logothreeDchrome': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/threeDchrome', 'Logo 3D Chrome', '🔷');
            break;
        }
        
        case 'logogold': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/gold', 'Logo Gold', '🥇');
            break;
        }
        
        case 'logocandy': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/candy', 'Logo Candy', '🍬');
            break;
        }
        
        case 'logonaruto': {
            await processarLogoDuplo(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/naruto', 'Logo Naruto', '🍥');
            break;
        }
        
        case 'logoblackpink': {
            await processarLogoDuplo(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/blackpink', 'Logo BlackPink', '💖');
            break;
        }
        
        case 'logostone': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/stone', 'Logo Stone', '🪨');
            break;
        }
        
        case 'logowater': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/water', 'Logo Water', '💧');
            break;
        }
        
        case 'logometal': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/metal', 'Logo Metal', '⚙️');
            break;
        }
        
        case 'logolava': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/lava', 'Logo Lava', '🌋');
            break;
        }
        
        case 'logojuice': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/juice', 'Logo Juice', '🧃');
            break;
        }
        
        case 'logogalaxy': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/galaxy', 'Logo Galaxy', '🌌');
            break;
        }
        
        case 'logoplasma': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/plasma', 'Logo Plasma', '⚡');
            break;
        }
        
        case 'logotransformer': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/transformer', 'Logo Transformer', '🤖');
            break;
        }
        
        case 'logoneon2': {
            await processarLogoTextpro(sock, from, message, args, 'https://www.api.neext.online/api/efeito/textpro/neon2', 'Logo Neon 2', '🔆');
            break;
        }

        case 'arma': {
            const query = args.join(' ');
            if (!query) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite o nome da arma para buscar!\n\nExemplo: *${config.prefix}arma glock*` 
                }, { quoted: message });
                break;
            }

            console.log(`🔫 Buscando informações da arma: "${query}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                
                // API NEEXT para busca de armas
                const response = await axios.get(`https://www.api.neext.online/arma?q=${encodeURIComponent(query)}`, {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📥 Resposta da API Arma:`, response.data?.status, response.data?.resultados?.length);
                
                if (!response.data || response.data.status !== 200 || !Array.isArray(response.data.resultados) || response.data.resultados.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Nenhuma arma encontrada para: *${query}*\n\nTente buscar por outro nome ou modelo.`
                    }, { quoted: message });
                    break;
                }

                // Pega a primeira arma dos resultados
                const arma = response.data.resultados[0];
                console.log(`🔫 Arma encontrada: ${arma.titulo}`);

                // Baixa a imagem da arma
                const imageResponse = await axios.get(arma.imagem, { 
                    responseType: 'arraybuffer', 
                    timeout: 15000 
                });
                const imageBuffer = Buffer.from(imageResponse.data);

                // Monta a mensagem com as informações
                const caption = `🔫 *INFORMAÇÕES DA ARMA* 🔫\n\n` +
                    `📌 *Modelo:* ${arma.titulo}\n` +
                    `💰 *Preço:* ${arma.preco}\n` +
                    `🔗 *Link:* ${arma.link}\n\n` +
                    `© ${config.nomeDoBot}`;

                // Envia a imagem com as informações
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: caption
                }, { quoted: message });
                
                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Informações da arma enviadas com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao buscar arma:', error.message);
                
                let errorMessage = '❌ Erro ao buscar informações da arma.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão com a API.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição. Tente novamente.';
                } else if (error.response?.status === 404) {
                    errorMessage += ' Arma não encontrada.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Muitas requisições. Aguarde um momento.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' API temporariamente indisponível.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        case 'metadinha': {
            console.log('💑 Comando metadinha acionado');
            await reagirMensagem(sock, message, "⏳");

            try {
                const response = await axios.get('https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json', {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Erro ao buscar metadinhas. Tente novamente!'
                    }, { quoted: message });
                    break;
                }

                const random = response.data[Math.floor(Math.random() * response.data.length)];
                const config = obterConfiguracoes();

                // Baixa as imagens
                const [maleImg, femaleImg] = await Promise.all([
                    axios.get(random.male, { responseType: 'arraybuffer' }),
                    axios.get(random.female, { responseType: 'arraybuffer' })
                ]);

                const maleBuffer = Buffer.from(maleImg.data);
                const femaleBuffer = Buffer.from(femaleImg.data);

                // Prepara as imagens para o carrossel
                const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
                
                const maleMedia = await prepareWAMessageMedia(
                    { image: maleBuffer },
                    { upload: sock.waUploadToServer }
                );
                
                const femaleMedia = await prepareWAMessageMedia(
                    { image: femaleBuffer },
                    { upload: sock.waUploadToServer }
                );

                // Cria mensagem em carrossel
                const carouselMessage = generateWAMessageFromContent(from, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: {
                                body: {
                                    text: `💕 *Resultados da metadinha* 💕\n\n© ${config.nomeDoBot}`
                                },
                                carouselMessage: {
                                    cards: [
                                        {
                                            header: {
                                                imageMessage: maleMedia.imageMessage,
                                                hasMediaAttachment: true
                                            },
                                            body: {
                                                text: "Perfil Masculino 🧑"
                                            },
                                            nativeFlowMessage: {
                                                buttons: []
                                            }
                                        },
                                        {
                                            header: {
                                                imageMessage: femaleMedia.imageMessage,
                                                hasMediaAttachment: true
                                            },
                                            body: {
                                                text: "Perfil Feminino 👧"
                                            },
                                            nativeFlowMessage: {
                                                buttons: []
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }, { quoted: message });

                await sock.relayMessage(from, carouselMessage.message, {});
                await reagirMensagem(sock, message, "✅");
                console.log('✅ Metadinhas enviadas em carrossel com sucesso!');

            } catch (error) {
                console.error('❌ Erro ao buscar metadinha:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao buscar metadinhas. Tente novamente mais tarde!'
                }, { quoted: message });
            }
            break;
        }

        case 'attp': {
            const text = args.join(' ');
            if (!text) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, { 
                    text: `❌ Digite um texto para criar o sticker animado!\n\nExemplo: *${config.prefix}attp NEEXT LTDA*` 
                }, { quoted: message });
                break;
            }

            console.log(`✨ Gerando ATTP: "${text}"`);
            await reagirMensagem(sock, message, "⏳");

            try {
                // API Widipe para ATTP - cria sticker animado com texto piscando
                const apiUrl = `https://widipe.com/attp?text=${encodeURIComponent(text)}`;
                console.log(`🔗 Chamando API ATTP: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.data || response.data.length === 0) {
                    throw new Error('API retornou dados vazios');
                }

                const stickerBuffer = Buffer.from(response.data);
                console.log(`📥 ATTP baixado: ${stickerBuffer.length} bytes`);

                // Envia o sticker animado
                await sock.sendMessage(from, {
                    sticker: stickerBuffer
                }, { quoted: selinho });

                await reagirMensagem(sock, message, "✅");
                console.log('✅ ATTP enviado com sucesso!');

            } catch (error) {
                console.error('❌ Erro detalhado ao gerar ATTP:', error);

                let errorMessage = '❌ Erro ao gerar sticker animado.';

                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout na requisição.';
                } else if (error.response?.status === 404) {
                    errorMessage += ' API temporariamente indisponível.';
                } else if (error.response?.status === 429) {
                    errorMessage += ' Limite de requisições atingido.';
                } else {
                    errorMessage += ' Tente novamente.';
                }

                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
                await reagirMensagem(sock, message, "❌");
            }
            break;
        }

        case 'chance': {
            const pergunta = args.join(' ').trim();
            
            if (!pergunta) {
                const config = obterConfiguracoes();
                await reagirMensagem(sock, message, "❓");
                await reply(sock, from, 
                    `❓ *CALCULADORA DE CHANCES*\n\n` +
                    `📝 *Como usar:*\n` +
                    `${config.prefix}chance [pergunta]\n\n` +
                    `💡 *Exemplos:*\n` +
                    `• ${config.prefix}chance de eu ficar rico\n` +
                    `• ${config.prefix}chance de chover hoje\n` +
                    `• ${config.prefix}chance do Brasil ganhar a copa\n\n` +
                    `🎲 O bot vai calcular a chance de acontecer!`
                );
                break;
            }

            console.log(`🎲 Calculando chance: "${pergunta}"`);
            await reagirMensagem(sock, message, "🎲");

            // Gera uma porcentagem aleatória
            const chanceAcontecer = Math.floor(Math.random() * 101); // 0-100
            const chanceNaoAcontecer = 100 - chanceAcontecer;

            // Determina emoji baseado na chance
            let emoji = "🎲";
            if (chanceAcontecer >= 80) emoji = "🔥";
            else if (chanceAcontecer >= 60) emoji = "✅";
            else if (chanceAcontecer >= 40) emoji = "🤔";
            else if (chanceAcontecer >= 20) emoji = "😬";
            else emoji = "❌";

            const config = obterConfiguracoes();
            const mensagemChance = 
                `${emoji} *CALCULADORA DE CHANCES* ${emoji}\n\n` +
                `❓ *Pergunta:*\n${pergunta}\n\n` +
                `📊 *RESULTADO:*\n\n` +
                `✅ *Chance de ACONTECER:* ${chanceAcontecer}%\n` +
                `${chanceAcontecer > 0 ? '█'.repeat(Math.floor(chanceAcontecer / 10)) : '░'}\n\n` +
                `❌ *Chance de NÃO ACONTECER:* ${chanceNaoAcontecer}%\n` +
                `${chanceNaoAcontecer > 0 ? '█'.repeat(Math.floor(chanceNaoAcontecer / 10)) : '░'}\n\n` +
                `🎯 *Conclusão:* ${chanceAcontecer >= 70 ? 'Muito provável!' : chanceAcontecer >= 50 ? 'Chances médias!' : chanceAcontecer >= 30 ? 'Pouco provável!' : 'Quase impossível!'}\n\n` +
                `© ${config.nomeDoBot}`;

            await sock.sendMessage(from, {
                text: mensagemChance,
                contextInfo: {
                    forwardingScore: 100000,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363289739581116@newsletter",
                        newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                    },
                    externalAdReply: {
                        title: `${emoji} CHANCE: ${chanceAcontecer}%`,
                        body: "© NEEXT LTDA • Calculadora de Chances",
                        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                        mediaType: 1,
                        sourceUrl: "https://www.neext.online"
                    }
                }
            }, { quoted: selinho });

            await reagirMensagem(sock, message, emoji);
            console.log(`✅ Chance calculada: ${chanceAcontecer}% para "${pergunta}"`);
            break;
        }

        case 'correio': {
            const textoCompleto = args.join(' ').trim();
            
            if (!textoCompleto.includes('/')) {
                const config = obterConfiguracoes();
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, 
                    `❌ *FORMATO INCORRETO!*\n\n` +
                    `📝 *Como usar:*\n` +
                    `${config.prefix}correio [número]/[mensagem]\n\n` +
                    `💡 *Exemplo:*\n` +
                    `${config.prefix}correio 5591912345678/Oi amor, saudades de você! ❤️\n\n` +
                    `⚠️ *Importante:*\n` +
                    `• Use o número completo com código do país (55 para Brasil)\n` +
                    `• Não use espaços no número\n` +
                    `• Use / para separar número da mensagem`
                );
                break;
            }

            const [numeroDestino, mensagemAnonima] = textoCompleto.split('/');
            
            if (!numeroDestino || !mensagemAnonima || numeroDestino.trim() === '' || mensagemAnonima.trim() === '') {
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, '❌ Número ou mensagem inválidos! Verifique o formato.');
                break;
            }

            console.log(`💌 Enviando correio anônimo para: ${numeroDestino}`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const config = obterConfiguracoes();
                const numeroLimpo = numeroDestino.trim().replace(/[^0-9]/g, '');
                
                const mensagemCorreio = 
                    `⸙. ͎۪۫𝚅𝙾𝙲𝙴 𝙰𝙲𝙰𝙱𝙰 𝙳𝙴 𝚁𝙴𝙲𝙴𝙱𝙴𝚁 𝚄𝙼𝙰 𝙼𝙴𝙽𝚂𝙰𝙶𝙴𝙼 𝙰𝙽𝙾𝙽𝙸𝙼𝙰 💗 ː͡₊ꞋꞌꞋꞌ*\n\n` +
                    `*🌟 𝙰 𝙼𝙴𝙽𝚂𝙰𝙶𝙴𝙼:*\n\n` +
                    `- ${mensagemAnonima.trim()}\n\n` +
                    `⸙. ͎۪۫𝙰𝚂𝚂: 𝙰𝙽𝙾𝙽𝙸𝙼𝙾💗 ː͡₊ꞋꞌꞋꞌ\n\n` +
                    `© ${config.nomeDoBot}`;

                await sock.sendMessage(`${numeroLimpo}@s.whatsapp.net`, {
                    text: mensagemCorreio,
                    contextInfo: {
                        forwardingScore: 100000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363289739581116@newsletter",
                            newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                        },
                        externalAdReply: {
                            title: "💌 CORREIO ANÔNIMO",
                            body: "© NEEXT LTDA • Mensagem Secreta",
                            thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                            mediaType: 1,
                            sourceUrl: "https://www.neext.online"
                        }
                    }
                });

                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, `✅ *✰ MENSAGEM ENVIADA COM SUCESSO! ★*\n\n📬 Destinatário: ${numeroDestino}\n💌 Sua mensagem anônima foi entregue!`);
                
                console.log(`✅ Correio anônimo enviado para ${numeroLimpo}`);

            } catch (error) {
                console.error('❌ Erro ao enviar correio anônimo:', error);
                await reagirMensagem(sock, message, "❌");
                
                let errorMsg = '❌ Erro ao enviar mensagem anônima.';
                if (error.message?.includes('not-authorized')) {
                    errorMsg += ' O bot não tem permissão para enviar mensagens para este número.';
                } else if (error.message?.includes('forbidden')) {
                    errorMsg += ' Número bloqueou o bot ou não está no WhatsApp.';
                } else {
                    errorMsg += ' Verifique se o número está correto e tente novamente.';
                }
                
                await reply(sock, from, errorMsg);
            }
            break;
        }

        // Comandos de Figurinhas (Pacotes)
        case 'figurinhasanime':
        case 'figurinhasmeme':
        case 'figurinhasemoji':
        case 'figurinhascoreana':
        case 'figurinhasdesenho':
        case 'figurinhasraiva':
        case 'figurinhasroblox':
        case 'figurinhasengracadas': {
            const tipoMap = {
                'figurinhasanime': { tipo: 'anime', emoji: '🎌', nome: 'Anime' },
                'figurinhasmeme': { tipo: 'meme', emoji: '😂', nome: 'Meme' },
                'figurinhasemoji': { tipo: 'emoji', emoji: '😊', nome: 'Emoji' },
                'figurinhascoreana': { tipo: 'coreana', emoji: '🌸', nome: 'Coreana' },
                'figurinhasdesenho': { tipo: 'desenho', emoji: '🎨', nome: 'Desenho' },
                'figurinhasraiva': { tipo: 'raiva', emoji: '😡', nome: 'Raiva' },
                'figurinhasroblox': { tipo: 'roblox', emoji: '🎮', nome: 'Roblox' },
                'figurinhasengracadas': { tipo: 'engracadas', emoji: '🤣', nome: 'Engraçadas' }
            };

            const info = tipoMap[command];
            const apiUrl = `https://www.api.neext.online/sticker/figurinhas/${info.tipo}`;

            await reagirMensagem(sock, message, "⏳");

            try {
                await sock.sendMessage(from, {
                    text: `${info.emoji} *Enviando 5 figurinhas ${info.nome}...*\n\n⏳ Aguarde um momento...`
                }, { quoted: message });

                // Envia 5 figurinhas
                for (let i = 0; i < 5; i++) {
                    try {
                        const response = await axios.get(apiUrl, {
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        // Envia a figurinha
                        await sock.sendMessage(from, {
                            sticker: Buffer.from(response.data)
                        });

                        console.log(`✅ Figurinha ${i + 1}/5 enviada (${info.nome})`);

                        // Aguarda entre envios
                        if (i < 4) {
                            await new Promise(resolve => setTimeout(resolve, 800));
                        }
                    } catch (err) {
                        console.error(`❌ Erro ao enviar figurinha ${i + 1}:`, err.message);
                    }
                }

                await reagirMensagem(sock, message, "✅");
                await sock.sendMessage(from, {
                    text: `${info.emoji} *5 figurinhas ${info.nome} enviadas com sucesso!*\n\n© NEEXT LTDA`
                }, { quoted: selinho });

                console.log(`✅ Pacote de figurinhas ${info.nome} enviado com sucesso!`);

            } catch (error) {
                console.error(`❌ Erro ao buscar figurinhas ${info.nome}:`, error.message);
                
                let errorMessage = `❌ Erro ao buscar figurinhas ${info.nome}.`;
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' API indisponível.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor temporariamente fora do ar.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        // Comandos de Figurinhas Coloridas (BlueSticker)
        case 'figurinhasemojiazul':
        case 'figurinhasemojivioleta':
        case 'figurinhasemojiamarelo':
        case 'figurinhasemojivermelho':
        case 'figurinhasemojirosa':
        case 'figurinhasemojiturquesa':
        case 'figurinhasemojiverde':
        case 'figurinhasemojibranco':
        case 'figurinhasemojipreto': {
            const coresMap = {
                'figurinhasemojiazul': { cor: 'blue', emoji: '🔵', nome: 'Emoji Azul' },
                'figurinhasemojivioleta': { cor: 'violet', emoji: '🟣', nome: 'Emoji Violeta' },
                'figurinhasemojiamarelo': { cor: 'yellow', emoji: '🟡', nome: 'Emoji Amarelo' },
                'figurinhasemojivermelho': { cor: 'red', emoji: '🔴', nome: 'Emoji Vermelho' },
                'figurinhasemojirosa': { cor: 'pink', emoji: '🩷', nome: 'Emoji Rosa' },
                'figurinhasemojiturquesa': { cor: 'teal', emoji: '🩵', nome: 'Emoji Turquesa' },
                'figurinhasemojiverde': { cor: 'green', emoji: '🟢', nome: 'Emoji Verde' },
                'figurinhasemojibranco': { cor: 'white', emoji: '⚪', nome: 'Emoji Branco' },
                'figurinhasemojipreto': { cor: 'black', emoji: '⚫', nome: 'Emoji Preto' }
            };

            const info = coresMap[command];
            const apiUrl = `https://www.api.neext.online/bluesticker/${info.cor}`;

            await reagirMensagem(sock, message, "⏳");

            try {
                await sock.sendMessage(from, {
                    text: `${info.emoji} *Enviando 5 figurinhas ${info.nome}...*\n\n⏳ Aguarde um momento...`
                }, { quoted: message });

                // Envia 5 figurinhas
                for (let i = 0; i < 5; i++) {
                    try {
                        const response = await axios.get(apiUrl, {
                            responseType: 'arraybuffer',
                            timeout: 15000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });

                        // Converte para WebP usando writeExif
                        const webpFile = await writeExif(
                            { mimetype: 'image/png', data: Buffer.from(response.data) },
                            { packname: "NEEXT LTDA", author: "NEEXT BOT", categories: ["😎"] }
                        );

                        // Envia a figurinha convertida
                        const stickerBuffer = fs.readFileSync(webpFile);
                        await sock.sendMessage(from, {
                            sticker: stickerBuffer
                        });

                        // Limpa arquivo temporário
                        fs.unlinkSync(webpFile);

                        // Aguarda entre envios
                        if (i < 4) {
                            await new Promise(resolve => setTimeout(resolve, 800));
                        }
                    } catch (err) {
                        console.error(`❌ Erro ao enviar figurinha ${i + 1}:`, err.message);
                    }
                }

                await reagirMensagem(sock, message, "✅");
                await sock.sendMessage(from, {
                    text: `${info.emoji} *5 figurinhas ${info.nome} enviadas com sucesso!*\n\n© NEEXT LTDA`
                }, { quoted: message });

            } catch (error) {
                console.error(`❌ Erro ao buscar figurinhas ${info.nome}:`, error.message);
                
                let errorMessage = `❌ Erro ao buscar figurinhas ${info.nome}.`;
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' API indisponível.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor temporariamente fora do ar.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        // Comando Pensador - Frases de pensadores
        case 'pensador': {
            const personagem = args.join(' ');
            if (!personagem) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, {
                    text: `💭 *Como usar o comando pensador:*\n\n` +
                          `📝 \`${config.prefix}pensador [personagem]\`\n\n` +
                          `💡 *Exemplo:*\n` +
                          `\`${config.prefix}pensador Einstein\`\n` +
                          `\`${config.prefix}pensador Shakespeare\`\n\n` +
                          `🔍 Digite o nome de um pensador ou personagem!`
                }, { quoted: message });
                break;
            }

            console.log(`💭 Buscando frases de: ${personagem}`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const response = await axios.get(`https://www.api.neext.online/frases/pensador?q=${encodeURIComponent(personagem)}`, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`📥 Resposta API Pensador:`, response.data);

                if (!Array.isArray(response.data) || response.data.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Nenhuma frase encontrada para "${personagem}".\n\n💡 Tente outro pensador ou personagem!`
                    }, { quoted: message });
                    break;
                }

                // Pega até 3 frases aleatórias
                const frasesParaEnviar = response.data.slice(0, 3);
                
                await reagirMensagem(sock, message, "✅");

                // Envia cada frase
                for (let i = 0; i < frasesParaEnviar.length; i++) {
                    const frase = frasesParaEnviar[i];
                    
                    const mensagem = `💭 *FRASE ${i + 1}/${frasesParaEnviar.length}*\n\n` +
                                   `📝 "${frase.text}"\n\n` +
                                   `✍️ *Autor:* ${frase.author}\n\n` +
                                   `🔍 *Busca:* ${personagem}\n` +
                                   `© NEEXT LTDA`;

                    await sock.sendMessage(from, {
                        text: mensagem
                    }, { quoted: selinho });

                    // Aguarda entre envios
                    if (i < frasesParaEnviar.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                console.log(`✅ ${frasesParaEnviar.length} frases de ${personagem} enviadas!`);

            } catch (error) {
                console.error('❌ Erro ao buscar frases do pensador:', error.message);
                
                let errorMessage = '❌ Erro ao buscar frases.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' API indisponível.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor fora do ar.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        // Comando Frases Anime
        case 'frasesanime': {
            console.log(`🎌 Buscando frase de anime...`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const response = await axios.get('https://www.api.neext.online/frases/frasesanime', {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`📥 Resposta API Frases Anime:`, response.data);

                if (!response.data || !response.data.text) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Erro ao buscar frase de anime. Tente novamente!'
                    }, { quoted: message });
                    break;
                }

                await reagirMensagem(sock, message, "✅");

                const mensagem = `🎌 *FRASE DE ANIME*\n\n` +
                               `📝 "${response.data.text}"\n\n` +
                               `📺 *Anime:* ${response.data.author}\n\n` +
                               `© NEEXT LTDA`;

                await sock.sendMessage(from, {
                    text: mensagem,
                    contextInfo: {
                        forwardingScore: 100000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363289739581116@newsletter",
                            newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                        }
                    }
                }, { quoted: selinho });

                console.log(`✅ Frase de anime enviada com sucesso!`);

            } catch (error) {
                console.error('❌ Erro ao buscar frase de anime:', error.message);
                
                let errorMessage = '❌ Erro ao buscar frase de anime.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' API indisponível.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor fora do ar.';
                } else {
                    errorMessage += ' Tente novamente mais tarde.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        // Comando Wikipedia - Nova versão com API oficial
        case 'wikipedia':
        case 'wiki': {
            const assunto = args.join(' ');
            if (!assunto) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, {
                    text: `📚 *WIKIPEDIA - Pesquise qualquer coisa!*\n\n📝 *Como usar:*\n${config.prefix}wikipedia [assunto]\n${config.prefix}wiki [assunto]\n\n💡 *Exemplos:*\n${config.prefix}wiki Brasil\n${config.prefix}wikipedia Inteligência Artificial\n\n🔍 Digite o que deseja pesquisar!`
                }, { quoted: message });
                break;
            }

            console.log(`📚 Pesquisando na Wikipedia: ${assunto}`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const apiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(assunto)}`;
                console.log(`🔗 Chamando API Wikipedia: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`📥 Resposta API Wikipedia recebida`);

                if (!response.data || response.data.type === 'disambiguation' || !response.data.extract) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Nenhum resultado encontrado para "${assunto}".\n\n💡 Tente ser mais específico na sua pesquisa!`
                    }, { quoted: message });
                    break;
                }

                const dados = response.data;
                const titulo = dados.title || assunto;
                const descricao = dados.extract || 'Descrição não disponível';
                const imagemUrl = dados.thumbnail?.source || dados.originalimage?.source || null;
                const pageUrl = dados.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(assunto)}`;

                await reagirMensagem(sock, message, "✅");

                // Envia com imagem se disponível
                if (imagemUrl) {
                    await sock.sendMessage(from, {
                        image: { url: imagemUrl },
                        caption: `📚 *WIKIPEDIA*\n\n📖 *${titulo}*\n\n${descricao}\n\n🔗 ${pageUrl}\n\n© NEEXT LTDA`,
                        contextInfo: {
                            forwardingScore: 100000,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            },
                            externalAdReply: {
                                title: "📚 WIKIPEDIA",
                                body: titulo,
                                thumbnailUrl: imagemUrl,
                                mediaType: 1,
                                sourceUrl: pageUrl
                            }
                        }
                    }, { quoted: message });
                } else {
                    // Sem imagem, envia só texto
                    await sock.sendMessage(from, {
                        text: `📚 *WIKIPEDIA*\n\n📖 *${titulo}*\n\n${descricao}\n\n🔗 ${pageUrl}\n\n© NEEXT LTDA`
                    }, { quoted: message });
                }

                console.log(`✅ Resultado da Wikipedia enviado: ${titulo}`);

            } catch (error) {
                console.error('❌ Erro ao buscar na Wikipedia:', error.message);
                
                let errorMessage = '❌ Erro ao buscar na Wikipedia.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' Problema de conexão.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status === 404) {
                    errorMessage = `❌ Página "${assunto}" não encontrada na Wikipedia.\n\n💡 Verifique a ortografia ou tente outro termo!`;
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor Wikipedia fora do ar.';
                } else {
                    errorMessage += ' Tente novamente.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        // Comando AudioMeme - Pesquisa e envia áudio aleatório
        case 'audiomeme':
        case 'audio': {
            const pesquisa = args.join(' ');
            if (!pesquisa) {
                const config = obterConfiguracoes();
                await sock.sendMessage(from, {
                    text: `🎵 *AUDIOMEME - Pesquise e receba um áudio!*\n\n📝 *Como usar:*\n${config.prefix}audiomeme [pesquisa]\n${config.prefix}audio [pesquisa]\n\n💡 *Exemplos:*\n${config.prefix}audiomeme lula\n${config.prefix}audio neymar\n\n🔍 Digite o que deseja pesquisar!`
                }, { quoted: message });
                break;
            }

            console.log(`🎵 Pesquisando áudio: ${pesquisa}`);
            await reagirMensagem(sock, message, "⏳");

            try {
                const apiUrl = `https://www.api.neext.online/audiomeme?q=${encodeURIComponent(pesquisa)}`;
                console.log(`🔗 Chamando API AudioMeme: ${apiUrl}`);

                const response = await axios.get(apiUrl, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`📥 Resposta API AudioMeme recebida`);

                if (!response.data || !response.data.resultados || response.data.resultados.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ Nenhum áudio encontrado para "${pesquisa}".\n\n💡 Tente outro termo de pesquisa!`
                    }, { quoted: message });
                    break;
                }

                const dados = response.data;
                const total = dados.total || dados.resultados.length;
                
                // Seleciona um áudio aleatório dos resultados
                const audioAleatorio = dados.resultados[Math.floor(Math.random() * dados.resultados.length)];
                const titulo = audioAleatorio.titulo || 'Áudio';
                const audioUrl = audioAleatorio.audio_direct;

                if (!audioUrl) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: `❌ URL do áudio não disponível. Tente novamente!`
                    }, { quoted: message });
                    break;
                }

                console.log(`🎵 Baixando áudio: ${titulo}`);

                // Baixa o áudio
                const audioResponse = await axios.get(audioUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });

                const audioBuffer = Buffer.from(audioResponse.data);

                await reagirMensagem(sock, message, "✅");

                // Envia o áudio
                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${titulo}.mp3`
                }, { quoted: message });

                // Envia informação sobre o áudio
                await sock.sendMessage(from, {
                    text: `🎵 *${titulo}*\n\n🔍 Pesquisa: "${pesquisa}"\n📊 Total encontrado: ${total} áudios\n\n© NEEXT LTDA`
                }, { quoted: message });

                console.log(`✅ Áudio enviado: ${titulo}`);

            } catch (error) {
                console.error('❌ Erro ao buscar áudio:', error.message);
                
                let errorMessage = '❌ Erro ao buscar áudio.';
                
                if (error.code === 'ENOTFOUND') {
                    errorMessage += ' API indisponível.';
                } else if (error.code === 'ETIMEDOUT') {
                    errorMessage += ' Timeout. Tente novamente.';
                } else if (error.response?.status === 404) {
                    errorMessage = `❌ Nenhum áudio encontrado para "${pesquisa}".\n\n💡 Tente outro termo!`;
                } else if (error.response?.status >= 500) {
                    errorMessage += ' Servidor fora do ar.';
                } else {
                    errorMessage += ' Tente novamente.';
                }
                
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: errorMessage
                }, { quoted: message });
            }
            break;
        }

        case 'rename': {
            if (!args.length) {
                await sock.sendMessage(from, {
                    text: '🏷️ *Como usar o comando rename:*\n\n' +
                          '📝 *.rename Pack Nome | Autor Nome*\n\n' +
                          '💡 *Exemplo:*\n' +
                          '*.rename Meus Stickers | João*\n\n' +
                          '📌 Responda uma figurinha existente com este comando para renomeá-la!'
                }, { quoted: message });
                break;
            }

            // Verifica se tem figurinha citada
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg || !quotedMsg.stickerMessage) {
                await sock.sendMessage(from, {
                    text: '❌ Você precisa responder a uma figurinha para usar este comando!'
                }, { quoted: message });
                break;
            }

            await reagirMensagem(sock, message, "⏳");

            try {
                // Parse dos argumentos (packname | author) fornecidos pelo usuário
                const fullText = args.join(' ');
                const [userPackname, userAuthor] = fullText.split('|').map(s => s.trim());

                if (!userPackname || !userAuthor) {
                    await reagirMensagem(sock, message, "❌");
                    await sock.sendMessage(from, {
                        text: '❌ Use o formato: *.rename Pack Nome | Autor Nome*'
                    }, { quoted: message });
                    break;
                }

                // Usa APENAS os dados fornecidos pelo usuário
                const packname = userPackname;
                const author = userAuthor;

                console.log(`🏷️ Renomeando figurinha: Pack="${packname}", Autor="${author}"`);

                // Baixa a figurinha original
                const stickerBuffer = await downloadContentFromMessage(
                    quotedMsg.stickerMessage,
                    'sticker'
                );

                let buffer = Buffer.concat([]);
                for await (const chunk of stickerBuffer) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Opções personalizadas com dados do usuário + NEEXT
                const options = {
                    packname: packname,
                    author: author
                };

                // Detecta se é animada de forma mais precisa
                let isAnimated = false;

                // Primeiro verifica se está marcada como animada no metadado
                if (quotedMsg.stickerMessage.isAnimated === true) {
                    isAnimated = true;
                } else {
                    // Verifica headers WebP para detectar animação
                    const hexString = buffer.toString('hex').toUpperCase();
                    // WebP animado contém 'WEBPVP8X' ou 'WEBPVP8L' com flag de animação
                    if (hexString.includes('5745425056503858') || // WEBPVP8X
                        hexString.includes('5745425056503841')) {   // WEBPVP8A (com alpha/animação)
                        isAnimated = true;
                    }
                }

                console.log(`📊 Tipo de figurinha detectado: ${isAnimated ? 'Animada' : 'Estática'}`);

                // Reenvia a figurinha com novos metadados
                try {
                    if (isAnimated) {
                        await sendVideoAsSticker(sock, from, buffer, message, options);
                    } else {
                        await sendImageAsSticker(sock, from, buffer, message, options);
                    }
                } catch (stickerError) {
                    console.log(`⚠️ Erro ao processar como ${isAnimated ? 'animada' : 'estática'}, tentando método alternativo...`);
                    // Se falhar, tenta o método alternativo
                    try {
                        if (isAnimated) {
                            await sendImageAsSticker(sock, from, buffer, message, options);
                        } else {
                            await sendVideoAsSticker(sock, from, buffer, message, options);
                        }
                    } catch (fallbackError) {
                        console.error('❌ Ambos os métodos falharam:', fallbackError.message);
                        throw new Error('Não foi possível processar a figurinha');
                    }
                }

                await reagirMensagem(sock, message, "✅");
                console.log('✅ Figurinha renomeada com sucesso!');

            } catch (error) {
                console.error('❌ Erro no comando rename:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao renomear figurinha. Tente novamente!'
                }, { quoted: message });
            }
            break;
        }

        case 'take': {
            // Verifica se tem figurinha citada
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg || !quotedMsg.stickerMessage) {
                await sock.sendMessage(from, {
                    text: '❌ Você precisa responder a uma figurinha para usar este comando!\n\n💡 *Como usar:*\nResponda uma figurinha com `.take`'
                }, { quoted: message });
                break;
            }

            await reagirMensagem(sock, message, "⏳");

            try {
                // Pega o nome da pessoa do perfil WhatsApp
                const senderName = message.pushName || "Usuário";
                
                // Monta apenas o packname com o nome formatado, author vazio
                const packname = `『${senderName}』`;
                const author = "";

                console.log(`🏷️ Take figurinha para: "${senderName}"`);

                // Baixa a figurinha original
                const stickerBuffer = await downloadContentFromMessage(
                    quotedMsg.stickerMessage,
                    'sticker'
                );

                let buffer = Buffer.concat([]);
                for await (const chunk of stickerBuffer) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // Opções personalizadas com o nome da pessoa
                const options = {
                    packname: packname,
                    author: author
                };

                // Detecta se é animada de forma mais precisa
                let isAnimated = false;

                // Primeiro verifica se está marcada como animada no metadado
                if (quotedMsg.stickerMessage.isAnimated === true) {
                    isAnimated = true;
                } else {
                    // Verifica headers WebP para detectar animação
                    const hexString = buffer.toString('hex').toUpperCase();
                    // WebP animado contém 'WEBPVP8X' ou 'WEBPVP8L' com flag de animação
                    if (hexString.includes('5745425056503858') || // WEBPVP8X
                        hexString.includes('5745425056503841')) {   // WEBPVP8A (com alpha/animação)
                        isAnimated = true;
                    }
                }

                console.log(`📊 Tipo de figurinha detectado: ${isAnimated ? 'Animada' : 'Estática'}`);

                // Reenvia a figurinha com novos metadados
                try {
                    if (isAnimated) {
                        await sendVideoAsSticker(sock, from, buffer, message, options);
                    } else {
                        await sendImageAsSticker(sock, from, buffer, message, options);
                    }
                } catch (stickerError) {
                    console.log(`⚠️ Erro ao processar como ${isAnimated ? 'animada' : 'estática'}, tentando método alternativo...`);
                    // Se falhar, tenta o método alternativo
                    try {
                        if (isAnimated) {
                            await sendImageAsSticker(sock, from, buffer, message, options);
                        } else {
                            await sendVideoAsSticker(sock, from, buffer, message, options);
                        }
                    } catch (fallbackError) {
                        console.error('❌ Ambos os métodos falharam:', fallbackError.message);
                        throw new Error('Não foi possível processar a figurinha');
                    }
                }

                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Figurinha "take" criada com sucesso para ${senderName}!`);

            } catch (error) {
                console.error('❌ Erro no comando take:', error.message);
                await reagirMensagem(sock, message, "❌");
                await sock.sendMessage(from, {
                    text: '❌ Erro ao processar figurinha. Tente novamente!'
                }, { quoted: message });
            }
            break;
        }

        case "instagram":
        case "ig": {
            try {
                // Verifica se foi fornecido um link
                if (!args[0]) {
                    await reply(sock, from, "❌ Por favor, forneça um link do Instagram.\n\nExemplo: `.ig https://instagram.com/p/xxxxx`");
                    break;
                }

                const url = args[0];

                // Verifica se é um link válido do Instagram
                if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
                    await reply(sock, from, "❌ Link inválido! Use um link do Instagram.");
                    break;
                }

                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, "📥 Baixando vídeo do Instagram, aguarde...");

                // Chama a API do Instagram com tratamento robusto de erro
                let result;
                try {
                    result = await igdl(url);
                } catch (error) {
                    await reagirMensagem(sock, message, "❌");

                    if (error.message === 'TIMEOUT') {
                        await reply(sock, from, "⏱️ Timeout na API do Instagram. A API está lenta, tente novamente em alguns minutos.");
                    } else if (error.message === 'RATE_LIMITED') {
                        await reply(sock, from, "🚫 Muitas tentativas na API. Aguarde alguns minutos antes de tentar novamente.");
                    } else if (error.message === 'SERVER_ERROR') {
                        await reply(sock, from, "🔧 API do Instagram temporariamente indisponível. Tente novamente mais tarde.");
                    } else {
                        await reply(sock, from, "❌ Erro ao conectar com a API do Instagram. Verifique o link e tente novamente.");
                    }
                    break;
                }

                console.log(`📥 Resposta API Instagram:`, JSON.stringify(result, null, 2));

                if (!result.success || !result.result || !result.result.downloadUrl || result.result.downloadUrl.length === 0) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Não foi possível baixar este vídeo. Verifique se o link está correto e se o post é público.");
                    break;
                }

                const metadata = result.result.metadata;
                const downloadUrl = result.result.downloadUrl[0];

                // Baixa o vídeo/imagem usando axios
                const mediaResponse = await axios({
                    method: 'GET',
                    url: downloadUrl,
                    responseType: 'arraybuffer',
                    timeout: 60000
                });

                const mediaBuffer = Buffer.from(mediaResponse.data);

                // Prepara a caption com informações do post
                let caption = "📹 *Instagram Download*\n\n";
                if (metadata.username) caption += `👤 @${metadata.username}\n`;
                if (metadata.like) caption += `❤️ ${metadata.like} curtidas\n`;
                if (metadata.comment) caption += `💬 ${metadata.comment} comentários\n`;
                if (metadata.caption) {
                    const captionText = metadata.caption.length > 200 ? metadata.caption.substring(0, 197) + '...' : metadata.caption;
                    caption += `\n📝 ${captionText}\n`;
                }
                caption += `\n© NEEXT LTDA`;

                // Envia vídeo ou imagem conforme o tipo
                if (metadata.isVideo) {
                    await sock.sendMessage(from, {
                        video: mediaBuffer,
                        caption: caption,
                        contextInfo: {
                            externalAdReply: {
                                title: "© NEEXT LTDA - Instagram Downloader",
                                body: `📱 @${metadata.username || 'Instagram'}`,
                                thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 1,
                                sourceUrl: "https://www.neext.online"
                            }
                        }
                    });
                } else {
                    await sock.sendMessage(from, {
                        image: mediaBuffer,
                        caption: caption,
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 100000,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            },
                            externalAdReply: {
                                title: "© NEEXT LTDA - Instagram Downloader",
                                body: `📱 @${metadata.username || 'Instagram'}`,
                                thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 1,
                                sourceUrl: "https://www.neext.online",
                                showAdAttribution: true
                            }
                        }
                    });
                }

                await reagirMensagem(sock, message, "✅");

            } catch (error) {
                console.error("❌ Erro no comando Instagram:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao baixar vídeo do Instagram. Tente novamente mais tarde.");
            }
        }
        break;

        case "facebook":
        case "fb": {
            try {
                if (!args[0]) {
                    await reply(sock, from, "❌ Por favor, forneça um link do Facebook.\n\nExemplo: `.fb https://www.facebook.com/share/r/xxxxx`");
                    break;
                }

                const url = args[0];

                if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                    await reply(sock, from, "❌ Link inválido! Use um link do Facebook.");
                    break;
                }

                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, "📥 Baixando vídeo do Facebook, aguarde...");

                try {
                    const apiUrl = `https://www.api.neext.online/facebook?url=${encodeURIComponent(url)}`;
                    const response = await axios.get(apiUrl, {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (!response.data || !response.data.result) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Não foi possível baixar este vídeo. Verifique se o link está correto e se o post é público.");
                        break;
                    }

                    const result = response.data.result;
                    const videoUrl = result.hd || result.sd;

                    if (!videoUrl) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Vídeo não encontrado neste post.");
                        break;
                    }

                    const videoResponse = await axios({
                        method: 'GET',
                        url: videoUrl,
                        responseType: 'arraybuffer',
                        timeout: 60000
                    });

                    const videoBuffer = Buffer.from(videoResponse.data);

                    const caption = "📹 *Vídeo do Facebook baixado com sucesso!*\n\n© NEEXT LTDA";

                    await sock.sendMessage(from, {
                        video: videoBuffer,
                        caption: caption,
                        contextInfo: {
                            externalAdReply: {
                                title: "© NEEXT LTDA - Facebook Downloader",
                                body: "📱 Instagram: @neet.tk",
                                thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 1,
                                sourceUrl: "https://www.neext.online"
                            }
                        }
                    });

                    await reagirMensagem(sock, message, "✅");

                } catch (apiError) {
                    await reagirMensagem(sock, message, "❌");
                    
                    if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
                        await reply(sock, from, "⏱️ Timeout ao processar vídeo. O vídeo pode ser muito grande, tente novamente.");
                    } else if (apiError.response?.status === 429) {
                        await reply(sock, from, "🚫 Muitas tentativas na API. Aguarde alguns minutos antes de tentar novamente.");
                    } else if (apiError.response?.status >= 500) {
                        await reply(sock, from, "🔧 API do Facebook temporariamente indisponível. Tente novamente mais tarde.");
                    } else {
                        await reply(sock, from, "❌ Erro ao conectar com a API do Facebook. Verifique o link e tente novamente.");
                    }
                    break;
                }

            } catch (error) {
                console.error("❌ Erro no comando Facebook:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao baixar vídeo do Facebook. Tente novamente mais tarde.");
            }
        }
        break;

        case "twitter":
        case "tw": {
            try {
                if (!args[0]) {
                    await reply(sock, from, "❌ Por favor, forneça um link do Twitter.\n\nExemplo: `.tw https://twitter.com/xxxxx`");
                    break;
                }

                const url = args[0];

                if (!url.includes('twitter.com') && !url.includes('x.com')) {
                    await reply(sock, from, "❌ Link inválido! Use um link do Twitter/X.");
                    break;
                }

                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, "📥 Baixando vídeo do Twitter, aguarde...");

                try {
                    const apiUrl = `https://nayan-video-downloader.vercel.app/twitterdown?url=${encodeURIComponent(url)}`;
                    const response = await axios.get(apiUrl, {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (!response.data || !response.data.status || !response.data.data) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Não foi possível baixar este vídeo. Verifique se o link está correto.");
                        break;
                    }

                    const result = response.data.data;
                    const videoUrl = result.HD || result.SD;
                    const thumbnail = result.thumbnail;

                    if (!videoUrl) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Vídeo não encontrado neste post.");
                        break;
                    }

                    const videoResponse = await axios({
                        method: 'GET',
                        url: videoUrl,
                        responseType: 'arraybuffer',
                        timeout: 60000
                    });

                    const videoBuffer = Buffer.from(videoResponse.data);

                    let thumbnailBuffer = null;
                    if (thumbnail) {
                        try {
                            const thumbnailResponse = await axios({
                                method: 'GET',
                                url: thumbnail,
                                responseType: 'arraybuffer'
                            });
                            thumbnailBuffer = Buffer.from(thumbnailResponse.data);
                        } catch (err) {
                            console.log("❌ Erro ao baixar thumbnail:", err.message);
                        }
                    }

                    const caption = "📹 *Vídeo do Twitter baixado com sucesso!*\n\n© NEEXT LTDA";

                    await sock.sendMessage(from, {
                        video: videoBuffer,
                        caption: caption,
                        jpegThumbnail: thumbnailBuffer,
                        contextInfo: {
                            externalAdReply: {
                                title: "© NEEXT LTDA - Twitter Downloader",
                                body: "📱 Instagram: @neet.tk",
                                thumbnailUrl: thumbnail || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 1,
                                sourceUrl: "https://www.neext.online"
                            }
                        }
                    });

                    await reagirMensagem(sock, message, "✅");

                } catch (apiError) {
                    await reagirMensagem(sock, message, "❌");
                    
                    if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
                        await reply(sock, from, "⏱️ Timeout ao processar vídeo. O vídeo pode ser muito grande, tente novamente.");
                    } else if (apiError.response?.status === 429) {
                        await reply(sock, from, "🚫 Muitas tentativas na API. Aguarde alguns minutos antes de tentar novamente.");
                    } else if (apiError.response?.status >= 500) {
                        await reply(sock, from, "🔧 API do Twitter temporariamente indisponível. Tente novamente mais tarde.");
                    } else {
                        await reply(sock, from, "❌ Erro ao conectar com a API do Twitter. Verifique o link e tente novamente.");
                    }
                    break;
                }

            } catch (error) {
                console.error("❌ Erro no comando Twitter:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao baixar vídeo do Twitter. Tente novamente mais tarde.");
            }
        }
        break;

        case "spotifysearch": {
            try {
                if (!args[0]) {
                    await reply(sock, from, "❌ Por favor, forneça o nome da música ou artista.\n\nExemplo: `.spotifysearch Kamaitachi`");
                    break;
                }

                const query = args.join(' ');

                await reagirMensagem(sock, message, "🔍");
                await reply(sock, from, "🔍 Pesquisando no Spotify, aguarde...");

                try {
                    const apiUrl = `https://api.ypnk.dpdns.org/api/search/spotify?q=${encodeURIComponent(query)}`;
                    const response = await axios.get(apiUrl, {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (!response.data || !response.data.status || !response.data.data || response.data.data.length === 0) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Nenhum resultado encontrado para esta pesquisa.");
                        break;
                    }

                    const firstResult = response.data.data[0];

                    const resultMessage = `🎵 *Resultado no Spotify*\n\n` +
                        `📌 *Música:* ${firstResult.title}\n` +
                        `🎤 *Artista:* ${firstResult.artist}\n` +
                        `💿 *Álbum:* ${firstResult.album}\n` +
                        `⏱️ *Duração:* ${firstResult.duration}\n` +
                        `🔗 *Link:* ${firstResult.url}`;

                    await sock.sendMessage(from, {
                        text: resultMessage,
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 100000,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363289739581116@newsletter",
                                newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                            },
                            externalAdReply: {
                                title: "© NEEXT LTDA - Spotify Search",
                                body: "📱 Instagram: @neet.tk",
                                thumbnailUrl: firstResult.thumbnail || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 1,
                                sourceUrl: "https://www.neext.online",
                                showAdAttribution: true
                            }
                        }
                    });

                    await reagirMensagem(sock, message, "✅");

                } catch (apiError) {
                    await reagirMensagem(sock, message, "❌");
                    console.error("❌ Erro na API Spotify Search:", apiError);
                    await reply(sock, from, "❌ Erro ao pesquisar no Spotify. Tente novamente mais tarde.");
                    break;
                }

            } catch (error) {
                console.error("❌ Erro no comando Spotify Search:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao pesquisar música. Tente novamente mais tarde.");
            }
        }
        break;

        case "playspotify": {
            try {
                if (!args[0]) {
                    await reply(sock, from, "❌ Por favor, forneça o nome da música.\n\nExemplo: `.playspotify Kamaitachi`");
                    break;
                }

                const query = args.join(' ');
                console.log(`🔍 [PLAY] Buscando música: "${query}"`);

                await reagirMensagem(sock, message, "🔍");
                await reply(sock, from, "🎵 Buscando e baixando música, aguarde...");

                try {
                    const searchUrl = `https://api.ypnk.dpdns.org/api/search/spotify?q=${encodeURIComponent(query)}`;
                    console.log(`🔍 [PLAY] URL de busca: ${searchUrl}`);
                    
                    const searchResponse = await axios.get(searchUrl, {
                        timeout: 40000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    console.log(`🔍 [PLAY] Resposta da busca recebida:`, {
                        status: searchResponse.data?.status,
                        resultCount: searchResponse.data?.data?.length || 0
                    });

                    if (!searchResponse.data || !searchResponse.data.status || !searchResponse.data.data || searchResponse.data.data.length === 0) {
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Nenhuma música encontrada com esse nome.");
                        break;
                    }

                    const firstResult = searchResponse.data.data[0];
                    const spotifyLink = firstResult.url;
                    console.log(`✅ [PLAY] Música encontrada: "${firstResult.title}" - ${firstResult.artist}`);
                    console.log(`🔗 [PLAY] Link Spotify: ${spotifyLink}`);

                    await reply(sock, from, `🎵 Encontrado: *${firstResult.title}* - ${firstResult.artist}\n📥 Baixando...`);

                    const apiUrl = `https://api.nekolabs.web.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyLink)}`;
                    console.log(`📥 [PLAY] Chamando API Nekolabs de download: ${apiUrl}`);
                    
                    const response = await axios.get(apiUrl, {
                        timeout: 90000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    console.log(`📥 [PLAY] Resposta da API Nekolabs:`, JSON.stringify(response.data, null, 2));

                    if (!response.data || !response.data.success || !response.data.result) {
                        console.error("❌ [PLAY] API Nekolabs retornou erro:", response.data);
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Não foi possível processar esta música. API retornou erro.");
                        break;
                    }

                    const result = response.data.result;
                    const downloadUrl = result.downloadUrl;
                    
                    if (!downloadUrl) {
                        console.error("❌ [PLAY] Link de download não encontrado:", result);
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Link de download não encontrado para esta música.");
                        break;
                    }

                    console.log(`📥 [PLAY] Baixando áudio de: ${downloadUrl}`);
                    const audioResponse = await axios({
                        method: 'GET',
                        url: downloadUrl,
                        responseType: 'arraybuffer',
                        timeout: 120000,
                        maxContentLength: 50 * 1024 * 1024,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const audioBuffer = Buffer.from(audioResponse.data);
                    console.log(`✅ [PLAY] Áudio baixado com sucesso! Tamanho: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

                    if (audioBuffer.length < 1000) {
                        console.error("❌ [PLAY] Áudio muito pequeno, pode estar corrompido");
                        await reagirMensagem(sock, message, "❌");
                        await reply(sock, from, "❌ Arquivo de áudio inválido ou corrompido.");
                        break;
                    }

                    let thumbnailBuffer = null;
                    if (result.cover) {
                        try {
                            console.log(`📸 [PLAY] Baixando capa de: ${result.cover}`);
                            const thumbnailResponse = await axios({
                                method: 'GET',
                                url: result.cover,
                                responseType: 'arraybuffer',
                                timeout: 10000
                            });
                            thumbnailBuffer = Buffer.from(thumbnailResponse.data);
                            console.log(`✅ [PLAY] Capa baixada! Tamanho: ${(thumbnailBuffer.length / 1024).toFixed(2)} KB`);
                        } catch (err) {
                            console.log("⚠️ [PLAY] Erro ao baixar capa (continuando sem capa):", err.message);
                        }
                    }

                    const songName = result.title || firstResult.title;
                    const artistName = result.artist || firstResult.artist;

                    console.log(`📤 [PLAY] Enviando áudio para WhatsApp...`);
                    await sock.sendMessage(from, {
                        audio: audioBuffer,
                        mimetype: 'audio/mp4',
                        fileName: `${songName} - ${artistName}.mp3`,
                        jpegThumbnail: thumbnailBuffer,
                        contextInfo: {
                            externalAdReply: {
                                title: `🎵 ${songName}`,
                                body: `🎤 ${artistName} • ⏱️ ${result.duration}`,
                                thumbnailUrl: result.cover || firstResult.thumbnail || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                mediaType: 2,
                                sourceUrl: spotifyLink
                            }
                        }
                    });

                    console.log(`✅ [PLAY] Áudio enviado com sucesso!`);
                    await reagirMensagem(sock, message, "✅");

                } catch (apiError) {
                    await reagirMensagem(sock, message, "❌");
                    console.error("❌ [PLAY] Erro detalhado:", {
                        message: apiError.message,
                        code: apiError.code,
                        response: apiError.response?.data,
                        status: apiError.response?.status
                    });
                    
                    if (apiError.code === 'ECONNABORTED' || apiError.code === 'ETIMEDOUT') {
                        await reply(sock, from, "⏱️ Timeout ao processar música. A API demorou muito para responder. Tente novamente.");
                    } else if (apiError.response?.status === 404) {
                        await reply(sock, from, "❌ API não encontrou esta música. Tente com outro nome.");
                    } else if (apiError.response?.status >= 500) {
                        await reply(sock, from, "❌ API do Spotify está fora do ar. Tente novamente mais tarde.");
                    } else {
                        await reply(sock, from, `❌ Erro ao baixar música: ${apiError.message || 'Desconhecido'}. Tente novamente.`);
                    }
                    break;
                }

            } catch (error) {
                console.error("❌ [PLAY] Erro geral no comando:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao baixar música. Tente novamente mais tarde.");
            }
        }
        break;

        case "play": {
            try {
                // Verifica se foi fornecido um termo de busca
                if (!args.length) {
                    await reply(sock, from, `❌ Por favor, forneça o nome da música.\n\nExemplo: \`${config.prefix}play 7 minutos naruto\``);
                    break;
                }

                const query = args.join(' ');

                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, `🎵 Buscando "${query}" no YouTube, aguarde...`);

                // Chama a API do YouTube com timeout maior
                const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl, {
                    timeout: 60000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.data || response.data.status === false || !response.data.result) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Não foi possível encontrar esta música. Tente outro termo de busca.");
                    break;
                }

                const result = response.data.result;
                const metadata = result.metadata;
                const downloadUrl = result.downloadUrl;

                if (!downloadUrl) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Link de download não encontrado para esta música.");
                    break;
                }

                // Baixa o áudio
                const audioResponse = await axios({
                    method: 'GET',
                    url: downloadUrl,
                    responseType: 'arraybuffer',
                    timeout: 120000
                });

                const audioBuffer = Buffer.from(audioResponse.data);

                // Baixa a thumbnail se existir
                let thumbnailBuffer = null;
                if (metadata.cover) {
                    try {
                        const thumbnailResponse = await axios({
                            method: 'GET',
                            url: metadata.cover,
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        thumbnailBuffer = Buffer.from(thumbnailResponse.data);
                    } catch (err) {
                        console.log("❌ Erro ao baixar thumbnail:", err.message);
                    }
                }

                // Prepara a caption com informações da música
                const caption = `🎵 *Música encontrada!*

📝 **Título:** ${metadata.title}
👤 **Canal:** ${metadata.channel}
⏱️ **Duração:** ${metadata.duration}
🔗 **URL:** ${metadata.url}

🎧 **Enviado com selinho2**
© NEEXT LTDA`;

                // Envia o áudio com thumbnail e informações usando o selinho2
                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mp4',
                    fileName: `${metadata.title}.mp3`,
                    caption: caption,
                    jpegThumbnail: thumbnailBuffer,
                    contextInfo: {
                        externalAdReply: {
                            title: `🎵 ${metadata.title}`,
                            body: `🎬 ${metadata.channel} • ⏱️ ${metadata.duration}`,
                            thumbnailUrl: metadata.cover || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                            mediaType: 2,
                            sourceUrl: metadata.url
                        }
                    }
                });

                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Música enviada: ${metadata.title} - ${metadata.channel}`);

            } catch (error) {
                console.error("❌ Erro no comando play:", error);
                await reagirMensagem(sock, message, "❌");

                if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                    await reply(sock, from, "❌ Erro de conexão. Verifique sua internet e tente novamente.");
                } else if (error.response?.status === 404) {
                    await reply(sock, from, "❌ Música não encontrada. Tente um termo de busca diferente.");
                } else {
                    await reply(sock, from, "❌ Erro ao baixar música. Tente novamente mais tarde.");
                }
            }
        }
        break;

        case "spotify": {
            // Verifica se foi fornecido um link do Spotify
            if (!args.length) {
                const configBot = obterConfiguracoes();
                await reply(sock, from, `❌ Por favor, forneça o link do Spotify.\n\nExemplo: \`${configBot.prefix}spotify https://open.spotify.com/track/4MhTFsyqIJnjsOweVcU8ug\``);
                break;
            }

            const spotifyUrl = args[0];

            // Verifica se é um link válido do Spotify
            if (!spotifyUrl.includes('open.spotify.com')) {
                await reply(sock, from, "❌ Por favor, forneça um link válido do Spotify.");
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, `🎵 Baixando música do Spotify, aguarde...`);

                // Chama a API do Spotify
                const apiUrl = `https://api.nekolabs.web.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`;
                const response = await axios.get(apiUrl, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.data || !response.data.success || !response.data.result) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Não foi possível baixar esta música do Spotify. Verifique o link.");
                    break;
                }

                const result = response.data.result;
                
                if (!result.downloadUrl) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Link de download não encontrado para esta música.");
                    break;
                }

                // Baixa o áudio
                const audioResponse = await axios({
                    method: 'GET',
                    url: result.downloadUrl,
                    responseType: 'arraybuffer',
                    timeout: 60000
                });

                const audioBuffer = Buffer.from(audioResponse.data);

                // Baixa a capa se existir
                let thumbnailBuffer = null;
                if (result.cover) {
                    try {
                        const thumbnailResponse = await axios({
                            method: 'GET',
                            url: result.cover,
                            responseType: 'arraybuffer',
                            timeout: 10000
                        });
                        thumbnailBuffer = Buffer.from(thumbnailResponse.data);
                    } catch (err) {
                        console.log("❌ Erro ao baixar capa do Spotify:", err.message);
                    }
                }

                // Prepara a caption com informações da música
                const caption = `🎵 *Música do Spotify baixada!*

📝 **Título:** ${result.title}
👤 **Artista:** ${result.artist}
⏱️ **Duração:** ${result.duration}

🎧 **Enviado com selinho2**
© NEEXT LTDA`;

                // Envia o áudio com capa e informações usando o selinho2
                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mp4',
                    fileName: `${result.title} - ${result.artist}.mp3`,
                    caption: caption,
                    jpegThumbnail: thumbnailBuffer,
                    contextInfo: {
                        externalAdReply: {
                            title: `🎵 ${result.title}`,
                            body: `🎤 ${result.artist} • ⏱️ ${result.duration}`,
                            thumbnailUrl: result.cover || "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                            mediaType: 2,
                            sourceUrl: spotifyUrl
                        }
                    }
                });

                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Música Spotify enviada: ${result.title} - ${result.artist}`);

            } catch (error) {
                console.error("❌ Erro no comando spotify:", error);
                await reagirMensagem(sock, message, "❌");

                if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                    await reply(sock, from, "❌ Erro de conexão. Verifique sua internet e tente novamente.");
                } else if (error.response?.status === 404) {
                    await reply(sock, from, "❌ Música não encontrada no Spotify. Verifique o link.");
                } else {
                    await reply(sock, from, "❌ Erro ao baixar música do Spotify. Tente novamente mais tarde.");
                }
            }
        }
        break;

        // Comandos do dono: antipv e anticall
        case "antipv": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode configurar o ANTIPV!");
                break;
            }

            const acao = args[0]?.toLowerCase();

            // Limpa o cache e carrega configuração atual global
            delete require.cache[require.resolve('./settings/settings.json')];
            const config = require('./settings/settings.json');
            const estadoAtual = config.antipv || false;

            if (acao === "on" || acao === "ativar" || acao === "1") {
                if (estadoAtual) {
                    await reagirMensagem(sock, message, "⚠️");
                    await reply(sock, from, `⚠️ *🚫 ANTIPV JÁ ESTÁ ATIVO!*\n\n✅ PVs de não-donos já estão sendo bloqueados\n🛡️ Apenas você pode falar comigo no privado`);
                } else {
                    // Ativar antipv
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const settingsPath = path.join(__dirname, 'settings/settings.json');
                        config.antipv = true;
                        fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
                        
                        // Limpa o cache para próxima leitura
                        delete require.cache[require.resolve('./settings/settings.json')];
                        
                        await reagirMensagem(sock, message, "✅");
                        await reply(sock, from, `✅ *🚫 ANTIPV ATIVADO*\n\n🛡️ Apenas você pode falar comigo no privado\n🚫 PVs de outros usuários serão ignorados\n⚔️ Proteção máxima ativada!`);
                    } catch (error) {
                        await reply(sock, from, `❌ Erro ao ativar ANTIPV`);
                    }
                }
            }
            else if (acao === "off" || acao === "desativar" || acao === "0") {
                if (!estadoAtual) {
                    await reagirMensagem(sock, message, "⚠️");
                    await reply(sock, from, `⚠️ *🚫 ANTIPV JÁ ESTÁ DESATIVADO!*\n\n✅ Qualquer pessoa pode falar comigo no privado\n💬 PVs estão liberados para todos`);
                } else {
                    // Desativar antipv
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const settingsPath = path.join(__dirname, 'settings/settings.json');
                        config.antipv = false;
                        fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
                        
                        // Limpa o cache para próxima leitura
                        delete require.cache[require.resolve('./settings/settings.json')];
                        
                        await reagirMensagem(sock, message, "✅");
                        await reply(sock, from, `✅ *💬 ANTIPV DESATIVADO*\n\n💬 Qualquer pessoa pode falar comigo no privado\n🔓 PVs liberados para todos os usuários\n📱 Conversas privadas habilitadas!`);
                    } catch (error) {
                        await reply(sock, from, `❌ Erro ao desativar ANTIPV`);
                    }
                }
            } else {
                const config = obterConfiguracoes();
                const status = estadoAtual ? "✅ ATIVO" : "❌ DESATIVADO";
                await reply(sock, from, 
                    `🚫 *STATUS DO ANTIPV*\n\n` +
                    `📊 Status atual: ${status}\n\n` +
                    `📱 **Como usar:**\n` +
                    `• ${config.prefix}antipv on - Ativar\n` +
                    `• ${config.prefix}antipv off - Desativar\n\n` +
                    `🛡️ **Quando ativo:** Apenas o dono pode usar PV\n` +
                    `💬 **Quando inativo:** Qualquer pessoa pode usar PV`
                );
            }
        }
        break;

        case "anticall": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode configurar o ANTICALL!");
                break;
            }

            const acao = args[0]?.toLowerCase();

            // Carrega configuração atual global
            const config = require('./settings/settings.json');
            const estadoAtual = config.anticall || false;

            if (acao === "on" || acao === "ativar" || acao === "1") {
                if (estadoAtual) {
                    await reagirMensagem(sock, message, "⚠️");
                    await reply(sock, from, `⚠️ *📞 ANTICALL JÁ ESTÁ ATIVO!*\n\n✅ Chamadas já estão sendo rejeitadas automaticamente\n🛡️ Bot protegido contra chamadas indesejadas`);
                } else {
                    // Ativar anticall
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const settingsPath = path.join(__dirname, 'settings/settings.json');
                        config.anticall = true;
                        fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
                        
                        await reagirMensagem(sock, message, "✅");
                        await reply(sock, from, `✅ *📞 ANTICALL ATIVADO*\n\n🛡️ Todas as chamadas serão rejeitadas automaticamente\n🚫 Bot protegido contra ligações\n⚔️ Defesa máxima ativada!`);
                    } catch (error) {
                        await reply(sock, from, `❌ Erro ao ativar ANTICALL`);
                    }
                }
            }
            else if (acao === "off" || acao === "desativar" || acao === "0") {
                if (!estadoAtual) {
                    await reagirMensagem(sock, message, "⚠️");
                    await reply(sock, from, `⚠️ *📞 ANTICALL JÁ ESTÁ DESATIVADO!*\n\n✅ Chamadas estão sendo aceitas normalmente\n📞 Bot pode receber ligações`);
                } else {
                    // Desativar anticall
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const settingsPath = path.join(__dirname, 'settings/settings.json');
                        config.anticall = false;
                        fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
                        
                        await reagirMensagem(sock, message, "✅");
                        await reply(sock, from, `✅ *📞 ANTICALL DESATIVADO*\n\n📞 Chamadas estão sendo aceitas normalmente\n🔓 Bot pode receber ligações\n✨ Função de chamadas habilitada!`);
                    } catch (error) {
                        await reply(sock, from, `❌ Erro ao desativar ANTICALL`);
                    }
                }
            } else {
                const config = obterConfiguracoes();
                const status = estadoAtual ? "✅ ATIVO" : "❌ DESATIVADO";
                await reply(sock, from, 
                    `📞 *STATUS DO ANTICALL*\n\n` +
                    `📊 Status atual: ${status}\n\n` +
                    `📱 **Como usar:**\n` +
                    `• ${config.prefix}anticall on - Ativar\n` +
                    `• ${config.prefix}anticall off - Desativar\n\n` +
                    `🛡️ **Quando ativo:** Todas as chamadas são rejeitadas\n` +
                    `📞 **Quando inativo:** Chamadas são aceitas normalmente`
                );
            }
        }
        break;

        case "reiniciar": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode reiniciar o bot!");
                break;
            }

            await reagirMensagem(sock, message, "🔄");
            await reply(sock, from, "🔄 *REINICIANDO BOT...*\n\n⏳ Aguarde alguns segundos\n🤖 O bot voltará em breve!");
            
            console.log("🔄 Bot reiniciando por comando do dono...");
            
            // Aguarda 2 segundos e reinicia o processo
            setTimeout(() => {
                process.exit(0);
            }, 2000);
        }
        break;

        case "menu": {
            try {
                // console.log("🔧 Processando comando menu...");
                
                // Reação de carregando
                await reagirMensagem(sock, message, "⏳");

                // Importa menus organizados
                const menus = require('./menus/menu.js');
                const sender = message.key.participant || from;
                const pushName = message.pushName || "Usuário";
                
                // console.log("🔧 Obtendo menu principal...");
                const menuText = await menus.obterMenuPrincipal(sock, from, sender, pushName);

                // Obter saudação com emoji e total de comandos
                const { obterSaudacao, contarComandos } = require('./arquivos/funcoes/function.js');
                const totalComandos = contarComandos();

                // Caption apenas com o menu (sem duplicar saudação)
                const captionCompleto = menuText;

                // console.log("🔧 Enviando menu...");
                
                // Envia arquivo PPTX de 100TB igual grupo-status - DOCUMENTO REAL
                await sock.sendMessage(from, {
                    document: Buffer.from("neext_menu_pptx_content", "utf8"),
                    fileName: "o melhor tem nome.pptx",
                    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    fileLength: 109951162777600, // 100TB em bytes (fake)
                    pageCount: 999,
                    caption: captionCompleto,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 100000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363289739581116@newsletter",
                            newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                        },
                        externalAdReply: {
                            title: obterSaudacao(),
                            body: `${totalComandos} comandos`,
                            thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                            mediaType: 1,
                            sourceUrl: "https://www.neext.online"
                        },
                        quotedMessage: quotedSerasaAPK.message
                    }
                }, { quoted: selinho });

                // console.log("✅ Menu enviado com sucesso!");
                
                // Reação de sucesso após enviar o menu
                await reagirMensagem(sock, message, "🐦‍🔥");
            } catch (err) {
                console.error("❌ ERRO ao enviar menu:", err);
                await reply(sock, from, "❌ Erro ao enviar menu. Tente novamente.");
            }
        }
        break;

        case "teste": {
            console.log("🧪 TESTE: Enviando mensagem simples...");
            console.log("🧪 TESTE: from =", from);
            console.log("🧪 TESTE: sock.user =", sock.user);
            
            try {
                const resultado = await sock.sendMessage(from, { text: "🧪 Teste de mensagem simples!" });
                console.log("🧪 TESTE: Resultado do envio =", resultado);
            } catch (err) {
                console.error("🧪 TESTE: ERRO =", err);
            }
        }
        break;

        case "menuadmin": {
            const menus = require('./menus/menu.js');
            await reply(sock, from, menus.obterMenuAdmin());
        }
        break;

        case "menuadm": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuAdm()
            }, { quoted: message });
        }
        break;

        case "menudono": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuDono()
            }, { quoted: message });
        }
        break;

        case "menudownload": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuDownload()
            }, { quoted: message });
        }
        break;

        case "menugamer": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuGamer()
            }, { quoted: message });
        }
        break;

        case "menulogos": {
            const menulogos = require('./menus/menulogos.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                text: menulogos.gerarMenuLogos(config.prefix, config.nomeDoBot)
            }, { quoted: message });
        }
        break;

        case "menusticker": {
            const menus = require('./menus/menu.js');
            await reply(sock, from, menus.obterMenuSticker());
        }
        break;

        case "menufigurinhas": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuFigurinhas()
            }, { quoted: message });
        }
        break;

        case "menurpg": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuRPG()
            }, { quoted: message });
        }
        break;

        case "menubrincadeira": {
            const menus = require('./menus/menu.js');
            await sock.sendMessage(from, {
                text: menus.obterMenuBrincadeira()
            }, { quoted: message });
        }
        break;

        case "menuhentai": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuHentai()
            }, { quoted: message });
        }
        break;

        case "menurandom": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuRandom()
            }, { quoted: message });
        }
        break;

        case "menualteradores": {
            const menus = require('./menus/menu.js');
            const config = obterConfiguracoes();
            await sock.sendMessage(from, {
                image: { url: config.fotoDoBot },
                caption: menus.obterMenuAlteradores()
            }, { quoted: message });
        }
        break;

        // ============================================
        // COMANDOS DANBOORU - RANDOM IMAGES (89 comandos)
        // ============================================
        
        case "1girl": { await processarDanbooru(sock, from, message, "1girl", "1 Garota"); break; }
        case "1boy": { await processarDanbooru(sock, from, message, "1boy", "1 Garoto"); break; }
        case "2girls": { await processarDanbooru(sock, from, message, "2girls", "2 Garotas"); break; }
        case "animal": { await processarDanbooru(sock, from, message, "animal", "Animal"); break; }
        case "scenery": { await processarDanbooru(sock, from, message, "scenery", "Cenário"); break; }
        case "original": { await processarDanbooru(sock, from, message, "original", "Original"); break; }
        case "solo": { await processarDanbooru(sock, from, message, "solo", "Solo"); break; }
        case "group": { await processarDanbooru(sock, from, message, "group", "Grupo"); break; }
        case "female": { await processarDanbooru(sock, from, message, "female", "Feminino"); break; }
        case "male": { await processarDanbooru(sock, from, message, "male", "Masculino"); break; }
        case "long_hair": { await processarDanbooru(sock, from, message, "long_hair", "Cabelo Longo"); break; }
        case "short_hair": { await processarDanbooru(sock, from, message, "short_hair", "Cabelo Curto"); break; }
        case "smile": { await processarDanbooru(sock, from, message, "smile", "Sorriso"); break; }
        case "blush": { await processarDanbooru(sock, from, message, "blush", "Corado"); break; }
        case "happy": { await processarDanbooru(sock, from, message, "happy", "Feliz"); break; }
        case "sad": { await processarDanbooru(sock, from, message, "sad", "Triste"); break; }
        case "angry": { await processarDanbooru(sock, from, message, "angry", "Bravo"); break; }
        case "cosplay": { await processarDanbooru(sock, from, message, "cosplay", "Cosplay"); break; }
        case "uniform": { await processarDanbooru(sock, from, message, "uniform", "Uniforme"); break; }
        case "school_uniform": { await processarDanbooru(sock, from, message, "school_uniform", "Uniforme Escolar"); break; }
        case "maid": { await processarDanbooru(sock, from, message, "maid", "Empregada"); break; }
        case "nurse": { await processarDanbooru(sock, from, message, "nurse", "Enfermeira"); break; }
        case "witch": { await processarDanbooru(sock, from, message, "witch", "Bruxa"); break; }
        case "armor": { await processarDanbooru(sock, from, message, "armor", "Armadura"); break; }
        case "sword": { await processarDanbooru(sock, from, message, "sword", "Espada"); break; }
        case "gun": { await processarDanbooru(sock, from, message, "gun", "Arma"); break; }
        case "magic": { await processarDanbooru(sock, from, message, "magic", "Magia"); break; }
        case "fantasy": { await processarDanbooru(sock, from, message, "fantasy", "Fantasia"); break; }
        case "robot": { await processarDanbooru(sock, from, message, "robot", "Robô"); break; }
        case "cyberpunk": { await processarDanbooru(sock, from, message, "cyberpunk", "Cyberpunk"); break; }
        case "steampunk": { await processarDanbooru(sock, from, message, "steampunk", "Steampunk"); break; }
        case "vampire": { await processarDanbooru(sock, from, message, "vampire", "Vampiro"); break; }
        case "demon": { await processarDanbooru(sock, from, message, "demon", "Demônio"); break; }
        case "angel": { await processarDanbooru(sock, from, message, "angel", "Anjo"); break; }
        case "ghost": { await processarDanbooru(sock, from, message, "ghost", "Fantasma"); break; }
        case "halloween": { await processarDanbooru(sock, from, message, "halloween", "Halloween"); break; }
        case "christmas": { await processarDanbooru(sock, from, message, "christmas", "Natal"); break; }
        case "summer": { await processarDanbooru(sock, from, message, "summer", "Verão"); break; }
        case "beach": { await processarDanbooru(sock, from, message, "beach", "Praia"); break; }
        case "winter": { await processarDanbooru(sock, from, message, "winter", "Inverno"); break; }
        case "snow": { await processarDanbooru(sock, from, message, "snow", "Neve"); break; }
        case "autumn": { await processarDanbooru(sock, from, message, "autumn", "Outono"); break; }
        case "rain": { await processarDanbooru(sock, from, message, "rain", "Chuva"); break; }
        case "flower": { await processarDanbooru(sock, from, message, "flower", "Flor"); break; }
        case "tree": { await processarDanbooru(sock, from, message, "tree", "Árvore"); break; }
        case "forest": { await processarDanbooru(sock, from, message, "forest", "Floresta"); break; }
        case "mountain": { await processarDanbooru(sock, from, message, "mountain", "Montanha"); break; }
        case "city": { await processarDanbooru(sock, from, message, "city", "Cidade"); break; }
        case "building": { await processarDanbooru(sock, from, message, "building", "Prédio"); break; }
        case "street": { await processarDanbooru(sock, from, message, "street", "Rua"); break; }
        case "night": { await processarDanbooru(sock, from, message, "night", "Noite"); break; }
        case "sunset": { await processarDanbooru(sock, from, message, "sunset", "Pôr do Sol"); break; }
        case "sunrise": { await processarDanbooru(sock, from, message, "sunrise", "Nascer do Sol"); break; }
        case "clouds": { await processarDanbooru(sock, from, message, "clouds", "Nuvens"); break; }
        case "sky": { await processarDanbooru(sock, from, message, "sky", "Céu"); break; }
        case "moon": { await processarDanbooru(sock, from, message, "moon", "Lua"); break; }
        case "stars": { await processarDanbooru(sock, from, message, "stars", "Estrelas"); break; }
        case "river": { await processarDanbooru(sock, from, message, "river", "Rio"); break; }
        case "lake": { await processarDanbooru(sock, from, message, "lake", "Lago"); break; }
        case "ocean": { await processarDanbooru(sock, from, message, "ocean", "Oceano"); break; }
        case "train": { await processarDanbooru(sock, from, message, "train", "Trem"); break; }
        case "car": { await processarDanbooru(sock, from, message, "car", "Carro"); break; }
        case "bike": { await processarDanbooru(sock, from, message, "bike", "Bicicleta"); break; }
        case "school": { await processarDanbooru(sock, from, message, "school", "Escola"); break; }
        case "classroom": { await processarDanbooru(sock, from, message, "classroom", "Sala de Aula"); break; }
        case "library": { await processarDanbooru(sock, from, message, "library", "Biblioteca"); break; }
        case "room": { await processarDanbooru(sock, from, message, "room", "Quarto"); break; }
        case "bed": { await processarDanbooru(sock, from, message, "bed", "Cama"); break; }
        case "chair": { await processarDanbooru(sock, from, message, "chair", "Cadeira"); break; }
        case "table": { await processarDanbooru(sock, from, message, "table", "Mesa"); break; }
        case "food": { await processarDanbooru(sock, from, message, "food", "Comida"); break; }
        case "drink": { await processarDanbooru(sock, from, message, "drink", "Bebida"); break; }
        case "coffee": { await processarDanbooru(sock, from, message, "coffee", "Café"); break; }
        case "tea": { await processarDanbooru(sock, from, message, "tea", "Chá"); break; }
        case "cake": { await processarDanbooru(sock, from, message, "cake", "Bolo"); break; }
        case "chocolate": { await processarDanbooru(sock, from, message, "chocolate", "Chocolate"); break; }
        case "fruit": { await processarDanbooru(sock, from, message, "fruit", "Fruta"); break; }
        case "genshin_impact": { await processarDanbooru(sock, from, message, "genshin_impact", "Genshin Impact"); break; }
        case "naruto": { await processarDanbooru(sock, from, message, "naruto", "Naruto"); break; }
        case "one_piece": { await processarDanbooru(sock, from, message, "one_piece", "One Piece"); break; }
        case "attack_on_titan": { await processarDanbooru(sock, from, message, "attack_on_titan", "Attack on Titan"); break; }
        case "my_hero_academia": { await processarDanbooru(sock, from, message, "my_hero_academia", "My Hero Academia"); break; }
        case "demon_slayer": { await processarDanbooru(sock, from, message, "demon_slayer", "Demon Slayer"); break; }
        case "spy_x_family": { await processarDanbooru(sock, from, message, "spy_x_family", "Spy x Family"); break; }
        case "jojo": { await processarDanbooru(sock, from, message, "jojo", "JoJo"); break; }
        case "dragon_ball": { await processarDanbooru(sock, from, message, "dragon_ball", "Dragon Ball"); break; }
        case "bleach": { await processarDanbooru(sock, from, message, "bleach", "Bleach"); break; }
        case "tokyo_revengers": { await processarDanbooru(sock, from, message, "tokyo_revengers", "Tokyo Revengers"); break; }

        // ============================================
        // FIM DOS COMANDOS DANBOORU
        // ============================================

        // ============================================
        // COMANDOS DE ALTERADORES - EFEITOS DE VÍDEO E ÁUDIO
        // ============================================

        case "videolento": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const videoMsg = quotedMsg?.videoMessage || currentMsg?.videoMessage;
            if (!videoMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um vídeo para aplicar o efeito!' });
                break;
            }
            await videoLento(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "videorapido": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const videoMsg = quotedMsg?.videoMessage || currentMsg?.videoMessage;
            if (!videoMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um vídeo para aplicar o efeito!' });
                break;
            }
            await videoRapido(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "videocontrario": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const videoMsg = quotedMsg?.videoMessage || currentMsg?.videoMessage;
            if (!videoMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um vídeo para aplicar o efeito!' });
                break;
            }
            await videoContrario(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "audiolento": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await audioLento(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "audiorapido": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await audioRapido(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "grave": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await grave(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "grave2": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await grave2(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "esquilo": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await esquilo(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "estourar": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await estourar(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "bass": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await bass(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "bass2": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await bass2(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "vozmenino": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await vozMenino(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "vozrobo": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await vozRobo(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "vozradio": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await vozRadio(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "vozfantasma": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await vozFantasma(sock, from, quotedMsg || currentMsg);
        }
        break;

        case "vozdistorcida": {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const currentMsg = message.message;
            
            const audioMsg = quotedMsg?.audioMessage || quotedMsg?.videoMessage || currentMsg?.audioMessage || currentMsg?.videoMessage;
            if (!audioMsg) {
                await sock.sendMessage(from, { text: '❌ Envie ou marque um áudio/vídeo para aplicar o efeito!' });
                break;
            }
            await vozDistorcida(sock, from, quotedMsg || currentMsg);
        }
        break;

        // ============================================
        // FIM DOS COMANDOS DE ALTERADORES
        // ============================================

        case "menuanti": {
            const menus = require('./menus/menu.js');
            await reply(sock, from, menus.obterMenuAnti());
        }
        break;

        case "configurar-bot": {
            const menus = require('./menus/menu.js');
            await reply(sock, from, menus.obterConfigurarBot());
        }
        break;

        case "trocar-prefixo": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode alterar o prefixo do bot!");
                break;
            }

            const novoPrefixo = args.join(" ").trim();
            if (!novoPrefixo) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}trocar-prefixo [novo prefixo]\n\nExemplo: ${config.prefix}trocar-prefixo !`);
                break;
            }

            if (novoPrefixo.length > 3) {
                await reply(sock, from, "❌ O prefixo deve ter no máximo 3 caracteres!");
                break;
            }

            try {
                // Atualiza o arquivo settings.json
                const fs = require('fs');
                const path = require('path');
                const settingsPath = path.join(__dirname, 'settings/settings.json');
                const currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

                const prefixoAntigo = currentSettings.prefix;
                currentSettings.prefix = novoPrefixo;

                fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));

                // Atualiza configurações em memória também
                delete require.cache[require.resolve('./settings/settings.json')];
                const novasSettings = require('./settings/settings.json');
                Object.assign(settings, novasSettings);

                await reply(sock, from, `✅ *Prefixo alterado com sucesso!*\n\n🔄 **Antes:** ${prefixoAntigo}\n✅ **Agora:** ${novoPrefixo}\n\n✨ *Alteração aplicada instantaneamente!*`);

            } catch (error) {
                console.error("Erro ao alterar prefixo:", error);
                await reply(sock, from, "❌ Erro interno ao alterar prefixo. Tente novamente.");
            }
        }
        break;

        case "trocar-nome": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode alterar o nome do bot!");
                break;
            }

            const novoNome = args.join(" ").trim();
            if (!novoNome) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}trocar-nome [novo nome]\n\nExemplo: ${config.prefix}trocar-nome MeuBot Incrível`);
                break;
            }

            if (novoNome.length > 50) {
                await reply(sock, from, "❌ O nome deve ter no máximo 50 caracteres!");
                break;
            }

            try {
                // Atualiza o arquivo settings.json
                const fs = require('fs');
                const path = require('path');
                const settingsPath = path.join(__dirname, 'settings/settings.json');
                const currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

                const nomeAntigo = currentSettings.nomeDoBot;
                currentSettings.nomeDoBot = novoNome;

                fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));

                // Atualiza configurações em memória também
                delete require.cache[require.resolve('./settings/settings.json')];
                const novasSettings = require('./settings/settings.json');
                Object.assign(settings, novasSettings);

                await reply(sock, from, `✅ *Nome do bot alterado com sucesso!*\n\n🔄 **Antes:** ${nomeAntigo}\n✅ **Agora:** ${novoNome}\n\n✨ *Alteração aplicada instantaneamente!*`);

            } catch (error) {
                console.error("Erro ao alterar nome do bot:", error);
                await reply(sock, from, "❌ Erro interno ao alterar nome. Tente novamente.");
            }
        }
        break;

        case "trocar-nick": {
            const sender = message.key.participant || from;

            // Verifica se é o dono
            if (!isDono(sender)) {
                await reply(sock, from, "❌ Apenas o dono pode alterar seu próprio nick!");
                break;
            }

            const novoNick = args.join(" ").trim();
            if (!novoNick) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}trocar-nick [novo nick]\n\nExemplo: ${config.prefix}trocar-nick Administrador`);
                break;
            }

            if (novoNick.length > 30) {
                await reply(sock, from, "❌ O nick deve ter no máximo 30 caracteres!");
                break;
            }

            try {
                // Atualiza o arquivo settings.json
                const fs = require('fs');
                const path = require('path');
                const settingsPath = path.join(__dirname, 'settings/settings.json');
                const currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

                const nickAntigo = currentSettings.nickDoDono;
                currentSettings.nickDoDono = novoNick;

                fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));

                // Atualiza configurações em memória também
                delete require.cache[require.resolve('./settings/settings.json')];
                const novasSettings = require('./settings/settings.json');
                Object.assign(settings, novasSettings);

                await reply(sock, from, `✅ *Nick do dono alterado com sucesso!*\n\n🔄 **Antes:** ${nickAntigo}\n✅ **Agora:** ${novoNick}\n\n✨ *Alteração aplicada instantaneamente!*`);

            } catch (error) {
                console.error("Erro ao alterar nick do dono:", error);
                await reply(sock, from, "❌ Erro interno ao alterar nick. Tente novamente.");
            }
        }
        break;

        case "donos": {
            const config = obterConfiguracoes();
            const donosAdicionais = carregarDonosAdicionais();
            const numeroDono = config.numeroDono || "não configurado";
            
            let mensagem = `╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮  
│╭─━─━─━─━─━─━─━─
├╾❲ 🧸⃟➮𝑫𝑶𝑵𝑶 𝑶𝑭𝑪: wa.me/${numeroDono} 
│╰─━─━─━─━─━─━─━─
╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯

 『 𝐃𝐎𝐍𝐎𝐒 𝐃𝐎 𝐁𝐎𝐓 』↴   
          
╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮  
│╭─━─━─━─━─━─━─━─\n`;

            for (let i = 1; i <= 6; i++) {
                const dono = donosAdicionais[`dono${i}`];
                if (dono && dono.trim() !== "") {
                    mensagem += `│╞『${i}』- ${dono}\n│┊\n`;
                } else {
                    mensagem += `│╞『${i}』- Vazio\n│┊\n`;
                }
            }

            mensagem += `│╰─━─━─━─━─━─━─━─
╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯

⏤͟͟͞͞${config.nomeDoBot}💌⃟✧ ᭄
     ✰ ✰ ✰ ✰ ✰ ✰ `;

            await reply(sock, from, mensagem);
        }
        break;

        case "adddono":
        case "adicionardono": {
            const sender = message.key.participant || from;

            // Apenas o dono oficial pode adicionar outros donos
            if (!isDonoOficial(sender)) {
                await reply(sock, from, "❌ Apenas o dono oficial pode adicionar novos donos!");
                break;
            }

            // Verifica argumentos: slot e número
            if (args.length < 2) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}adddono [slot 1-6] [número]\n\nExemplo: ${config.prefix}adddono 1 5521999999999`);
                break;
            }

            const slot = parseInt(args[0]);
            const numero = args[1].replace(/[^0-9]/g, '');

            if (isNaN(slot) || slot < 1 || slot > 6) {
                await reply(sock, from, "❌ O slot deve ser um número entre 1 e 6!");
                break;
            }

            if (!numero || numero.length < 10) {
                await reply(sock, from, "❌ Número inválido! Use o formato: 5521999999999");
                break;
            }

            const donosAdicionais = carregarDonosAdicionais();
            donosAdicionais[`dono${slot}`] = numero;

            if (salvarDonosAdicionais(donosAdicionais)) {
                await reply(sock, from, `✅ *DONO ADICIONADO COM SUCESSO!*\n\n📍 **Slot:** ${slot}\n👤 **Número:** wa.me/${numero}\n\n💡 Agora @${numero} tem permissões de dono!`, [`${numero}@s.whatsapp.net`]);
            } else {
                await reply(sock, from, "❌ Erro ao adicionar dono. Tente novamente.");
            }
        }
        break;

        case "rmdono":
        case "removerdono": {
            const sender = message.key.participant || from;

            // Apenas o dono oficial pode remover outros donos
            if (!isDonoOficial(sender)) {
                await reply(sock, from, "❌ Apenas o dono oficial pode remover donos!");
                break;
            }

            // Verifica argumentos: slot
            if (args.length < 1) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use: ${config.prefix}rmdono [slot 1-6]\n\nExemplo: ${config.prefix}rmdono 1`);
                break;
            }

            const slot = parseInt(args[0]);

            if (isNaN(slot) || slot < 1 || slot > 6) {
                await reply(sock, from, "❌ O slot deve ser um número entre 1 e 6!");
                break;
            }

            const donosAdicionais = carregarDonosAdicionais();
            const numeroRemovido = donosAdicionais[`dono${slot}`];

            if (!numeroRemovido || numeroRemovido.trim() === "") {
                await reply(sock, from, `❌ O slot ${slot} já está vazio!`);
                break;
            }

            donosAdicionais[`dono${slot}`] = "";

            if (salvarDonosAdicionais(donosAdicionais)) {
                await reply(sock, from, `✅ *DONO REMOVIDO COM SUCESSO!*\n\n📍 **Slot:** ${slot}\n👤 **Número removido:** wa.me/${numeroRemovido}\n\n⚠️ @${numeroRemovido} não tem mais permissões de dono!`, [`${numeroRemovido}@s.whatsapp.net`]);
            } else {
                await reply(sock, from, "❌ Erro ao remover dono. Tente novamente.");
            }
        }
        break;

        // ================== SISTEMA RPG - NEEXTCITY ==================

        case "rpg": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem ativar/desativar o RPG.");
                break;
            }

            const action = args[0]?.toLowerCase();

            if (action === "on") {
                const resultado = rpg.ativarRPG(from, true);
                const configBot = obterConfiguracoes();
                const menu = rpg.getMenuRPG(configBot.prefix);
                await reply(sock, from, `${resultado.mensagem}\n\n${menu}`);
            } else if (action === "off") {
                const resultado = rpg.ativarRPG(from, false);
                await reply(sock, from, resultado.mensagem);
            } else {
                const isAtivo = rpg.isRPGAtivo(from);
                const configBot = obterConfiguracoes();
                const menu = rpg.getMenuRPG(configBot.prefix);
                await reply(sock, from, `🎮 *STATUS DO RPG*\n\n${isAtivo ? "✅ ATIVO" : "❌ INATIVO"}\n\n💡 *Uso:* \`${configBot.prefix}rpg on/off\`\n\n${menu}`);
            }
        }
        break;

        case "registrar": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            // Verifica se RPG está ativo
            if (!rpg.isRPGAtivo(from)) {
                const configBot = obterConfiguracoes();
                await reply(sock, from, "❌ O RPG não está ativo neste grupo. Um admin deve ativar com `" + configBot.prefix + "rpg on`");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            // Verifica se já está registrado
            if (rpg.isUsuarioRegistrado(userId)) {
                const resultado = rpg.getPerfil(userId);
                await reply(sock, from, `✅ *Você já está registrado!*\n\n${resultado.mensagem}`);
                break;
            }

            // Registra o usuário
            const resultado = rpg.registrar(userId, from);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "✅");
            }
        }
        break;

        case "pescar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.pescar(userId);
            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🎣");
            }
        }
        break;

        case "minerar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.minerar(userId);
            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "⛏️");
            }
        }
        break;

        case "trabalhar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.trabalhar(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "💼");
            }
        }
        break;

        case "tigrinho": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const aposta = parseInt(args[0]);
            if (!aposta || isNaN(aposta)) {
                await reply(sock, from, `🎰 **JOGO DO TIGRINHO** 🐅\n\n💡 **Como jogar:**\n\`${config.prefix}tigrinho [valor]\`\n\n📝 **Exemplo:**\n\`${config.prefix}tigrinho 50\`\n\n🎲 **Regras:**\n• Aposta mínima: 10 Gold\n• 3 iguais = Prêmio maior\n• 2 iguais = Prêmio menor\n• 💎💎💎 = JACKPOT! (10x)\n• 🐅🐅🐅 = Tigrinho! (5x)`);
                break;
            }

            const resultado = rpg.jogarTigrinho(userId, aposta);

            if (resultado.erro) {
                await reply(sock, from, `❌ ${resultado.erro}`);
                break;
            }

            await reply(sock, from, resultado.mensagem);

            if (resultado.ganhou) {
                await reagirMensagem(sock, message, "🎉");
            } else {
                await reagirMensagem(sock, message, "😢");
            }
        }
        break;

        case "assalto": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            // Verifica se marcou alguém
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentionedJid || mentionedJid.length === 0) {
                await reply(sock, from, `🔫 **SISTEMA DE ASSALTO**\n\n💡 **Como usar:**\nMarque a pessoa que deseja assaltar\n\n📝 **Exemplo:**\n\`${config.prefix}assalto @usuario\`\n\n⚠️ **Regras:**\n• Cooldown: 15 minutos\n• Chance de sucesso: 60%\n• Você rouba 20% do saldo da vítima\n• Se falhar, paga multa de 30 Gold`);
                break;
            }

            const targetId = mentionedJid[0].split('@')[0];
            const resultado = rpg.assaltar(userId, targetId);

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            await reply(sock, from, resultado.mensagem, mentionedJid);

            if (resultado.assalto) {
                await reagirMensagem(sock, message, "💰");
            } else {
                await reagirMensagem(sock, message, "🚨");
            }
        }
        break;

        case "xadrez": {
            const sender = message.key.participant || from;
            const config = obterConfiguracoes();
            
            if (!args[0]) {
                const ajuda = xadrez.mostrarAjuda(config.prefix);
                await reply(sock, from, ajuda.mensagem);
                break;
            }
            
            const subcomando = args[0].toLowerCase();
            
            if (subcomando === "ajuda" || subcomando === "help") {
                const ajuda = xadrez.mostrarAjuda(config.prefix);
                await reply(sock, from, ajuda.mensagem);
            } else if (subcomando === "jogada" || subcomando === "move") {
                const movimento = args.slice(1).join(" ");
                if (!movimento) {
                    await reply(sock, from, `❌ Digite a jogada!\n\n💡 Exemplo: \`${config.prefix}xadrez jogada e2e4\``);
                    break;
                }
                
                const resultado = xadrez.fazerJogada(from, sender, movimento);
                
                if (resultado.sucesso && resultado.imagem) {
                    try {
                        await sock.sendMessage(from, {
                            image: { url: resultado.imagem },
                            caption: resultado.mensagem,
                            mentions: resultado.mentions,
                            contextInfo: {
                                mentionedJid: resultado.mentions,
                                isForwarded: true,
                                forwardingScore: 100000,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.idDoCanal,
                                    newsletterName: "© NEEXT LTDA"
                                },
                                externalAdReply: {
                                    title: "♟️ Xadrez NEEXT",
                                    body: "Jogo de Xadrez no WhatsApp",
                                    thumbnailUrl: config.fotoDoBot,
                                    mediaType: 1,
                                    sourceUrl: "www.neext.online"
                                }
                            }
                        });
                        await reagirMensagem(sock, message, "♟️");
                    } catch (imgErr) {
                        console.log("⚠️ Erro ao carregar imagem do tabuleiro, enviando texto:", imgErr.message);
                        await reply(sock, from, resultado.mensagem + (resultado.tabuleiroTexto ? "\n\n" + resultado.tabuleiroTexto : ""), resultado.mentions);
                    }
                } else {
                    await reply(sock, from, resultado.mensagem, resultado.mentions);
                }
            } else if (subcomando === "status" || subcomando === "tabuleiro") {
                const resultado = xadrez.mostrarStatus(from);
                
                if (resultado.sucesso && resultado.imagem) {
                    try {
                        await sock.sendMessage(from, {
                            image: { url: resultado.imagem },
                            caption: resultado.mensagem,
                            mentions: resultado.mentions,
                            contextInfo: {
                                mentionedJid: resultado.mentions,
                                isForwarded: true,
                                forwardingScore: 100000,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.idDoCanal,
                                    newsletterName: "© NEEXT LTDA"
                                },
                                externalAdReply: {
                                    title: "♟️ Xadrez NEEXT",
                                    body: "Status da Partida",
                                    thumbnailUrl: config.fotoDoBot,
                                    mediaType: 1,
                                    sourceUrl: "www.neext.online"
                                }
                            }
                        });
                    } catch (imgErr) {
                        console.log("⚠️ Erro ao carregar imagem do tabuleiro, enviando texto:", imgErr.message);
                        await reply(sock, from, resultado.mensagem + (resultado.tabuleiroTexto ? "\n\n" + resultado.tabuleiroTexto : ""), resultado.mentions);
                    }
                } else {
                    await reply(sock, from, resultado.mensagem, resultado.mentions);
                }
            } else if (subcomando === "desistir" || subcomando === "quit") {
                const resultado = xadrez.desistir(from, sender);
                await reply(sock, from, resultado.mensagem, resultado.mentions);
                
                if (resultado.sucesso) {
                    await reagirMensagem(sock, message, "🏳️");
                }
            } else if (subcomando === "coordenadas" || subcomando === "coord") {
                const guia = xadrez.gerarGuiaCoordenadas();
                await reply(sock, from, `♟️ *GUIA DE COORDENADAS*${guia}\n\n💡 Use essas coordenadas para fazer suas jogadas!`);
            } else if (subcomando === "ranking" || subcomando === "rank") {
                const resultado = xadrez.mostrarRanking();
                await reply(sock, from, resultado.mensagem, resultado.mentions);
            } else if (subcomando === "player" || subcomando === "perfil") {
                const username = args[1];
                if (!username) {
                    await reply(sock, from, `❌ Digite o nome do jogador!\n\n💡 Exemplo: \`${config.prefix}xadrez player hikaru\``);
                    break;
                }
                
                await reply(sock, from, "🔍 Buscando jogador no Chess.com...");
                const resultado = await xadrez.buscarJogadorChessCom(username);
                await reply(sock, from, resultado.mensagem);
            } else {
                const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                if (!mentionedJid || mentionedJid.length === 0) {
                    await reply(sock, from, `❌ Marque o oponente para iniciar!\n\n💡 Exemplo: \`${config.prefix}xadrez @oponente\``);
                    break;
                }
                
                const resultado = xadrez.iniciarPartida(from, sender, mentionedJid[0]);
                
                if (resultado.sucesso && resultado.imagem) {
                    try {
                        await sock.sendMessage(from, {
                            image: { url: resultado.imagem },
                            caption: resultado.mensagem,
                            mentions: resultado.mentions,
                            contextInfo: {
                                mentionedJid: resultado.mentions,
                                isForwarded: true,
                                forwardingScore: 100000,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.idDoCanal,
                                    newsletterName: "© NEEXT LTDA"
                                },
                                externalAdReply: {
                                    title: "♟️ Xadrez NEEXT",
                                    body: "Nova Partida Iniciada",
                                    thumbnailUrl: config.fotoDoBot,
                                    mediaType: 1,
                                    sourceUrl: "www.neext.online"
                                }
                            }
                        });
                        await reagirMensagem(sock, message, "♟️");
                    } catch (imgErr) {
                        console.log("⚠️ Erro ao carregar imagem do tabuleiro, enviando texto:", imgErr.message);
                        await reply(sock, from, resultado.mensagem + (resultado.tabuleiroTexto ? "\n\n" + resultado.tabuleiroTexto : ""), resultado.mentions);
                    }
                } else {
                    await reply(sock, from, resultado.mensagem, resultado.mentions);
                }
            }
        }
        break;

        case "akinator": {
            await reagirMensagem(sock, message, "🔮");
            const sender = message.key.participant || from;
            const resultado = await akinator.iniciarAkinator(sender);
            
            await reply(sock, from, resultado.message);
            
            if (resultado.success) {
                await reagirMensagem(sock, message, "✨");
            }
        }
        break;

        case "akinatorvoltar": {
            const sender = message.key.participant || from;
            const resultado = await akinator.voltarAkinator(sender);
            
            await reply(sock, from, resultado.message);
            
            if (resultado.success) {
                await reagirMensagem(sock, message, "⬅️");
            }
        }
        break;

        case "akinatorparar": {
            const sender = message.key.participant || from;
            const resultado = akinator.pararAkinator(sender);
            
            await reply(sock, from, resultado.message);
            
            if (resultado.success) {
                await reagirMensagem(sock, message, "🛑");
            }
        }
        break;

        case "estudar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.estudar(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "📚");
            }
        }
        break;

        case "investir": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.investir(userId);

            if (resultado.erro) {
                await reply(sock, from, `❌ ${resultado.erro}`);
                break;
            }

            await reply(sock, from, resultado.mensagem);
            await reagirMensagem(sock, message, resultado.sucesso ? "📈" : "📉");
        }
        break;

        case "apostar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const valor = args[0] ? parseInt(args[0]) : null;
            const resultado = rpg.apostar(userId, valor);

            if (resultado.erro) {
                await reply(sock, from, `❌ ${resultado.erro}`);
                break;
            }

            await reply(sock, from, resultado.mensagem);
            await reagirMensagem(sock, message, resultado.sucesso ? "🎲" : "💔");
        }
        break;

        // ==================== NOVOS COMANDOS RPG ====================

        case "loja": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const categoria = args[0]?.toLowerCase();
            const resultado = rpg.verLoja(categoria);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🛒");
            }
        }
        break;

        case "negocios": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.listarLoja("negocios");
            await reply(sock, from, resultado.mensagem);
            await reagirMensagem(sock, message, "🏢");
        }
        break;

        case "comprar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            if (!args[0]) {
                const config = obterConfiguracoes();
                await reply(sock, from, `🛒 *COMO COMPRAR*\n\nUse: \`${config.prefix}comprar [item]\`\n\n💡 *Exemplo:*\n\`${config.prefix}comprar vara\`\n\n📋 *Para ver itens:* \`${config.prefix}loja\``);
                break;
            }

            const itemId = args[0];
            const resultado = rpg.comprar(userId, itemId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "✅");
            }
        }
        break;

        case "inventario":
        case "meuinventario":
        case "mochila": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.verInventario(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "📦");
            }
        }
        break;

        case "cacar":
        case "cacada": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.cacar(userId);
            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🏹");
            }
        }
        break;

        case "coletar":
        case "coleta": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.coletar(userId);
            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🌱");
            }
        }
        break;

        case "trabalhos": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.verTrabalhos(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "💼");
            }
        }
        break;

        case "escolhertrabalho": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const trabalhoId = args[0];
            if (!trabalhoId) {
                await reply(sock, from, "❌ Especifique o trabalho!\n\n💡 Uso: .escolhertrabalho [id]\n💡 Use .trabalhos para ver trabalhos disponíveis");
                break;
            }

            const resultado = rpg.escolherTrabalho(userId, trabalhoId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "✅");
            }
        }
        break;

        case "educacao": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.verEducacao(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🎓");
            }
        }
        break;

        case "daily": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.daily(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "💰");
            }
        }
        break;

        case "vender": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const itemId = args[0];
            const quantidade = parseInt(args[1]) || 1;

            if (!itemId) {
                await reply(sock, from, "❌ Especifique o item!\n\n💡 Uso: .vender [item] [quantidade]");
                break;
            }

            const resultado = rpg.vender(userId, itemId, quantidade);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "💰");
            }
        }
        break;

        case "pix": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            // Verifica se foi marcado alguém
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                const config = obterConfiguracoes();
                await reply(sock, from, `💸 **SISTEMA PIX - NEEXTCITY**\n\n📱 Para transferir Gold, use:\n\`${config.prefix}pix @usuario [valor]\`\n\n💡 **Exemplo:** \`${config.prefix}pix @5511999999999 1000\`\n\n⚠️ **Taxa:** 2% sobre o valor transferido\n💰 **Valor mínimo:** 10 Gold`);
                break;
            }

            const destinatarioJid = mentioned[0];
            const destinatarioId = destinatarioJid.split('@')[0];
            const valor = args[1] ? parseInt(args[1]) : null;

            if (!valor || isNaN(valor)) {
                await reply(sock, from, "❌ Digite um valor válido para transferir.");
                break;
            }

            // Não permite transferir para si mesmo
            if (userId === destinatarioId) {
                await reply(sock, from, "❌ Você não pode transferir PIX para si mesmo!");
                break;
            }

            // Obtém nomes dos usuários
            const remetente = rpg.obterDadosUsuario(userId);
            const destinatario = rpg.obterDadosUsuario(destinatarioId);

            if (!destinatario) {
                await reply(sock, from, "❌ O destinatário não está registrado no RPG.");
                break;
            }

            const resultado = rpg.pixTransferir(userId, destinatarioId, valor, remetente.nome, destinatario.nome);

            if (resultado.erro) {
                await reply(sock, from, `❌ ${resultado.erro}`);
                break;
            }

            // Envia confirmação
            await sock.sendMessage(from, {
                image: { url: "https://i.ibb.co/XsRtKgD/pix-transferencia.jpg" },
                caption: resultado.mensagem,
                contextInfo: {
                    mentionedJid: [sender, destinatarioJid],
                    forwardingScore: 100000,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363289739581116@newsletter",
                        newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                    },
                    externalAdReply: {
                        title: "💸 PIX Realizado - NeextCity",
                        body: "© NEEXT LTDA",
                        thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                        mediaType: 1,
                        sourceUrl: "https://www.neext.online"
                    }
                }
            }, { quoted: message });

            await reagirMensagem(sock, message, "💸");
        }
        break;

        case "perfil": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.getPerfil(userId);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "👤");
            }
        }
        break;

        case "depositar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const valor = parseInt(args[0]);
            if (!valor || isNaN(valor)) {
                await reply(sock, from, "❌ Digite um valor válido!\n\n💡 Uso: .depositar [valor]");
                break;
            }

            const resultado = rpg.depositar(userId, valor);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🏦");
            }
        }
        break;

        case "sacar": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const valor = parseInt(args[0]);
            if (!valor || isNaN(valor)) {
                await reply(sock, from, "❌ Digite um valor válido!\n\n💡 Uso: .sacar [valor]");
                break;
            }

            const resultado = rpg.sacar(userId, valor);
            await reply(sock, from, resultado.mensagem);
            
            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "💰");
            }
        }
        break;

        // ==================== NOVOS COMANDOS RPG EXPANDIDOS ====================

        case "roubar":
        case "roubo": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const localId = args[0] ? parseInt(args[0]) : null;
            const resultado = await rpg.roubar(userId, localId);

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown' || resultado.erro === 'Limite diário') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            if (resultado.listaLocais) {
                await reply(sock, from, resultado.mensagem);
                await reagirMensagem(sock, message, "🏴‍☠️");
            } else {
                await reply(sock, from, resultado.mensagem);

                if (resultado.sucesso) {
                    await reagirMensagem(sock, message, "💰");
                } else if (resultado.prisao) {
                    await reagirMensagem(sock, message, "🚨");
                } else {
                    await reagirMensagem(sock, message, "😞");
                }
            }
        }
        break;

        case "youtube":
        case "yt": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = await rpg.criarConteudo(userId, 'youtube');

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            await reply(sock, from, resultado.mensagem);
            await reagirMensagem(sock, message, "🎥");
        }
        break;

        case "tiktok":
        case "tt": {
            // Download de vídeos do TikTok
            if (!args[0]) {
                await reply(sock, from, "❌ Por favor, forneça um link do TikTok.\n\nExemplo: `.tiktok https://vm.tiktok.com/xxxxx`");
                break;
            }

            const url = args[0];

            if (!url.includes('tiktok.com')) {
                await reply(sock, from, "❌ Link inválido! Use um link do TikTok.");
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");
                await reply(sock, from, "📱 Baixando vídeo do TikTok, aguarde...");

                const apiUrl = `https://www.api.neext.online/download/tiktok?url=${encodeURIComponent(url)}`;
                const response = await axios.get(apiUrl, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.data || !response.data.success) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Não foi possível baixar este vídeo do TikTok. Verifique o link.");
                    break;
                }

                const result = response.data;

                if (!result.video || !result.video.url || !result.video.url.noWatermark) {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, "❌ Vídeo não encontrado ou não disponível.");
                    break;
                }

                const videoResponse = await axios({
                    method: 'GET',
                    url: result.video.url.noWatermark,
                    responseType: 'arraybuffer',
                    timeout: 60000
                });

                const videoBuffer = Buffer.from(videoResponse.data);

                await sock.sendMessage(from, {
                    video: videoBuffer,
                    mimetype: 'video/mp4'
                });

                await reagirMensagem(sock, message, "✅");
                console.log(`✅ Vídeo do TikTok baixado com sucesso`);

            } catch (error) {
                console.error("❌ Erro ao baixar TikTok:", error.message);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao baixar o vídeo do TikTok. Tente novamente mais tarde.");
            }
        }
        break;

        case "twitch":
        case "stream": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = await rpg.criarConteudo(userId, 'twitch');

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            await reply(sock, from, resultado.mensagem);
            await reagirMensagem(sock, message, "🎮");
        }
        break;

        case "coletar":
        case "coleta": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.coletar(userId);

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🌱");
            } else {
                await reagirMensagem(sock, message, "😞");
            }
        }
        break;

        case "entrega":
        case "delivery": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const resultado = rpg.entrega(userId);

            if (resultado.erro) {
                if (resultado.erro === 'Cooldown') {
                    await reply(sock, from, resultado.mensagem);
                } else {
                    await reply(sock, from, `❌ ${resultado.erro}`);
                }
                break;
            }

            await reply(sock, from, resultado.mensagem);

            if (resultado.sucesso) {
                await reagirMensagem(sock, message, "🛵");
            } else {
                await reagirMensagem(sock, message, "❌");
            }
        }
        break;

        case "vermeusaldo":
        case "saldo": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const sender = message.key.participant || from;
            const userId = sender.split('@')[0];

            if (!rpg.isUsuarioRegistrado(userId)) {
                const config = obterConfiguracoes();
                await reply(sock, from, "❌ Você precisa se registrar primeiro! Use `" + config.prefix + "registrar`");
                break;
            }

            const userData = rpg.obterDadosUsuario(userId);
            const dataRegistro = new Date(userData.registrado).toLocaleDateString('pt-BR');

            const extrato = `🏙️ **EXTRATO NEEXTCITY**\n\n` +
                          `👤 **Nome:** ${userData.nome}\n` +
                          `${userData.banco.emoji} **Banco:** ${userData.banco.nome}\n` +
                          `💰 **Saldo:** ${userData.saldo} Gold\n` +
                          `📅 **Registrado em:** ${dataRegistro}\n\n` +
                          `📊 **ESTATÍSTICAS**\n\n` +
                          `🎣 **Pescas:** ${userData.pescasFeitas}\n` +
                          `⛏️ **Minerações:** ${userData.mineracoesFeitas}\n` +
                          `💼 **Trabalhos:** ${userData.trabalhosFeitos}\n` +
                          `🔫 **Assaltos:** ${userData.assaltosFeitos}\n\n` +
                          `© NEEXT LTDA - NeextCity`;

            await reply(sock, from, extrato);
            await reagirMensagem(sock, message, "🏦");
        }
        break;

        case "rank":
        case "ranking": {
            // Só funciona em grupos com RPG ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ O sistema RPG só funciona em grupos.");
                break;
            }

            if (!rpg.isRPGAtivo(from)) {
                await reply(sock, from, "❌ O RPG não está ativo neste grupo.");
                break;
            }

            const ranking = rpg.obterRanking();
            await reply(sock, from, ranking.mensagem);
            await reagirMensagem(sock, message, "🏆");
        }
        break;

        // ================== FIM DO SISTEMA RPG ==================

        // ================== COMANDOS ADMINISTRATIVOS ==================

        case "fechargrupo":
        case "fechar":
        case "f":
        case "grupo f": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                // Verifica o estado atual do grupo
                const groupMetadata = await sock.groupMetadata(from);
                const grupoFechado = groupMetadata.announce || false;
                
                console.log(`🔍 [FECHARGRUPO] Estado do grupo: ${grupoFechado ? 'FECHADO' : 'ABERTO'} (announce: ${groupMetadata.announce})`);
                
                if (grupoFechado) {
                    // Grupo já está fechado
                    await reagirMensagem(sock, message, "ℹ️");
                    await reply(sock, from, "ℹ️ *O GRUPO JÁ ESTÁ FECHADO!*\n\nApenas admins podem enviar mensagens.");
                    console.log(`ℹ️ [FECHARGRUPO] Grupo ${from} já estava fechado`);
                    break;
                }

                // Grupo está aberto, então vamos fechar
                console.log(`🔍 [FECHARGRUPO] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [FECHARGRUPO] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [FECHARGRUPO] Bot NÃO é admin - tentando fechar mesmo assim`);
                }

                await sock.groupSettingUpdate(from, 'announcement');
                await reagirMensagem(sock, message, "🔒");
                await reply(sock, from, "🔒 *GRUPO FECHADO!*\n\nApenas admins podem enviar mensagens agora.");
                console.log(`🔒 Grupo ${from} foi fechado por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao fechar grupo:", err);
                await reply(sock, from, `❌ Erro ao fechar o grupo.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "abrirgrupo":
        case "abrir":
        case "a":
        case "grupo a": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                // Verifica o estado atual do grupo
                const groupMetadata = await sock.groupMetadata(from);
                const grupoFechado = groupMetadata.announce || false;
                
                console.log(`🔍 [ABRIRGRUPO] Estado do grupo: ${grupoFechado ? 'FECHADO' : 'ABERTO'} (announce: ${groupMetadata.announce})`);
                
                if (!grupoFechado) {
                    // Grupo já está aberto
                    await reagirMensagem(sock, message, "ℹ️");
                    await reply(sock, from, "ℹ️ *O GRUPO JÁ ESTÁ ABERTO!*\n\nTodos os membros já podem enviar mensagens.");
                    console.log(`ℹ️ [ABRIRGRUPO] Grupo ${from} já estava aberto`);
                    break;
                }

                // Grupo está fechado, então vamos abrir
                console.log(`🔍 [ABRIRGRUPO] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [ABRIRGRUPO] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [ABRIRGRUPO] Bot NÃO é admin - tentando abrir mesmo assim`);
                }

                await sock.groupSettingUpdate(from, 'not_announcement');
                await reagirMensagem(sock, message, "🔓");
                await reply(sock, from, "🔓 *GRUPO ABERTO!*\n\nTodos os membros podem enviar mensagens agora.");
                console.log(`🔓 Grupo ${from} foi aberto por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao abrir grupo:", err);
                await reply(sock, from, `❌ Erro ao abrir o grupo.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "opengp": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            const timeArg = args[0];
            if (!timeArg) {
                await reply(sock, from, `❌ Use: ${configBot.prefix}opengp HH:MM\n\nExemplo: ${configBot.prefix}opengp 09:07`);
                break;
            }

            const groupSchedule = require('./arquivos/grupo-schedule.js');
            const parsedTime = groupSchedule.parseTime(timeArg);
            
            if (!parsedTime) {
                await reply(sock, from, "❌ Formato de hora inválido! Use HH:MM (ex: 09:07 ou 14:30)");
                break;
            }

            groupSchedule.setSchedule(from, 'open', parsedTime.formatted);
            await reagirMensagem(sock, message, "🔓");
            await reply(sock, from, `✅ *AGENDAMENTO CONFIGURADO!*\n\n🔓 Abertura automática: ${parsedTime.formatted}\n⏰ O grupo abrirá automaticamente todos os dias neste horário.\n\n⚠️ *Importante:* O bot precisa ser admin para executar a abertura automática!`);
            console.log(`⏰ Agendamento de abertura configurado para ${from} às ${parsedTime.formatted}`);
        }
        break;

        case "closegp": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            const timeArg = args[0];
            if (!timeArg) {
                await reply(sock, from, `❌ Use: ${configBot.prefix}closegp HH:MM\n\nExemplo: ${configBot.prefix}closegp 21:50`);
                break;
            }

            const groupSchedule = require('./arquivos/grupo-schedule.js');
            const parsedTime = groupSchedule.parseTime(timeArg);
            
            if (!parsedTime) {
                await reply(sock, from, "❌ Formato de hora inválido! Use HH:MM (ex: 21:50 ou 23:00)");
                break;
            }

            groupSchedule.setSchedule(from, 'close', parsedTime.formatted);
            await reagirMensagem(sock, message, "🔒");
            await reply(sock, from, `✅ *AGENDAMENTO CONFIGURADO!*\n\n🔒 Fechamento automático: ${parsedTime.formatted}\n⏰ O grupo fechará automaticamente todos os dias neste horário.\n\n⚠️ *Importante:* O bot precisa ser admin para executar o fechamento automático!`);
            console.log(`⏰ Agendamento de fechamento configurado para ${from} às ${parsedTime.formatted}`);
        }
        break;

        case "time-status": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const configBot = obterConfiguracoes();
            const groupSchedule = require('./arquivos/grupo-schedule.js');
            const schedule = groupSchedule.getSchedule(from);
            
            let statusMsg = "⏰ *AGENDAMENTOS DO GRUPO*\n\n";
            
            if (schedule.open || schedule.close) {
                if (schedule.open) {
                    statusMsg += `🔓 *Abertura automática:* ${schedule.open}\n`;
                } else {
                    statusMsg += `🔓 *Abertura automática:* Não configurada\n`;
                }
                
                if (schedule.close) {
                    statusMsg += `🔒 *Fechamento automático:* ${schedule.close}\n`;
                } else {
                    statusMsg += `🔒 *Fechamento automático:* Não configurado\n`;
                }
                
                statusMsg += `\n✅ O bot executará as ações automaticamente nos horários configurados.`;
            } else {
                statusMsg += `❌ Nenhum agendamento configurado.\n\n`;
                statusMsg += `💡 *Configure agendamentos:*\n`;
                statusMsg += `• ${configBot.prefix}opengp HH:MM\n`;
                statusMsg += `• ${configBot.prefix}closegp HH:MM`;
            }
            
            await reagirMensagem(sock, message, "⏰");
            await reply(sock, from, statusMsg);
        }
        break;

        case "linkgrupo":
        case "linkdogrupo":
        case "link": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            try {
                // Pega o código de convite do grupo
                const code = await sock.groupInviteCode(from);
                const link = `https://chat.whatsapp.com/${code}`;
                
                // Pega informações do grupo
                const groupMetadata = await getGroupMetadataWithCache(sock, from);
                const groupName = groupMetadata.subject;
                const totalMembers = groupMetadata.participants.length;
                
                const linkMsg = `🔗 *LINK DO GRUPO*\n\n` +
                    `📱 *Grupo:* ${groupName}\n` +
                    `👥 *Membros:* ${totalMembers}\n\n` +
                    `🌐 *Link de convite:*\n${link}\n\n` +
                    `⚠️ *Importante:* Não compartilhe em locais públicos!`;
                
                await reagirMensagem(sock, message, "🔗");
                await reply(sock, from, linkMsg);
                
                console.log(`🔗 Link do grupo ${groupName} solicitado`);
            } catch (err) {
                console.error("❌ Erro ao obter link do grupo:", err);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao obter link do grupo. O bot precisa ser admin para gerar o link de convite!");
            }
        }
        break;

        case "delmsg":
        case "del":
        case "delete": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            // Verifica se há mensagem marcada
            const quotedMsg = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await reply(sock, from, "❌ Marque uma mensagem para deletar!");
                break;
            }

            try {
                const quotedKey = message.message.extendedTextMessage.contextInfo.stanzaId;
                const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;

                const messageKey = {
                    remoteJid: from,
                    fromMe: false,
                    id: quotedKey,
                    participant: quotedParticipant
                };

                await reagirMensagem(sock, message, "⏳");
                await sock.sendMessage(from, { delete: messageKey });
                await reagirMensagem(sock, message, "🗑️");
                console.log(`🗑️ Mensagem deletada por admin ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao deletar mensagem:", err);
                await reagirMensagem(sock, message, "❌");
                
                const errorMsg = err.message || err.toString();
                if (errorMsg.includes('forbidden') || errorMsg.includes('not-authorized') || errorMsg.includes('401')) {
                    await reply(sock, from, "❌ *BOT NÃO É ADMIN*\n\n⚠️ Preciso ser administrador do grupo para deletar mensagens!\n\n📝 Peça para um admin me promover primeiro.");
                } else if (errorMsg.includes('not-found') || errorMsg.includes('404')) {
                    await reply(sock, from, "❌ Mensagem não encontrada. Pode ter sido deletada ou é muito antiga.");
                } else {
                    await reply(sock, from, `❌ Erro ao deletar mensagem.\n\n🔍 A mensagem pode ser muito antiga ou já foi deletada.`);
                }
            }
        }
        break;

        case "resetlink":
        case "resetarlink":
        case "novolink": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                console.log(`🔍 [RESETLINK] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [RESETLINK] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [RESETLINK] Bot NÃO é admin - tentando resetar link mesmo assim`);
                }

                const newLink = await sock.groupRevokeInvite(from);
                await reagirMensagem(sock, message, "🔗");
                await reply(sock, from, `🔗 *LINK DO GRUPO RESETADO!*\n\n✅ Novo link: https://chat.whatsapp.com/${newLink}\n\n⚠️ O link anterior foi invalidado!`);
                console.log(`🔗 Link do grupo ${from} foi resetado por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao resetar link:", err);
                await reply(sock, from, `❌ Erro ao resetar o link do grupo.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "ativarsolicitacao":
        case "ativarjoin":
        case "reqon": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                console.log(`🔍 [ATIVARSOLICITACAO] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [ATIVARSOLICITACAO] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [ATIVARSOLICITACAO] Bot NÃO é admin - tentando ativar mesmo assim`);
                }

                await sock.groupToggleEphemeral(from, false);
                await sock.groupSettingUpdate(from, 'locked');
                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, "✅ *SOLICITAÇÃO DE ENTRADA ATIVADA!*\n\nNovos membros precisarão da aprovação dos admins para entrar.");
                console.log(`✅ Solicitação de entrada ativada no grupo ${from} por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao ativar solicitação:", err);
                await reply(sock, from, `❌ Erro ao ativar solicitação de entrada.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "desativarsolicitacao":
        case "desativarjoin":
        case "reqoff": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                console.log(`🔍 [DESATIVARSOLICITACAO] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [DESATIVARSOLICITACAO] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [DESATIVARSOLICITACAO] Bot NÃO é admin - tentando desativar mesmo assim`);
                }

                await sock.groupSettingUpdate(from, 'unlocked');
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ *SOLICITAÇÃO DE ENTRADA DESATIVADA!*\n\nQualquer pessoa com o link pode entrar no grupo agora.");
                console.log(`❌ Solicitação de entrada desativada no grupo ${from} por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao desativar solicitação:", err);
                await reply(sock, from, `❌ Erro ao desativar solicitação de entrada.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "soloadmin":
        case "adminonly": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            // Verifica se bot é admin
            const botAdmin = await botEhAdmin(sock, from);
            if (!botAdmin) {
                await reply(sock, from, "❌ O bot precisa ser admin para alterar configurações do grupo.");
                break;
            }

            try {
                await sock.groupSettingUpdate(from, 'locked');
                await reagirMensagem(sock, message, "🔒");
                await reply(sock, from, "🔒 *EDIÇÃO RESTRITA!*\n\nApenas admins podem editar as informações do grupo (nome, descrição, foto).");
                console.log(`🔒 Edição restrita a admins no grupo ${from} por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao restringir edição:", err);
                await reply(sock, from, "❌ Erro ao restringir edição do grupo. Verifique se o bot tem permissões de admin.");
            }
        }
        break;

        case "mudargrupo":
        case "mudarnome":
        case "renamegroup": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            const novoNome = args.join(" ").trim();
            if (!novoNome) {
                await reply(sock, from, `❌ Use: ${config.prefix}mudargrupo <novo nome>\n\nExemplo: ${config.prefix}mudargrupo NEEXT LTDA - Grupo Oficial`);
                break;
            }

            if (novoNome.length > 25) {
                await reply(sock, from, "❌ O nome do grupo deve ter no máximo 25 caracteres!");
                break;
            }

            try {
                console.log(`🔍 [MUDARGRUPO] Verificando se bot é admin no grupo ${from}`);
                const botAdmin = await botEhAdmin(sock, from);
                console.log(`🔍 [MUDARGRUPO] Resultado botEhAdmin: ${botAdmin}`);
                
                if (!botAdmin) {
                    console.log(`⚠️ [MUDARGRUPO] Bot NÃO é admin - tentando mudar nome mesmo assim`);
                }

                await sock.groupUpdateSubject(from, novoNome);
                await reagirMensagem(sock, message, "✏️");
                await reply(sock, from, `✏️ *NOME DO GRUPO ALTERADO!*\n\n📝 Novo nome: "${novoNome}"\n👤 Alterado por: @${sender.split('@')[0]}`, [sender]);
                console.log(`✏️ Nome do grupo ${from} alterado para "${novoNome}" por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao alterar nome do grupo:", err);
                await reply(sock, from, `❌ Erro ao alterar o nome do grupo.\n\n💡 Detalhes: ${err.message}\n\nVerifique se o bot realmente é admin do grupo.`);
            }
        }
        break;

        case "fotodobot": {
            const sender = message.key.participant || from;
            const ehDono = isDono(sender);

            if (!ehDono) {
                await reply(sock, from, "❌ Apenas o dono pode trocar a foto do bot.");
                break;
            }

            // Verifica se há imagem anexada ou marcada
            let mediaData = null;
            if (message.message.imageMessage) {
                mediaData = message.message.imageMessage;
            } else if (quoted?.imageMessage) {
                mediaData = quoted.imageMessage;
            }

            if (!mediaData) {
                await reply(sock, from, "❌ Envie ou marque uma imagem para usar como foto do bot!");
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");

                // Baixa a imagem
                const buffer = await downloadContentFromMessage(mediaData, 'image');
                let imageBuffer = Buffer.from([]);
                for await (const chunk of buffer) {
                    imageBuffer = Buffer.concat([imageBuffer, chunk]);
                }

                // Atualiza a foto do perfil do bot
                await sock.updateProfilePicture(sock.user.id, imageBuffer);

                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, "✅ *FOTO DO BOT ALTERADA!*\n\nA foto de perfil do bot foi atualizada com sucesso!");
                console.log(`📸 Foto do bot alterada por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao alterar foto do bot:", err);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao alterar a foto do bot. Tente novamente.");
            }
        }
        break;

        case "fotodogrupo": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            // Verifica se bot é admin
            const botAdmin = await botEhAdmin(sock, from);
            if (!botAdmin) {
                await reply(sock, from, "❌ O bot precisa ser admin para alterar a foto do grupo.");
                break;
            }

            // Verifica se há imagem anexada ou marcada
            let mediaData = null;
            if (message.message.imageMessage) {
                mediaData = message.message.imageMessage;
            } else {
                // Verifica se há mensagem marcada com imagem
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMsg?.imageMessage) {
                    mediaData = quotedMsg.imageMessage;
                }
            }

            if (!mediaData) {
                await reply(sock, from, "❌ Envie ou marque uma imagem para usar como foto do grupo!");
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");

                // Baixa a imagem
                const buffer = await downloadContentFromMessage(mediaData, 'image');
                let imageBuffer = Buffer.from([]);
                for await (const chunk of buffer) {
                    imageBuffer = Buffer.concat([imageBuffer, chunk]);
                }

                // Atualiza a foto do grupo
                await sock.updateProfilePicture(from, imageBuffer);

                await reagirMensagem(sock, message, "📸");
                await reply(sock, from, "📸 *FOTO DO GRUPO ALTERADA!*\n\nA foto do grupo foi atualizada com sucesso!");
                console.log(`📸 Foto do grupo ${from} alterada por ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao alterar foto do grupo:", err);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao alterar a foto do grupo. Verifique se o bot tem permissões de admin.");
            }
        }
        break;

        // ================== FIM DOS COMANDOS ADMINISTRATIVOS ==================

        // ================== COMANDOS DE MODO GAMER ==================

        case "modogamer": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;

            // Verifica se é admin
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas administradores podem usar este comando!", [sender]);
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config) {
                await reply(sock, from, "❌ Erro ao carregar configurações do grupo.");
                break;
            }

            const action = args[0]?.toLowerCase();

            if (action === "on" || action === "ativar") {
                if (config.modogamer) {
                    await reply(sock, from, "⚠️ Modo Gamer já está ativo neste grupo!");
                    break;
                }

                config.modogamer = true;
                const salvou = antiSpam.salvarConfigGrupo(from, config);

                if (salvou) {
                    await reagirMensagem(sock, message, "🎮");
                    await reply(sock, from,
                        `🎮 *MODO GAMER ATIVADO!*\n\n` +
                        `✅ Modo gamer foi ativado no grupo!\n` +
                        `Use ${config.prefix}menugamer para ver os comandos`,
                        [sender]
                    );
                } else {
                    await reply(sock, from, "❌ Erro ao salvar configuração. Tente novamente.");
                }
            } else if (action === "off" || action === "desativar") {
                if (!config.modogamer) {
                    await reply(sock, from, "⚠️ Modo Gamer já está desativado neste grupo!");
                    break;
                }

                config.modogamer = false;
                const salvou = antiSpam.salvarConfigGrupo(from, config);

                if (salvou) {
                    await reagirMensagem(sock, message, "🚫");
                    await reply(sock, from,
                        `🚫 *MODO GAMER DESATIVADO!*\n\n` +
                        `❌ Modo gamer foi desativado no grupo\n` +
                        `🔒 Jogos e comandos de diversão não funcionarão mais\n\n` +
                        `👤 Desativado por: @${sender.split('@')[0]}`,
                        [sender]
                    );
                } else {
                    await reply(sock, from, "❌ Erro ao salvar configuração. Tente novamente.");
                }
            } else {
                const status = config.modogamer ? "✅ ATIVO" : "❌ DESATIVO";
                const botConfig = obterConfiguracoes();
                await reply(sock, from,
                    `🎮 *STATUS DO MODO GAMER*\n\n` +
                    `${status}\n\n` +
                    `📝 **Uso:**\n` +
                    `• ${botConfig.prefix}modogamer on - Ativar\n` +
                    `• ${botConfig.prefix}modogamer off - Desativar\n\n` +
                    `⚠️ Apenas administradores podem alterar`
                );
            }
        }
        break;

        case "eununca": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const perguntas = [
                "já mandou nude",
                "já ficou com alguém do grupo",
                "já mentiu sobre a idade",
                "já fingiu estar doente para faltar",
                "já roubou algo",
                "já traiu alguém",
                "já foi traído",
                "já chorou assistindo filme",
                "já cantou no banho",
                "já dançou sozinho no quarto",
                "já falou sozinho",
                "já dormiu em aula",
                "já colou em prova",
                "já esqueceu o nome de alguém na hora de apresentar",
                "já passou vergonha em público",
                "já mandou mensagem para pessoa errada",
                "já stalkeou ex nas redes sociais",
                "já fingiu que estava bem quando estava mal",
                "já comeu comida do chão",
                "já usou roupa por mais de 2 dias seguidos"
            ];

            const perguntaAleatoria = perguntas[Math.floor(Math.random() * perguntas.length)];

            await sock.sendMessage(from, {
                poll: {
                    name: `🤔 Eu nunca... ${perguntaAleatoria}`,
                    values: ["🔥 EU JÁ", "😇 EU NUNCA"],
                    selectableCount: 1
                }
            });
        }
        break;

        case "vab": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            try {
                const vabData = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'vab.json'), 'utf8'));
                const perguntas = vabData.perguntas;
                
                if (!perguntas || perguntas.length === 0) {
                    await reply(sock, from, "❌ Nenhuma pergunta disponível no momento.");
                    break;
                }

                const perguntaAleatoria = perguntas[Math.floor(Math.random() * perguntas.length)];

                await sock.sendMessage(from, {
                    poll: {
                        name: `❓ Você ${perguntaAleatoria}?`,
                        values: ["✅ SIM", "❌ NÃO", "🤔 TALVEZ"],
                        selectableCount: 1
                    }
                });
            } catch (error) {
                console.error("Erro ao carregar vab.json:", error);
                await reply(sock, from, "❌ Erro ao carregar perguntas. Tente novamente mais tarde.");
            }
        }
        break;

        case "anagrama": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const opcao = args[0];
            
            if (!opcao) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `🔤 *ANAGRAMA - DESCUBRA A PALAVRA*\n\n*1 PARA ATIVAR / 0 PARA DESATIVAR 💖*\n\nExemplo: ${botConfig.prefix}anagrama 1`);
                break;
            }

            if (opcao === "1") {
                if (anagramaAtivo[from]) {
                    await reply(sock, from, "⚠️ Já existe um jogo de anagrama ativo neste grupo!");
                    break;
                }

                try {
                    const anagramaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'anagrama.json'), 'utf8'));
                    const palavras = anagramaData.palavras;
                    
                    if (!palavras || palavras.length === 0) {
                        await reply(sock, from, "❌ Nenhuma palavra disponível no momento.");
                        break;
                    }

                    const palavraObj = palavras[Math.floor(Math.random() * palavras.length)];
                    const palavraOriginal = palavraObj.palavra.toUpperCase();
                    const dica = palavraObj.dica.toUpperCase();
                    let anagrama = embaralharPalavra(palavraOriginal);
                    
                    while (anagrama === palavraOriginal && palavraOriginal.length > 3) {
                        anagrama = embaralharPalavra(palavraOriginal);
                    }

                    anagramaAtivo[from] = true;
                    anagramaPalavraAtual[from] = {
                        palavra: palavraOriginal,
                        dica: dica,
                        anagrama: anagrama
                    };

                    const botConfig = obterConfiguracoes();
                    const mensagem = `╭━━ ⪩ 「 *Descubra a palavra* 」
❏ ⌁ ⚠︎ Anagrama: *${anagrama}*
❏ ⌁ ⚠︎ Dica: *${dica}*
❏ ⌁ ⚠︎ Bot *${botConfig.nomeDoBot}* - ANAGRAMA 
╰━━━ ⪨`;

                    const sentMsg = await sock.sendMessage(from, { text: mensagem });
                    anagramaMessageId[from] = sentMsg.key.id;

                } catch (error) {
                    console.error("Erro ao carregar anagrama.json:", error);
                    await reply(sock, from, "❌ Erro ao carregar palavras. Tente novamente mais tarde.");
                }
            } else if (opcao === "0") {
                if (!anagramaAtivo[from]) {
                    await reply(sock, from, "⚠️ Não há jogo de anagrama ativo neste grupo!");
                    break;
                }

                delete anagramaAtivo[from];
                delete anagramaPalavraAtual[from];
                delete anagramaMessageId[from];
                await reply(sock, from, "✅ Jogo de anagrama desativado com sucesso!");
            } else {
                await reply(sock, from, "*1 PARA ATIVAR / 0 PARA DESATIVAR 💖*");
            }
        }
        break;

        case "tapa": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para dar um tapa!\n\nExemplo: ${config.prefix}tapa @usuario`);
                break;
            }
            
            // Envia GIF de tapa
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://telegra.ph/file/841664f31eb7539c35a2d.mp4",
                `👋 *TAPA GOSTOSO!*\n\n@${sender.split('@')[0]} deu um tapa gostoso em @${target.split('@')[0]}! 💥\n\n😏 Ai que delícia!`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                await reply(sock, from, `👋 *TAPA GOSTOSO!*\n\n@${sender.split('@')[0]} deu um tapa gostoso em @${target.split('@')[0]}! 💥\n\n😏 Ai que delícia!`, [sender, target]);
            }
        }
        break;

        case "rankcorno": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                // Embaralha e pega porcentagens aleatórias
                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🤡`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/jvxHn5jf/23afed681d95265b23cfc9f32b3c6a35.jpg" },
                    caption: `🤡 *RANKING DOS CORNOS*\n\n${ranking}\n\n😈 Os chifrudos do grupo! 🦌`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankgostoso": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🔥`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://telegra.ph/file/030489699735abe38e174.jpg" },
                    caption: `🔥 *RANKING DOS GOSTOSOS*\n\n${ranking}\n\n😏 Os mais gostosos do grupo! 🔥`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankgostosa": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🔥`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://telegra.ph/file/dcff0d1e5ea578ade62fb.jpg" },
                    caption: `🔥 *RANKING DAS GOSTOSAS*\n\n${ranking}\n\n😏 As mais gostosas do grupo! 🔥`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "ranknazista": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 卐`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://telegra.ph/file/dcff0d1e5ea578ade62fb.jpg" },
                    caption: `卐 *RANKING DOS NAZISTAS*\n\n${ranking}\n\n😈 Os mais nazistas do grupo! 卐`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankotaku": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🎌`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://telegra.ph/file/796eed26a8f761970d9f5.jpg" },
                    caption: `🎌 *RANKING DOS OTAKUS*\n\n${ranking}\n\n😎 Os mais otakus do grupo! 🎌`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankpau": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const size = Math.floor(Math.random() * 30) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${size}cm 🍆`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://telegra.ph/file/ee6aed00378a0d1b88dda.jpg" },
                    caption: `🍆 *RANKING DO PAU*\n\n${ranking}\n\n😏 Os tamanhos do grupo! 🍆`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        // Função moderna para envio de GIFs - converte para MP4 usando ffmpeg
async function enviarGif(sock, from, gifUrl, caption, mentions = [], quoted = null) {
    const ffmpeg = require('fluent-ffmpeg');
    const tmpInputPath = path.join(__dirname, `temp_gif_${Date.now()}.gif`);
    const tmpOutputPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);

    try {
        console.log(`🎬 Baixando GIF: ${gifUrl}`);

        // Baixa o GIF
        const response = await axios({
            method: 'GET',
            url: gifUrl,
            responseType: 'arraybuffer',
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const gifBuffer = Buffer.from(response.data);
        console.log(`📥 GIF baixado: ${gifBuffer.length} bytes`);

        // Salva GIF temporariamente
        fs.writeFileSync(tmpInputPath, gifBuffer);
        
        // Converte GIF para MP4 usando ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(tmpInputPath)
                .outputOptions([
                    '-movflags', 'faststart',
                    '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
                ])
                .toFormat('mp4')
                .on('end', () => {
                    console.log('✅ GIF convertido para MP4');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ Erro na conversão:', err.message);
                    reject(err);
                })
                .save(tmpOutputPath);
        });

        // Lê o MP4 convertido
        const mp4Buffer = fs.readFileSync(tmpOutputPath);
        console.log(`📹 MP4 pronto: ${mp4Buffer.length} bytes`);

        // Envia como vídeo com gifPlayback
        await sock.sendMessage(from, {
            video: mp4Buffer,
            gifPlayback: true,
            caption: caption,
            mentions: mentions,
            mimetype: 'video/mp4'
        }, quoted ? { quoted } : {});

        // Limpa arquivos temporários
        if (fs.existsSync(tmpInputPath)) fs.unlinkSync(tmpInputPath);
        if (fs.existsSync(tmpOutputPath)) fs.unlinkSync(tmpOutputPath);

        console.log("✅ GIF enviado como MP4 convertido");
        return true;

    } catch (error) {
        console.log("❌ Erro ao processar GIF:", error.message);
        
        // Limpa arquivos temporários em caso de erro
        try {
            if (fs.existsSync(tmpInputPath)) fs.unlinkSync(tmpInputPath);
            if (fs.existsSync(tmpOutputPath)) fs.unlinkSync(tmpOutputPath);
        } catch (cleanupError) {
            // Ignora erro de limpeza
        }
        
        return false;
    }
}

        case "matar": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para matar!\n\nExemplo: ${botConfig.prefix}matar @usuario`);
                break;
            }

            // Envia GIF usando método simples
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://i.ibb.co/DgWJjj0K/58712ef364b6fdef5ae9bcbb48fc0fdb.gif",
                `💀 *ASSASSINATO!*\n\n@${sender.split('@')[0]} matou @${target.split('@')[0]}! ⚰️\n\n🩸 RIP... F no chat`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                // Fallback para texto se o GIF falhar
                await reply(sock, from, `💀 *ASSASSINATO!*\n\n@${sender.split('@')[0]} matou @${target.split('@')[0]}! ⚰️\n\n🩸 RIP... F no chat`, [sender, target]);
            }
        }
        break;

        case "atirar": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para atirar!\n\nExemplo: ${botConfig.prefix}atirar @usuario`);
                break;
            }

            // Envia GIF usando método simples
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://i.ibb.co/KpVxK1PB/9ab46702d1f0669a0ae40464b25568f2.gif",
                `🔫 *TIRO CERTEIRO!*\n\n@${sender.split('@')[0]} atirou em @${target.split('@')[0]}! 💥\n\n🎯 Pegou em cheio!`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                // Fallback para texto se o GIF falhar
                await reply(sock, from, `🔫 *TIRO CERTEIRO!*\n\n@${sender.split('@')[0]} atirou em @${target.split('@')[0]}! 💥\n\n🎯 Pegou em cheio!`, [sender, target]);
            }
        }
        break;

        case "bam": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para banir!\n\nExemplo: ${botConfig.prefix}bam @usuario`);
                break;
            }

            // Primeira mensagem - Banimento fake
            await reply(sock, from, `🔨 *USUÁRIO BANIDO COM SUCESSO!*\n\n@${target.split('@')[0]} foi banido do grupo! 🚫`, [target]);
            
            // Aguarda 2 segundos
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envia GIF da pegadinha
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://files.catbox.moe/tezqn1.gif",
                `😂 *VOCÊ CAIU NA PEGADINHA!*\n\n@${target.split('@')[0]} não foi banido, relaxa! 🤣\n\n🎭 Foi só uma brincadeira!`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                // Fallback para texto se o GIF falhar
                await reply(sock, from, `😂 *VOCÊ CAIU NA PEGADINHA!*\n\n@${target.split('@')[0]} não foi banido, relaxa! 🤣\n\n🎭 Foi só uma brincadeira!`, [sender, target]);
            }
        }
        break;

        case "cafune": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para fazer cafuné!\n\nExemplo: ${botConfig.prefix}cafune @usuario`);
                break;
            }

            // Envia GIF usando método simples
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://files.catbox.moe/1342p2.mp4",
                `🥰 *CAFUNÉ GOSTOSO!*\n\n@${sender.split('@')[0]} está fazendo cafuné em @${target.split('@')[0]}! 💕\n\n😌 Que carinho lindo!`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                // Fallback para texto se o GIF falhar
                await reply(sock, from, `🥰 *CAFUNÉ GOSTOSO!*\n\n@${sender.split('@')[0]} está fazendo cafuné em @${target.split('@')[0]}! 💕\n\n😌 Que carinho lindo!`, [sender, target]);
            }
        }
        break;

        case "novos": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants;

                // Pega os últimos 5 membros (assumindo que são os mais novos)
                const novosMembros = participants.slice(-5).reverse();
                
                if (novosMembros.length === 0) {
                    await reply(sock, from, "❌ Nenhum membro encontrado no grupo!");
                    break;
                }

                let mensagem = `👥 *NOVOS MEMBROS DO GRUPO*\n\n`;
                mensagem += `📊 Total de membros: ${participants.length}\n\n`;
                mensagem += `🆕 Últimos ${novosMembros.length} membros:\n\n`;
                
                novosMembros.forEach((participant, index) => {
                    const numero = participant.id.split('@')[0];
                    mensagem += `${index + 1}. @${numero}\n`;
                });

                mensagem += `\n👋 Bem-vindos ao grupo!`;

                const mentions = novosMembros.map(p => p.id);
                await reply(sock, from, mensagem, mentions);
                
            } catch (err) {
                console.error("❌ Erro ao listar novos membros:", err);
                await reply(sock, from, "❌ Erro ao buscar novos membros do grupo.");
            }
        }
        break;

        case "rankcasal": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                if (participants.length < 2) {
                    await reply(sock, from, "❌ Precisa ter pelo menos 2 pessoas no grupo!");
                    break;
                }

                // Escolhe duas pessoas aleatórias
                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                const pessoa1 = shuffled[0];
                const pessoa2 = shuffled[1];
                const compatibility = Math.floor(Math.random() * 100) + 1;
                const love1 = Math.floor(Math.random() * 100) + 1;
                const love2 = Math.floor(Math.random() * 100) + 1;

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/1G69wkJD/d32b5cfe067aa82bf2a5356c39499539.jpg" },
                    caption: `💕 *RANK CASAL*\n\n` +
                        `👫 Casal formado:\n` +
                        `💝 @${pessoa1.split('@')[0]} ❤️ @${pessoa2.split('@')[0]}\n\n` +
                        `📊 Compatibilidade: ${compatibility}%\n` +
                        `💖 @${pessoa1.split('@')[0]} gosta ${love1}% de @${pessoa2.split('@')[0]}\n` +
                        `💘 @${pessoa2.split('@')[0]} gosta ${love2}% de @${pessoa1.split('@')[0]}\n\n` +
                        `${compatibility > 80 ? '🔥 Casal perfeito!' : compatibility > 60 ? '😍 Muito amor!' : compatibility > 40 ? '😊 Pode dar certo!' : '💔 Melhor só amigos!'}`,
                    mentions: [pessoa1, pessoa2]
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking de casal.");
            }
        }
        break;

        case "prender": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para prender!\n\nExemplo: ${config.prefix}prender @usuario`);
                break;
            }

            const crimes = [
                "roubo de coração", "excesso de beleza", "ser muito gostoso(a)", "causar suspiros",
                "roubar olhares", "ser irresistível", "crime de sedução", "atentado ao pudor",
                "porte ilegal de charme", "formação de quadrilha do amor", "assalto ao coração",
                "tráfico de sorrisos", "porte de sorriso fatal", "estelionato sentimental"
            ];
            const crime = crimes[Math.floor(Math.random() * crimes.length)];

            await sock.sendMessage(from, {
                image: { url: "https://i.ibb.co/XfrfGk3n/bfde95077068d135cbcf9e039147b2c0.jpg" },
                caption: `🚔 *PRISÃO!*\n\n@${target.split('@')[0]} foi preso(a) por @${sender.split('@')[0]}!\n\n⛓️ Crime: ${crime}\n🔒 Fiança: 10 beijinhos!`,
                mentions: [sender, target]
            });
        }
        break;

        case "beijar": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para beijar!\n\nExemplo: ${botConfig.prefix}beijar @usuario`);
                break;
            }

            // Envia GIF de beijo
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://telegra.ph/file/c9b5ed858237ebc9f7356.mp4",
                `💋 *BEIJINHO!*\n\n@${sender.split('@')[0]} deu um beijinho em @${target.split('@')[0]}! 😘\n\n💕 Que fofo! 💋💋💋`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                await reply(sock, from, `💋 *BEIJINHO!*\n\n@${sender.split('@')[0]} deu um beijinho em @${target.split('@')[0]}! 😘\n\n💕 Que fofo! 💋💋💋`, [sender, target]);
            }
        }
        break;

        case "atropelar": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para atropelar!\n\nExemplo: ${botConfig.prefix}atropelar @usuario`);
                break;
            }

            // Envia GIF de atropelamento
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://media.tenor.com/8QkVf_hCXmcAAAAM/car-crash.gif",
                `🚗💨 *ATROPELAMENTO!*\n\n@${target.split('@')[0]} foi atropelado(a) por @${sender.split('@')[0]}! 🚑\n\n😵‍💫 Chamem o SAMU! 🚨🚨🚨`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                await reply(sock, from, `🚗💨 *ATROPELAMENTO!*\n\n@${target.split('@')[0]} foi atropelado(a) por @${sender.split('@')[0]}! 🚑\n\n😵‍💫 Chamem o SAMU! 🚨🚨🚨`, [sender, target]);
            }
        }
        break;

        case "dedo": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para fazer dedo!\n\nExemplo: ${botConfig.prefix}dedo @usuario`);
                break;
            }

            // Envia GIF de dedo
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://media.tenor.com/c6hotL40p0oAAAAM/middle-finger.gif",
                `🖕 *DEDO!*\n\n@${sender.split('@')[0]} fez dedo para @${target.split('@')[0]}! 😠\n\n🤬 Vai se lascar! 🖕🖕🖕`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                await reply(sock, from, `🖕 *DEDO!*\n\n@${sender.split('@')[0]} fez dedo para @${target.split('@')[0]}! 😠\n\n🤬 Vai se lascar! 🖕🖕🖕`, [sender, target]);
            }
        }
        break;

        case "sarra": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Modo Gamer está desativado neste grupo! Use \`${botConfig.prefix}modogamer on\` para ativar.`);
                break;
            }

            const sender = message.key.participant || from;
            const target = obterTargetGamer(message);

            if (!target) {
                const botConfig = obterConfiguracoes();
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para sarrar!\n\nExemplo: ${botConfig.prefix}sarra @usuario`);
                break;
            }

            // Envia GIF de sarrada/dança
            const gifEnviado = await enviarGif(
                sock,
                from,
                "https://media.tenor.com/jkGbj0f_c_0AAAAM/dance-twerk.gif",
                `🍑 *SARRADA!*\n\n@${sender.split('@')[0]} deu uma sarrada em @${target.split('@')[0]}! 🔥\n\n😈 Que safadeza! 🔥🔥🔥`,
                [sender, target],
                message
            );

            if (!gifEnviado) {
                await reply(sock, from, `🍑 *SARRADA!*\n\n@${sender.split('@')[0]} deu uma sarrada em @${target.split('@')[0]}! 🔥\n\n😈 Que safadeza! 🔥🔥🔥`, [sender, target]);
            }
        }
        break;

        case "rankgay": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🏳️‍🌈`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/9mzjcW0b/4f5a6af5b0375c87e9a3e63143e231fe.jpg" },
                    caption: `🏳️‍🌈 *RANKING GAY*\n\n${ranking}\n\n✨ Pride sem julgamentos! 🌈`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankburro": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🧠`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/0VV96XgJ/7760232d1a909d291a3231e720bf5ec9.jpg" },
                    caption: `🧠 *RANKING DOS BURROS*\n\n${ranking}\n\n🤪 Burrice extrema! 📉`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "ranklesbica": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🏳️‍🌈`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/jkwgSYYK/0607b00f9464319df28dcbe3b4a965dd.jpg" },
                    caption: `🏳️‍🌈 *RANKING LÉSBICA*\n\n${ranking}\n\n💜 Love is love! 🌈`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "impostor": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                if (participants.length < 2) {
                    await reply(sock, from, "❌ Precisa ter pelo menos 2 pessoas no grupo!");
                    break;
                }

                const impostor = participants[Math.floor(Math.random() * participants.length)];
                const cores = ["Vermelho", "Azul", "Verde", "Rosa", "Laranja", "Amarelo", "Preto", "Branco", "Roxo", "Marrom"];
                const cor = cores[Math.floor(Math.random() * cores.length)];

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/Q7Xb0Pxg/59f4312f9142a3529e1465a636a92ec7.jpg" },
                    caption: `🔴 *IMPOSTOR DETECTADO!*\n\n@${impostor.split('@')[0]} é o IMPOSTOR! 🚨\n\n🎨 Cor: ${cor}\n⚠️ EJETEM ESSA PESSOA!\n\n🚀 Among Us Vibes!`,
                    mentions: [impostor]
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao escolher impostor.");
            }
        }
        break;

        case "rankmaconheiro": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🌿`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/NdvLNTPN/15026da7ed842481343ded7960a8f8d5.jpg" },
                    caption: `🌿 *RANKING DOS MACONHEIROS*\n\n${ranking}\n\n💨 Os chapados! 🍃`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankbonito": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 😍`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/CKNS2Frr/150f9a8e0becc71f9c20113addb3d433.jpg" },
                    caption: `😍 *RANKING DOS BONITOS*\n\n${ranking}\n\n✨ Os gostosos do grupo! 🔥`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankemo": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🖤`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/9mtKb5rC/92e9188040a0728af1a49c61dd0c9279.jpg" },
                    caption: `🖤 *RANKING DOS EMOS*\n\n${ranking}\n\n💀 Os depressivos! 😭`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankfeio": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 👹`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/3x06vHm/7760232d1a909d291a3231e720bf5ec9.jpg" },
                    caption: `👹 *RANKING DOS FEIOS*\n\n${ranking}\n\n🤮 Os horrorosos! 😱`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "jogodaforca": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const palavras = [
                "JAVASCRIPT", "PROGRAMACAO", "COMPUTADOR", "TELEFONE", "INTERNET",
                "WHATSAPP", "BRASIL", "FUTEBOL", "CHOCOLATE", "PIZZA",
                "MUSICA", "CINEMA", "ESCOLA", "TRABALHO", "FAMILIA",
                "AMIZADE", "VIAGEM", "DINHEIRO", "SAUDE", "FELICIDADE"
            ];

            const palavra = palavras[Math.floor(Math.random() * palavras.length)];
            const palavraOculta = palavra.replace(/./g, "_ ");
            const erros = 0;
            const letrasUsadas = [];

            // Salva o jogo em um sistema simples (pode ser expandido)
            global.jogoDaForca = global.jogoDaForca || {};
            global.jogoDaForca[from] = {
                palavra: palavra,
                palavraOculta: palavraOculta,
                erros: erros,
                letrasUsadas: letrasUsadas,
                ativo: true
            };

            const desenhos = [
                "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
                "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```"
            ];

            await reply(sock, from,
                `🎯 *JOGO DA FORCA INICIADO!*\n\n` +
                `${desenhos[0]}\n\n` +
                `📝 Palavra: ${palavraOculta}\n` +
                `❌ Erros: ${erros}/6\n` +
                `🔤 Letras usadas: Nenhuma\n\n` +
                `💡 Digite uma letra para tentar adivinhar!\n` +
                `⚠️ Apenas letras A-Z são aceitas`
            );
        }
        break;

        case "jogodavelha": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;
            const oponente = obterTargetGamer(message);

            if (!oponente) {
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para jogar!\n\nExemplo: ${config.prefix}jogodavelha @usuario`);
                break;
            }

            if (oponente === sender) {
                await reply(sock, from, "❌ Você não pode jogar contra si mesmo!");
                break;
            }

            // Inicializa o jogo
            global.jogoDaVelha = global.jogoDaVelha || {};
            global.jogoDaVelha[from] = {
                jogador1: sender,
                jogador2: oponente,
                vezDe: sender,
                tabuleiro: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"],
                ativo: true
            };

            const tabuleiro =
                `${global.jogoDaVelha[from].tabuleiro[0]} ${global.jogoDaVelha[from].tabuleiro[1]} ${global.jogoDaVelha[from].tabuleiro[2]}\n` +
                `${global.jogoDaVelha[from].tabuleiro[3]} ${global.jogoDaVelha[from].tabuleiro[4]} ${global.jogoDaVelha[from].tabuleiro[5]}\n` +
                `${global.jogoDaVelha[from].tabuleiro[6]} ${global.jogoDaVelha[from].tabuleiro[7]} ${global.jogoDaVelha[from].tabuleiro[8]}`;

            await reply(sock, from,
                `⭕ *JOGO DA VELHA INICIADO!*\n\n` +
                `👤 **Jogador 1:** @${sender.split('@')[0]} (❌)\n` +
                `👤 **Jogador 2:** @${oponente.split('@')[0]} (⭕)\n\n` +
                `🎲 **Tabuleiro:**\n${tabuleiro}\n\n` +
                `🎯 **Vez de:** @${sender.split('@')[0]}\n\n` +
                `💡 **Como jogar:** Digite o número de 1 a 9 para marcar sua posição`,
                [sender, oponente]
            );
        }
        break;

        case "resetjogodavelha": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;

            if (!global.jogoDaVelha || !global.jogoDaVelha[from]) {
                await reply(sock, from, "❌ Não há jogo da velha ativo neste grupo.");
                break;
            }

            // Verifica se é um dos jogadores ou admin
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);
            const ehJogador = global.jogoDaVelha[from].jogador1 === sender || global.jogoDaVelha[from].jogador2 === sender;

            if (ehJogador || ehAdmin || ehDono) {
                delete global.jogoDaVelha[from];
                await reply(sock, from, "🔄 *JOGO DA VELHA RESETADO!*\n\nO jogo foi finalizado e pode ser iniciado novamente.");
                await reagirMensagem(sock, message, "✅");
            } else {
                await reply(sock, from, "❌ Apenas os jogadores participantes ou admins podem resetar o jogo.");
            }
        }
        break;

        // ================== COMANDOS EXTRAS ==================

        case "rankfumante": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 🚬`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/qYDN9Q7z/70c6ff9e2b8b8ae8a5b6f4a3e8c2e42a.jpg" },
                    caption: `🚬 *RANKING DOS FUMANTES*\n\n${ranking}\n\n💨 Os viciados em nicotina! 🚭`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "rankpobre": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 💸`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/1G69wkJD/d32b5cfe067aa82bf2a5356c39499539.jpg" },
                    caption: `💸 *RANKING DOS POBRES*\n\n${ranking}\n\n🪙 Os sem dinheiro! 💰`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        case "ranksad": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants.map(p => p.id);

                const shuffled = [...participants].sort(() => Math.random() - 0.5);
                let ranking = shuffled.slice(0, Math.min(10, participants.length)).map((participant, index) => {
                    const percentage = Math.floor(Math.random() * 100) + 1;
                    return `${index + 1}. @${participant.split('@')[0]} - ${percentage}% 😭`;
                }).join('\n');

                await sock.sendMessage(from, {
                    image: { url: "https://i.ibb.co/9mtKb5rC/92e9188040a0728af1a49c61dd0c9279.jpg" },
                    caption: `😭 *RANKING DOS TRISTES*\n\n${ranking}\n\n💔 Os deprimidos! 😢`,
                    mentions: participants
                });
            } catch (err) {
                await reply(sock, from, "❌ Erro ao gerar ranking.");
            }
        }
        break;

        // ================== RODAR WORKFLOWS ==================

        case "roletarussa": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;
            const oponente = obterTargetGamer(message);

            if (!oponente) {
                await reply(sock, from, `❌ Marque alguém (@) ou responda a mensagem de alguém para jogar roleta russa!\n\nExemplo: ${config.prefix}roletarussa @usuario`);
                break;
            }

            if (oponente === sender) {
                await reply(sock, from, "❌ Você não pode jogar roleta russa contra si mesmo!");
                break;
            }

            // Inicializa o jogo
            global.roletaRussa = global.roletaRussa || {};
            global.roletaRussa[from] = {
                jogador1: sender,
                jogador2: oponente,
                vezDe: sender,
                balaPosition: Math.floor(Math.random() * 6) + 1, // Posição da bala (1-6)
                tiroAtual: 1,
                ativo: true
            };

            await reply(sock, from,
                `🔫 *ROLETA RUSSA INICIADA!*\n\n` +
                `👤 **Jogadores:**\n` +
                `🎯 @${sender.split('@')[0]}\n` +
                `🎯 @${oponente.split('@')[0]}\n\n` +
                `💀 **Regras:**\n` +
                `• Há 1 bala em 6 câmaras\n` +
                `• Digite \`.disparar\` para atirar\n` +
                `• Quem pegar a bala... 💀\n\n` +
                `🎲 **Vez de:** @${sender.split('@')[0]}\n` +
                `🔫 **Tiro:** 1/6`,
                [sender, oponente]
            );
        }
        break;

        case "disparar": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;

            if (!global.roletaRussa || !global.roletaRussa[from]) {
                await reply(sock, from, "❌ Não há jogo de roleta russa ativo neste grupo. Use `.roletarussa @usuario` para começar.");
                break;
            }

            const jogo = global.roletaRussa[from];

            // Verifica se é a vez do jogador
            if (jogo.vezDe !== sender) {
                const vezDeNome = jogo.vezDe === jogo.jogador1 ? jogo.jogador1.split('@')[0] : jogo.jogador2.split('@')[0];
                await reply(sock, from, `❌ Não é sua vez! É a vez de @${vezDeNome}`, [jogo.vezDe]);
                break;
            }

            // Verifica se pegou a bala
            if (jogo.tiroAtual === jogo.balaPosition) {
                // MORTE!
                delete global.roletaRussa[from];
                
                // Envia GIF usando método correto (vídeo com gifPlayback)
                const gifEnviado = await enviarGif(
                    sock,
                    from,
                    "https://i.ibb.co/DgWJjj0K/58712ef364b6fdef5ae9bcbb48fc0fdb.gif",
                    `💀 *BANG! VOCÊ MORREU!* 💀\n\n@${sender.split('@')[0]} pegou a bala! 🔫💥\n\n⚰️ Game Over! RIP...\n\n🏆 **Vencedor:** @${jogo.vezDe === jogo.jogador1 ? jogo.jogador2.split('@')[0] : jogo.jogador1.split('@')[0]}`,
                    [jogo.jogador1, jogo.jogador2],
                    message
                );
                
                if (!gifEnviado) {
                    // Fallback para texto se o GIF falhar
                    await reply(sock, from, `💀 *BANG! VOCÊ MORREU!* 💀\n\n@${sender.split('@')[0]} pegou a bala! 🔫💥\n\n⚰️ Game Over! RIP...\n\n🏆 **Vencedor:** @${jogo.vezDe === jogo.jogador1 ? jogo.jogador2.split('@')[0] : jogo.jogador1.split('@')[0]}`, [jogo.jogador1, jogo.jogador2]);
                }
                
                await reagirMensagem(sock, message, "💀");
                break;
            }

            // Seguro! Próximo jogador
            jogo.tiroAtual++;
            jogo.vezDe = jogo.vezDe === jogo.jogador1 ? jogo.jogador2 : jogo.jogador1;

            const proximoJogador = jogo.vezDe.split('@')[0];

            await reply(sock, from,
                `🔫 *CLICK!* Você teve sorte!\n\n` +
                `✅ @${sender.split('@')[0]} sobreviveu!\n\n` +
                `🎲 **Vez de:** @${proximoJogador}\n` +
                `🔫 **Tiro:** ${jogo.tiroAtual}/6\n\n` +
                `💡 Digite \`.disparar\` para atirar`,
                [jogo.jogador1, jogo.jogador2]
            );

            await reagirMensagem(sock, message, "😅");
        }
        break;

        case "resetroleta": {
            // Verifica se modo gamer está ativo
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const config = antiSpam.carregarConfigGrupo(from);
            if (!config || !config.modogamer) {
                await reply(sock, from, "❌ Modo Gamer está desativado neste grupo! Use `.modogamer on` para ativar.");
                break;
            }

            const sender = message.key.participant || from;

            if (!global.roletaRussa || !global.roletaRussa[from]) {
                await reply(sock, from, "❌ Não há jogo de roleta russa ativo neste grupo.");
                break;
            }

            // Verifica se é um dos jogadores ou admin
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);
            const ehJogador = global.roletaRussa[from].jogador1 === sender || global.roletaRussa[from].jogador2 === sender;

            if (ehJogador || ehAdmin || ehDono) {
                delete global.roletaRussa[from];
                await reply(sock, from, "🔄 *ROLETA RUSSA RESETADA!*\n\nO jogo foi finalizado e pode ser iniciado novamente.");
                await reagirMensagem(sock, message, "✅");
            } else {
                await reply(sock, from, "❌ Apenas os jogadores participantes ou admins podem resetar o jogo.");
            }
        }
        break;

        case "promover": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            // Verifica se há usuário mencionado ou mensagem marcada
            let targetUser = null;
            
            if (message.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                // Se mencionou alguém
                targetUser = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                // Se marcou uma mensagem, pega o autor da mensagem
                targetUser = message.message.extendedTextMessage.contextInfo.participant;
            } else {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use o comando marcando uma mensagem ou mencionando alguém!\n\nExemplo: ${config.prefix}promover @usuario`);
                break;
            }

            if (!targetUser) {
                await reply(sock, from, "❌ Usuário não identificado.");
                break;
            }

            // Verifica se o usuário já é admin
            const jaEhAdmin = await isAdmin(sock, from, targetUser);
            if (jaEhAdmin) {
                await reply(sock, from, `⚠️ @${targetUser.split('@')[0]} já é administrador do grupo!`, [targetUser]);
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");
                await sock.groupParticipantsUpdate(from, [targetUser], "promote");
                await reagirMensagem(sock, message, "⬆️");
                await reply(sock, from, `⬆️ *USUÁRIO PROMOVIDO!*\n\n✅ @${targetUser.split('@')[0]} agora é administrador do grupo!\n\n👤 Promovido por: @${sender.split('@')[0]}`, [targetUser, sender]);
                console.log(`⬆️ Usuário ${targetUser.split('@')[0]} promovido a admin por ${sender.split('@')[0]} no grupo ${from}`);
            } catch (err) {
                console.error("❌ Erro ao promover usuário:", err);
                await reagirMensagem(sock, message, "❌");
                
                // Detecta o tipo de erro e dá mensagem específica
                const errorMsg = err.message || err.toString();
                if (errorMsg.includes('forbidden') || errorMsg.includes('not-authorized') || errorMsg.includes('401')) {
                    await reply(sock, from, "❌ *BOT NÃO É ADMIN*\n\n⚠️ Preciso ser administrador do grupo para promover usuários!\n\n📝 Peça para um admin me promover primeiro.");
                } else if (errorMsg.includes('participant-not-found') || errorMsg.includes('404')) {
                    await reply(sock, from, "❌ Usuário não encontrado no grupo.");
                } else {
                    await reply(sock, from, `❌ Erro ao promover usuário.\n\n🔍 Detalhes: ${errorMsg.substring(0, 100)}`);
                }
            }
        }
        break;

        case "rebaixar": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            // Verifica se há usuário mencionado ou mensagem marcada
            let targetUser = null;
            
            if (message.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                // Se mencionou alguém
                targetUser = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                // Se marcou uma mensagem, pega o autor da mensagem
                targetUser = message.message.extendedTextMessage.contextInfo.participant;
            } else {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Use o comando marcando uma mensagem ou mencionando alguém!\n\nExemplo: ${config.prefix}rebaixar @usuario`);
                break;
            }

            if (!targetUser) {
                await reply(sock, from, "❌ Usuário não identificado.");
                break;
            }

            // Verifica se o usuário é admin
            const ehAdminTarget = await isAdmin(sock, from, targetUser);
            if (!ehAdminTarget) {
                await reply(sock, from, `⚠️ @${targetUser.split('@')[0]} não é administrador do grupo!`, [targetUser]);
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");
                await sock.groupParticipantsUpdate(from, [targetUser], "demote");
                await reagirMensagem(sock, message, "⬇️");
                await reply(sock, from, `⬇️ *USUÁRIO REBAIXADO!*\n\n✅ @${targetUser.split('@')[0]} não é mais administrador do grupo!\n\n👤 Rebaixado por: @${sender.split('@')[0]}`, [targetUser, sender]);
                console.log(`⬇️ Usuário ${targetUser.split('@')[0]} rebaixado por ${sender.split('@')[0]} no grupo ${from}`);
            } catch (err) {
                console.error("❌ Erro ao rebaixar usuário:", err);
                await reagirMensagem(sock, message, "❌");
                
                // Detecta o tipo de erro e dá mensagem específica
                const errorMsg = err.message || err.toString();
                if (errorMsg.includes('forbidden') || errorMsg.includes('not-authorized') || errorMsg.includes('401')) {
                    await reply(sock, from, "❌ *BOT NÃO É ADMIN*\n\n⚠️ Preciso ser administrador do grupo para rebaixar usuários!\n\n📝 Peça para um admin me promover primeiro.");
                } else if (errorMsg.includes('participant-not-found') || errorMsg.includes('404')) {
                    await reply(sock, from, "❌ Usuário não encontrado no grupo.");
                } else {
                    await reply(sock, from, `❌ Erro ao rebaixar usuário.\n\n🔍 Detalhes: ${errorMsg.substring(0, 100)}`);
                }
            }
        }
        break;

        case "seradmin": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehDono = isDono(sender);

            // Apenas o dono do bot pode usar
            if (!ehDono) {
                await reply(sock, from, "❌ Apenas o dono do bot pode usar este comando.");
                break;
            }

            // Verifica se o dono já é admin
            const jaEhAdmin = await isAdmin(sock, from, sender);
            if (jaEhAdmin) {
                await reply(sock, from, `⚠️ Você já é administrador deste grupo!`);
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");
                
                // Promove o dono a admin
                await sock.groupParticipantsUpdate(from, [sender], "promote");
                
                await reagirMensagem(sock, message, "👑");
                await reply(sock, from, `👑 *DONO PROMOVIDO!*\n\n✅ Você agora é administrador do grupo!\n\n🔐 Privilégio exclusivo do dono do bot\n\n© NEEXT LTDA`);
                console.log(`👑 Dono ${sender.split('@')[0]} se auto-promoveu a admin no grupo ${from}`);
            } catch (err) {
                console.error("❌ Erro ao promover dono:", err);
                await reagirMensagem(sock, message, "❌");
                
                const errorMsg = err.message || err.toString();
                if (errorMsg.includes('forbidden') || errorMsg.includes('not-authorized') || errorMsg.includes('401')) {
                    await reply(sock, from, "❌ *BOT NÃO É ADMIN*\n\n⚠️ O bot precisa ser administrador do grupo para te promover!\n\n📝 Peça para um admin promover o bot primeiro.");
                } else if (errorMsg.includes('participant-not-found') || errorMsg.includes('404')) {
                    await reply(sock, from, "❌ Você não está participando deste grupo.");
                } else {
                    await reply(sock, from, `❌ Erro ao promover.\n\n🔍 Detalhes: ${errorMsg.substring(0, 100)}`);
                }
            }
        }
        break;

        case "sair": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehDono = isDono(sender);

            // Apenas o dono do bot pode usar
            if (!ehDono) {
                await reply(sock, from, "❌ Apenas o dono do bot pode usar este comando.");
                break;
            }

            try {
                await reagirMensagem(sock, message, "👋");
                
                // Mensagem de despedida
                await reply(sock, from, `👋 *SAINDO DO GRUPO*\n\n🤖 Bot está saindo do grupo por ordem do dono\n\n© NEEXT LTDA`);
                
                // Aguarda 2 segundos e sai do grupo
                await new Promise(resolve => setTimeout(resolve, 2000));
                await sock.groupLeave(from);
                
                console.log(`👋 Bot saiu do grupo ${from} por ordem do dono ${sender.split('@')[0]}`);
            } catch (err) {
                console.error("❌ Erro ao sair do grupo:", err);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, `❌ Erro ao sair do grupo.\n\n🔍 Detalhes: ${err.message || err.toString()}`);
            }
        }
        break;

        case "transmissão":
        case "transmissao": {
            const sender = message.key.participant || from;
            const ehDono = isDono(sender);

            if (!ehDono) {
                await reply(sock, from, "❌ Apenas o dono pode usar este comando.");
                break;
            }

            const mensagem = args.join(' ').trim();
            if (!mensagem) {
                const config = obterConfiguracoes();
                await reply(sock, from, `❌ Digite a mensagem para transmitir!\n\nExemplo: ${config.prefix}transmissão Olá pessoal! Esta é uma mensagem importante.`);
                break;
            }

            try {
                await reagirMensagem(sock, message, "⏳");

                // Busca todos os grupos que o bot participa
                const allGroups = await sock.groupFetchAllParticipating();
                const groups = Object.keys(allGroups).filter(id => id.endsWith('@g.us'));
                
                if (groups.length === 0) {
                    await reply(sock, from, "❌ O bot não está em nenhum grupo para transmitir.");
                    break;
                }

                const config = obterConfiguracoes();
                const nomeTransmissor = config.nickDoDono;

                let sucessos = 0;
                let falhas = 0;

                for (const groupId of groups) {
                    try {
                        const mensagemTransmissao = `📢 *TRANSMISSÃO OFICIAL*\n\n` +
                                                   `📝 *Mensagem:* ${mensagem}\n\n` +
                                                   `👤 *Enviado por:* ${nomeTransmissor}\n` +
                                                   `🤖 *Via:* NEEXT BOT\n\n` +
                                                   `© NEEXT LTDA`;

                        await sock.sendMessage(groupId, {
                            text: mensagemTransmissao,
                            contextInfo: {
                                forwardingScore: 100000,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363289739581116@newsletter",
                                    newsletterName: "🐦‍🔥⃝ 𝆅࿙⵿ׂ𝆆𝝢𝝣𝝣𝝬𝗧𓋌𝗟𝗧𝗗𝗔⦙⦙ꜣྀ"
                                },
                                externalAdReply: {
                                    title: "📢 TRANSMISSÃO OFICIAL",
                                    body: `© NEEXT LTDA • ${nomeTransmissor}`,
                                    thumbnailUrl: "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
                                    mediaType: 1,
                                    sourceUrl: "https://www.neext.online"
                                }
                            }
                        });

                        sucessos++;
                        console.log(`📢 Transmissão enviada para grupo: ${groupId}`);

                        // Rate limiting - aguarda entre envios para evitar spam/rate limits
                        await new Promise(resolve => setTimeout(resolve, 1500));

                    } catch (err) {
                        console.error(`❌ Erro ao enviar transmissão para ${groupId}:`, err);
                        falhas++;
                    }
                }

                await reagirMensagem(sock, message, "✅");
                await reply(sock, from, 
                    `✅ *TRANSMISSÃO CONCLUÍDA!*\n\n` +
                    `📊 *Estatísticas:*\n` +
                    `✅ **Sucessos:** ${sucessos} grupos\n` +
                    `❌ **Falhas:** ${falhas} grupos\n` +
                    `📱 **Total:** ${groups.length} grupos\n\n` +
                    `📝 **Mensagem:** ${mensagem}\n\n` +
                    `© NEEXT LTDA`
                );

                console.log(`📢 Transmissão concluída: ${sucessos} sucessos, ${falhas} falhas de ${groups.length} grupos`);

            } catch (err) {
                console.error("❌ Erro na transmissão:", err);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao realizar transmissão. Tente novamente.");
            }
        }
        break;

        // COMANDO DE TESTE DO WELCOME - TEMPORÁRIO
        case "testwelcome": {
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                console.log(`🧪 [TEST-WELCOME] Iniciando teste do welcome no grupo ${from}`);
                
                // Verifica configuração atual
                const config = welcomeSystem.obterConfig(from);
                console.log(`🧪 [TEST-WELCOME] Config atual:`, config);
                
                // Verifica se está ativo
                const ativo = welcomeSystem.isWelcomeAtivo(from);
                console.log(`🧪 [TEST-WELCOME] Welcome ativo: ${ativo}`);
                
                if (!ativo) {
                    await reply(sock, from, `❌ *WELCOME INATIVO*\n\nO sistema está desativado para este grupo.\n\n🔧 Use \`.welcome1 on\` para ativar`);
                    break;
                }
                
                console.log(`🧪 [TEST-WELCOME] Simulando entrada de ${sender} no grupo`);
                
                // Simula um evento de entrada
                const sucesso = await welcomeSystem.processarWelcome(sock, from, sender);
                
                if (sucesso) {
                    await reagirMensagem(sock, message, "✅");
                    await reply(sock, from, `✅ *TESTE DO WELCOME EXECUTADO*\n\n🧪 Simulei sua entrada no grupo\n✅ Welcome enviado com sucesso!\n\n📋 Configuração atual:\n• Ativo: ${ativo}\n• Mensagem: "${config?.mensagem || 'Padrão'}"\n• Descrição: "${config?.descricao || 'Vazia'}"`);
                } else {
                    await reagirMensagem(sock, message, "❌");
                    await reply(sock, from, `❌ *TESTE FALHOU*\n\n🧪 O welcome não conseguiu enviar a mensagem\n📋 Verifique os logs do console para mais detalhes\n\n🔧 Configuração atual:\n• Ativo: ${ativo}\n• Mensagem: "${config?.mensagem || 'Não configurada'}"`);
                }
                
            } catch (error) {
                console.error("❌ Erro no teste welcome:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, `❌ Erro ao testar welcome: ${error.message}`);
            }
        }
        break;

        case "ban":
        case "banir": {
            // Só funciona em grupos
            if (!from.endsWith('@g.us') && !from.endsWith('@lid')) {
                await reply(sock, from, "❌ Este comando só pode ser usado em grupos.");
                break;
            }

            const sender = message.key.participant || from;
            const ehAdmin = await isAdmin(sock, from, sender);
            const ehDono = isDono(sender);

            if (!ehAdmin && !ehDono) {
                await reply(sock, from, "❌ Apenas admins podem usar este comando.");
                break;
            }

            try {
                let userToBan = null;
                
                // 1. Verifica se há menção direta no texto (@user)
                const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                if (mentioned && mentioned.length > 0) {
                    userToBan = mentioned[0];
                }
                
                // 2. Se não tem menção, verifica se está marcando uma mensagem
                if (!userToBan && quoted) {
                    userToBan = message.message.extendedTextMessage?.contextInfo?.participant;
                }

                if (!userToBan) {
                    const config = obterConfiguracoes();
                    await reply(sock, from, `❌ *USO INCORRETO*\n\n📝 Como usar:\n• Marque a mensagem da pessoa e digite ${config.prefix}ban\n• Ou mencione: ${config.prefix}ban @user`);
                    break;
                }

                // Verifica se não está tentando banir admin
                const targetIsAdmin = await isAdmin(sock, from, userToBan);
                if (targetIsAdmin) {
                    await reply(sock, from, "❌ Não posso banir administradores do grupo.");
                    break;
                }

                // Verifica se não está tentando banir o dono
                if (isDono(userToBan)) {
                    await reply(sock, from, "❌ Não posso banir o dono do bot.");
                    break;
                }

                await reagirMensagem(sock, message, "⏳");

                // Tenta banir o usuário diretamente
                try {
                    await sock.groupParticipantsUpdate(from, [userToBan], "remove");
                    await reagirMensagem(sock, message, "✅");
                    await reply(sock, from, `⚔️ *USUÁRIO BANIDO*\n\n@${userToBan.split('@')[0]} foi removido do grupo!\n\n👤 Banido por: @${sender.split('@')[0]}\n⏰ ${new Date().toLocaleString('pt-BR')}`, [userToBan, sender]);
                    console.log(`✅ Usuário ${userToBan.split('@')[0]} banido com sucesso por ${sender.split('@')[0]}`);
                } catch (banError) {
                    console.error("❌ Erro ao banir:", banError);
                    await reagirMensagem(sock, message, "❌");
                    
                    const errorMsg = banError.message || banError.toString();
                    if (errorMsg.includes('forbidden') || errorMsg.includes('not-authorized') || errorMsg.includes('401')) {
                        await reply(sock, from, "❌ *BOT NÃO É ADMIN*\n\n⚠️ Preciso ser administrador do grupo para banir usuários!\n\n📝 Peça para um admin me promover primeiro.");
                    } else if (errorMsg.includes('participant-not-found') || errorMsg.includes('404')) {
                        await reply(sock, from, "❌ Usuário não encontrado no grupo.");
                    } else {
                        await reply(sock, from, `❌ *FALHA AO BANIR*\n\n⚠️ Não foi possível remover o usuário\n\n🔍 Detalhes: ${errorMsg.substring(0, 80)}`);
                    }
                }
                
            } catch (error) {
                console.error("❌ Erro no comando ban:", error);
                await reagirMensagem(sock, message, "❌");
                await reply(sock, from, "❌ Erro ao processar comando. Tente novamente.");
            }
        }
        break;

        default: {
            // Verifica se é um comando hentai
            if (hentai.isHentaiCommand(command)) {
                const sender = message.key.participant || from;
                await hentai.handleHentaiCommand(sock, command, from, sender, message, reply);
                break;
            }
            
            // Comando não encontrado - mensagem com visual personalizado
            const config = obterConfiguracoes();
            
            await reply(sock, from, `╭⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╮
│╭─━─⋆｡°✩🛑✩°｡⋆ ━─━╮
││￫ 𝑪𝑶𝑴𝑨𝑵𝑫𝑶 𝑵𝑨̃𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶 ❌
││
││📝 𝑪𝑶𝑴𝑨𝑵𝑫𝑶: ${config.prefix}${command}
││💡 𝑼𝑺𝑬: ${config.prefix}menu para ver todos os comandos
│╰─━─⋆｡°✩🛑✩°｡⋆ ━─━╯
╰⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓⎔⎓╯`);
        }
        break;
    }
}

// Função para configurar os listeners do bot
function setupListeners(sock) {
    // Remove listeners anteriores para evitar duplicação
    sock.ev.removeAllListeners('messages.upsert');
    sock.ev.removeAllListeners('group-participants.update');
    sock.ev.removeAllListeners('call');
    
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const message of messages) {
            try {
                // Ignora mensagens próprias
                if (message.key.fromMe) continue;
                
                // Verifica se já foi processada
                const messageId = message.key.id;
                if (processedMessages.has(messageId)) continue;
                processedMessages.add(messageId);
                
                // Log da mensagem recebida
                const from = message.key.remoteJid;
                const isGroup = from.endsWith('@g.us');
                const sender = isGroup ? message.key.participant : from;
                const messageText = getMessageText(message.message);
                
                logMensagem(message, messageText, false, sock);
                
                // Marca mensagem como visualizada (tanto PV quanto grupos)
                try {
                    await sock.readMessages([message.key]);
                } catch (err) {
                    // Silencioso - ignora erro ao marcar como lida
                }
                
                // Normaliza a mensagem
                const { normalized, quoted } = normalizeMessage(message);
                
                // Verifica antipv (bloqueio de PV para não-donos)
                if (!isGroup) {
                    delete require.cache[require.resolve('./settings/settings.json')];
                    const config = require('./settings/settings.json');
                    
                    if (config.antipv) {
                        const ehDono = isDono(sender);
                        const senderLid = sender.split('@')[0].split(':')[0];
                        
                        if (!ehDono) {
                            console.log(`🚫 PV bloqueado: ${senderLid} (ANTIPV ativo - não é dono)`);
                            continue; // Ignora completamente mensagens de PV de não-donos
                        } else {
                            console.log(`✅ PV liberado: ${senderLid} (é dono)`);
                        }
                    }
                }

                // Processa anti-spam primeiro
                const bloqueado = await processarAntiSpam(sock, normalized);
                if (bloqueado) continue;

                // Rastreamento de atividades para ranking (apenas em grupos)
                if (isGroup) {
                    const configGrupo = antiSpam.carregarConfigGrupo(from);
                    if (configGrupo && configGrupo.rankativo) {
                        // Determina o tipo de atividade
                        let tipoAtividade = '';
                        
                        // Verifica se é sticker
                        if (normalized.message.stickerMessage) {
                            tipoAtividade = 'sticker';
                        }
                        // Verifica se é mídia (foto, vídeo, áudio)
                        else if (normalized.message.imageMessage || normalized.message.videoMessage || 
                                normalized.message.audioMessage || normalized.message.documentMessage) {
                            tipoAtividade = 'midia';
                        }
                        // Se tem texto, é mensagem
                        else if (messageText && messageText.trim()) {
                            // Verifica se vai ser um comando
                            const config = obterConfiguracoes();
                            const prefix = config.prefix;
                            if (messageText.trim().startsWith(prefix)) {
                                tipoAtividade = 'comando';
                            } else {
                                tipoAtividade = 'mensagem';
                            }
                        }

                        // Registra a atividade se foi identificada
                        if (tipoAtividade) {
                            rankAtivo.registrarAtividade(from, sender, tipoAtividade);
                            // console.log(`📊 Atividade registrada: ${sender.split('@')[0]} -> ${tipoAtividade} no grupo ${from.split('@')[0]}`);
                        }
                    }
                }
                
                // Extrai texto da mensagem
                const text = messageText.trim();
                if (!text) continue;
                
                // Verifica se é comando
                const config = obterConfiguracoes();
                const prefix = config.prefix;
                
                if (text.startsWith(prefix)) {
                    const args = text.slice(prefix.length).trim().split(/ +/);
                    const command = args.shift().toLowerCase();
                    
                    logMensagem(message, text, true, sock);
                    
                    // Executa o comando
                    await handleCommand(sock, normalized, command, args, from, quoted);
                } else {
                    // Processa mensagens que não são comandos
                    if (text.toLowerCase() === 'prefixo') {
                        await reply(sock, from, `🤖 *Prefixo atual:* \`${prefix}\`\n\n💡 Use ${prefix}menu para ver os comandos disponíveis.`);
                    }
                    
                    // Sistema de respostas do Akinator (novo sistema)
                    if (akinator.jogosAtivos.has(sender)) {
                        const respostaNum = parseInt(text.trim());
                        
                        if (!isNaN(respostaNum) && respostaNum >= 1 && respostaNum <= 5) {
                            await reagirMensagem(sock, normalized, "⏳");
                            const resultado = await akinator.responderAkinator(sender, text.trim());
                            
                            if (resultado.success) {
                                if (resultado.isWin && resultado.photo) {
                                    try {
                                        await sock.sendMessage(from, {
                                            image: { url: resultado.photo },
                                            caption: resultado.message
                                        });
                                        await reagirMensagem(sock, normalized, "🎉");
                                    } catch (err) {
                                        console.log("⚠️ Erro ao enviar imagem do Akinator, enviando texto:", err.message);
                                        await reply(sock, from, resultado.message);
                                    }
                                } else {
                                    await reply(sock, from, resultado.message);
                                    if (!resultado.isWin) {
                                        await reagirMensagem(sock, normalized, "🔮");
                                    }
                                }
                            } else {
                                await reply(sock, from, resultado.message);
                                await reagirMensagem(sock, normalized, "❌");
                            }
                        }
                    }
                    
                    // Sistema de verificação do Anagrama
                    if (anagramaAtivo[from] && anagramaPalavraAtual[from]) {
                        const respostaUsuario = text.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const palavraCorreta = anagramaPalavraAtual[from].palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        
                        if (respostaUsuario === palavraCorreta) {
                            // Acertou!
                            await reagirMensagem(sock, normalized, "🎉");
                            await reply(sock, from, 
                                `🎉 *PARABÉNS! VOCÊ ACERTOU!* 🎉\n\n` +
                                `✅ Resposta correta: *${anagramaPalavraAtual[from].palavra}*\n` +
                                `🏆 @${sender.split('@')[0]} descobriu a palavra!\n\n` +
                                `💡 O anagrama era: *${anagramaPalavraAtual[from].anagrama}*\n` +
                                `📝 Dica: *${anagramaPalavraAtual[from].dica}*`,
                                [sender]
                            );
                            
                            // Carrega a próxima palavra automaticamente
                            try {
                                const anagramaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'anagrama.json'), 'utf8'));
                                const palavras = anagramaData.palavras;
                                
                                if (palavras && palavras.length > 0) {
                                    const palavraObj = palavras[Math.floor(Math.random() * palavras.length)];
                                    const palavraOriginal = palavraObj.palavra.toUpperCase();
                                    const dica = palavraObj.dica.toUpperCase();
                                    let anagrama = embaralharPalavra(palavraOriginal);
                                    
                                    while (anagrama === palavraOriginal && palavraOriginal.length > 3) {
                                        anagrama = embaralharPalavra(palavraOriginal);
                                    }

                                    anagramaPalavraAtual[from] = {
                                        palavra: palavraOriginal,
                                        dica: dica,
                                        anagrama: anagrama
                                    };

                                    const botConfig = obterConfiguracoes();
                                    const mensagem = `╭━━ ⪩ 「 *Próxima palavra* 」\n❏ ⌁ ⚠︎ Anagrama: *${anagrama}*\n❏ ⌁ ⚠︎ Dica: *${dica}*\n❏ ⌁ ⚠︎ Bot *${botConfig.nomeDoBot}* - ANAGRAMA \n╰━━━ ⪨`;

                                    const sentMsg = await sock.sendMessage(from, { text: mensagem });
                                    anagramaMessageId[from] = sentMsg.key.id;
                                } else {
                                    await reply(sock, from, "✅ Parabéns! O jogo de anagrama foi finalizado.");
                                    delete anagramaAtivo[from];
                                    delete anagramaPalavraAtual[from];
                                    delete anagramaMessageId[from];
                                }
                            } catch (error) {
                                console.error("Erro ao carregar próxima palavra do anagrama:", error);
                                await reply(sock, from, "✅ Parabéns! O jogo de anagrama foi finalizado.");
                                delete anagramaAtivo[from];
                                delete anagramaPalavraAtual[from];
                                delete anagramaMessageId[from];
                            }
                        } else {
                            // Errou!
                            await reagirMensagem(sock, normalized, "❌");
                            await reply(sock, from, 
                                `❌ *RESPOSTA INCORRETA!*\n\n` +
                                `💭 Você respondeu: *${text.trim().toUpperCase()}*\n` +
                                `✅ Resposta correta era: *${anagramaPalavraAtual[from].palavra}*\n\n` +
                                `💡 O anagrama era: *${anagramaPalavraAtual[from].anagrama}*\n` +
                                `📝 Dica: *${anagramaPalavraAtual[from].dica}*`
                            );
                            
                            // Carrega a próxima palavra automaticamente (mesmo quando erra)
                            try {
                                const anagramaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'database', 'anagrama.json'), 'utf8'));
                                const palavras = anagramaData.palavras;
                                
                                if (palavras && palavras.length > 0) {
                                    const palavraObj = palavras[Math.floor(Math.random() * palavras.length)];
                                    const palavraOriginal = palavraObj.palavra.toUpperCase();
                                    const dica = palavraObj.dica.toUpperCase();
                                    let anagrama = embaralharPalavra(palavraOriginal);
                                    
                                    while (anagrama === palavraOriginal && palavraOriginal.length > 3) {
                                        anagrama = embaralharPalavra(palavraOriginal);
                                    }

                                    anagramaPalavraAtual[from] = {
                                        palavra: palavraOriginal,
                                        dica: dica,
                                        anagrama: anagrama
                                    };

                                    const botConfig = obterConfiguracoes();
                                    const mensagem = `╭━━ ⪩ 「 *Próxima palavra* 」\n❏ ⌁ ⚠︎ Anagrama: *${anagrama}*\n❏ ⌁ ⚠︎ Dica: *${dica}*\n❏ ⌁ ⚠︎ Bot *${botConfig.nomeDoBot}* - ANAGRAMA \n╰━━━ ⪨`;

                                    const sentMsg = await sock.sendMessage(from, { text: mensagem });
                                    anagramaMessageId[from] = sentMsg.key.id;
                                } else {
                                    await reply(sock, from, "✅ O jogo de anagrama foi finalizado.");
                                    delete anagramaAtivo[from];
                                    delete anagramaPalavraAtual[from];
                                    delete anagramaMessageId[from];
                                }
                            } catch (error) {
                                console.error("Erro ao carregar próxima palavra do anagrama:", error);
                                await reply(sock, from, "✅ O jogo de anagrama foi finalizado.");
                                delete anagramaAtivo[from];
                                delete anagramaPalavraAtual[from];
                                delete anagramaMessageId[from];
                            }
                        }
                    }
                    
                    // Sistema de jogadas do Jogo da Velha
                    if (global.jogoDaVelha && global.jogoDaVelha[from] && global.jogoDaVelha[from].ativo) {
                        const jogo = global.jogoDaVelha[from];
                        const jogada = parseInt(text.trim());
                        
                        // Verifica se é um número válido (1-9)
                        if (!isNaN(jogada) && jogada >= 1 && jogada <= 9) {
                            // Verifica se é um dos jogadores
                            if (sender !== jogo.jogador1 && sender !== jogo.jogador2) {
                                await reply(sock, from, "❌ Você não está participando deste jogo!");
                            } else if (sender !== jogo.vezDe) {
                                // Verifica se é a vez do jogador
                                const vezDe = jogo.vezDe === jogo.jogador1 ? jogo.jogador1 : jogo.jogador2;
                                await reply(sock, from, `⏳ Aguarde! É a vez de @${vezDe.split('@')[0]}`, [vezDe]);
                            } else {
                                // Verifica se a posição está livre
                                const posicao = jogada - 1;
                                if (jogo.tabuleiro[posicao] !== `${jogada}️⃣`) {
                                    await reply(sock, from, "❌ Esta posição já está ocupada! Escolha outra.");
                                } else {
                                    // Faz a jogada
                                    const simbolo = sender === jogo.jogador1 ? "❌" : "⭕";
                                    jogo.tabuleiro[posicao] = simbolo;
                                    
                                    // Verifica vitória
                                    const combinacoesVitoria = [
                                        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
                                        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
                                        [0, 4, 8], [2, 4, 6]             // Diagonais
                                    ];
                                    
                                    let vencedor = null;
                                    for (const combo of combinacoesVitoria) {
                                        if (jogo.tabuleiro[combo[0]] === simbolo && 
                                            jogo.tabuleiro[combo[1]] === simbolo && 
                                            jogo.tabuleiro[combo[2]] === simbolo) {
                                            vencedor = sender;
                                            break;
                                        }
                                    }
                                    
                                    // Verifica empate
                                    const empate = !vencedor && jogo.tabuleiro.every(pos => pos === "❌" || pos === "⭕");
                                    
                                    const tabuleiro =
                                        `${jogo.tabuleiro[0]} ${jogo.tabuleiro[1]} ${jogo.tabuleiro[2]}\n` +
                                        `${jogo.tabuleiro[3]} ${jogo.tabuleiro[4]} ${jogo.tabuleiro[5]}\n` +
                                        `${jogo.tabuleiro[6]} ${jogo.tabuleiro[7]} ${jogo.tabuleiro[8]}`;
                                    
                                    if (vencedor) {
                                        await reagirMensagem(sock, normalized, "🎉");
                                        await reply(sock, from,
                                            `🎉 *JOGO DA VELHA - VITÓRIA!*\n\n` +
                                            `🎲 **Tabuleiro Final:**\n${tabuleiro}\n\n` +
                                            `🏆 **VENCEDOR:** @${vencedor.split('@')[0]}\n\n` +
                                            `🎮 Parabéns pela vitória!`,
                                            [vencedor, jogo.jogador1, jogo.jogador2]
                                        );
                                        delete global.jogoDaVelha[from];
                                    } else if (empate) {
                                        await reagirMensagem(sock, normalized, "🤝");
                                        await reply(sock, from,
                                            `🤝 *JOGO DA VELHA - EMPATE!*\n\n` +
                                            `🎲 **Tabuleiro Final:**\n${tabuleiro}\n\n` +
                                            `⚖️ Deu velha! Ninguém venceu.\n\n` +
                                            `🎮 Jogo finalizado!`,
                                            [jogo.jogador1, jogo.jogador2]
                                        );
                                        delete global.jogoDaVelha[from];
                                    } else {
                                        // Alterna a vez
                                        jogo.vezDe = jogo.vezDe === jogo.jogador1 ? jogo.jogador2 : jogo.jogador1;
                                        
                                        await reagirMensagem(sock, normalized, simbolo);
                                        await reply(sock, from,
                                            `⭕ *JOGO DA VELHA*\n\n` +
                                            `🎲 **Tabuleiro:**\n${tabuleiro}\n\n` +
                                            `🎯 **Vez de:** @${jogo.vezDe.split('@')[0]}\n\n` +
                                            `💡 Digite um número de 1 a 9 para jogar`,
                                            [jogo.vezDe]
                                        );
                                    }
                                }
                            }
                        }
                    }
                    
                }
                
            } catch (error) {
                console.error('❌ Erro ao processar mensagem:', error);
            }
        }
    });

    // Listener para atualizações de grupo
    sock.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
        try {
            console.log(`👥 [GROUP-UPDATE] Evento recebido: ${action} - ${participants.length} participante(s) no grupo ${id} por ${author || 'desconhecido'}`);
            
            // Processa lista negra PRIMEIRO
            await processarListaNegra(sock, participants, id, action);
            
            // Processa X9 (monitor de ações de admin)
            const config = antiSpam.carregarConfigGrupo(id);
            
            if (config && config.x9 && (action === 'promote' || action === 'demote' || action === 'remove' || action === 'add')) {
                console.log(`🕵️ [X9] Monitorando ação: ${action} por ${author}`);
                
                try {
                    // Pega metadados do grupo
                    const groupMetadata = await sock.groupMetadata(id);
                    const groupName = groupMetadata.subject || 'Grupo';
                    
                    // Normaliza author - pode vir como string ou objeto
                    const authorId = typeof author === 'string' ? author : (author?.id || 'Sistema');
                    const authorNumber = authorId !== 'Sistema' ? authorId.split('@')[0] : 'Sistema';
                    
                    // Normaliza participants - podem vir como strings ou objetos
                    const normalizedParticipants = participants.map(p => typeof p === 'string' ? p : p?.id);
                    const mentions = authorId !== 'Sistema' ? [authorId, ...normalizedParticipants] : normalizedParticipants;
                    
                    
                    for (const participant of normalizedParticipants) {
                        const participantNumber = participant.split('@')[0];
                        let mensagemX9 = '';
                        
                        switch (action) {
                            case 'promote':
                                mensagemX9 = `🕵️ *X9 MONITOR - PROMOÇÃO*\n\n` +
                                    `👑 *Admin responsável:* @${authorNumber}\n` +
                                    `👤 *Usuário promovido:* @${participantNumber}\n` +
                                    `⬆️ *Ação:* Promovido a Admin\n` +
                                    `📱 *Grupo:* ${groupName}\n` +
                                    `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                    `🔍 Sistema X9 ativo - Monitorando alterações de poder`;
                                break;
                                
                            case 'demote':
                                mensagemX9 = `🕵️ *X9 MONITOR - REBAIXAMENTO*\n\n` +
                                    `👑 *Admin responsável:* @${authorNumber}\n` +
                                    `👤 *Usuário rebaixado:* @${participantNumber}\n` +
                                    `⬇️ *Ação:* Removido de Admin\n` +
                                    `📱 *Grupo:* ${groupName}\n` +
                                    `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                    `🔍 Sistema X9 ativo - Monitorando alterações de poder`;
                                break;
                                
                            case 'remove':
                                mensagemX9 = `🕵️ *X9 MONITOR - REMOÇÃO*\n\n` +
                                    `👑 *Admin responsável:* @${authorNumber}\n` +
                                    `👤 *Usuário removido:* @${participantNumber}\n` +
                                    `🚫 *Ação:* Removido do grupo\n` +
                                    `📱 *Grupo:* ${groupName}\n` +
                                    `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                    `🔍 Sistema X9 ativo - Monitorando ações administrativas`;
                                break;
                                
                            case 'add':
                                mensagemX9 = `🕵️ *X9 MONITOR - ADIÇÃO*\n\n` +
                                    `👑 *Admin responsável:* @${authorNumber}\n` +
                                    `👤 *Usuário adicionado:* @${participantNumber}\n` +
                                    `➕ *Ação:* Adicionado ao grupo\n` +
                                    `📱 *Grupo:* ${groupName}\n` +
                                    `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                    `🔍 Sistema X9 ativo - Monitorando ações administrativas`;
                                break;
                        }
                        
                        // Envia notificação se houver mensagem
                        if (mensagemX9) {
                            await sock.sendMessage(id, {
                                text: mensagemX9,
                                mentions: mentions
                            });
                            console.log(`✅ [X9] Notificação enviada: ${action} por @${authorNumber} - alvo: ${participantNumber}`);
                        }
                    }
                } catch (x9Error) {
                    console.error(`❌ [X9] Erro ao processar X9:`, x9Error);
                }
            }
            
            // Processa welcome para novos membros (após verificar lista negra)
            if (action === 'add') {
                console.log(`🎉 [GROUP-UPDATE] Processando welcome para ${participants.length} novo(s) membro(s)`);
                
                // Aguarda um pouco para garantir que o usuário foi processado
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                for (const participant of participants) {
                    try {
                        console.log(`🎉 [GROUP-UPDATE] Tentando welcome para ${participant}`);
                        
                        // Verifica se o usuário ainda está no grupo (pode ter sido banido)
                        const groupMetadata = await sock.groupMetadata(id);
                        const participantExists = groupMetadata.participants.some(p => p.id === participant);
                        
                        if (participantExists) {
                            console.log(`🎉 [GROUP-UPDATE] Usuário ${participant} confirmado no grupo, processando welcome`);
                            const sucesso = await welcomeSystem.processarWelcome(sock, id, participant);
                            
                            if (sucesso) {
                                console.log(`✅ [GROUP-UPDATE] Welcome enviado com sucesso para ${participant}`);
                            } else {
                                console.log(`❌ [GROUP-UPDATE] Falha no welcome para ${participant}`);
                            }
                        } else {
                            console.log(`⚠️ [GROUP-UPDATE] Usuário ${participant} não está mais no grupo, pulando welcome`);
                        }
                        
                        // Aguarda entre cada processamento
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                    } catch (welcomeError) {
                        console.error(`❌ [GROUP-UPDATE] Erro no welcome para ${participant}:`, welcomeError);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao processar participantes do grupo:', error);
        }
    });

    // Listener para mensagens fixadas/desfixadas (para X9)
    sock.ev.on('messages.update', async (updates) => {
        try {
            for (const update of updates) {
                // Verifica se é uma atualização de pin
                if (update.update?.pinned !== undefined) {
                    const messageId = update.key;
                    const groupId = messageId.remoteJid;
                    
                    // Só processa se for grupo e x9 estiver ativo
                    if (groupId && groupId.endsWith('@g.us')) {
                        const config = antiSpam.carregarConfigGrupo(groupId);
                        
                        if (config && config.x9) {
                            console.log(`📌 [X9] Mensagem ${update.update.pinned ? 'fixada' : 'desfixada'} no grupo ${groupId}`);
                            
                            try {
                                const groupMetadata = await sock.groupMetadata(groupId);
                                const groupName = groupMetadata.subject || 'Grupo';
                                
                                // Tenta pegar informações do autor da ação
                                // Nota: Baileys nem sempre fornece o autor em messages.update
                                const isPinned = update.update.pinned;
                                
                                const mensagemX9 = isPinned
                                    ? `🕵️ *X9 MONITOR - MENSAGEM FIXADA*\n\n` +
                                      `📌 *Ação:* Mensagem fixada\n` +
                                      `📱 *Grupo:* ${groupName}\n` +
                                      `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                      `🔍 Sistema X9 ativo - Monitorando ações administrativas`
                                    : `🕵️ *X9 MONITOR - MENSAGEM DESFIXADA*\n\n` +
                                      `📌 *Ação:* Mensagem desfixada\n` +
                                      `📱 *Grupo:* ${groupName}\n` +
                                      `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n` +
                                      `🔍 Sistema X9 ativo - Monitorando ações administrativas`;
                                
                                await sock.sendMessage(groupId, {
                                    text: mensagemX9
                                });
                                
                                console.log(`✅ [X9] Notificação de ${isPinned ? 'fixação' : 'desfixação'} enviada`);
                            } catch (x9Error) {
                                console.error(`❌ [X9] Erro ao processar fixação de mensagem:`, x9Error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao processar atualização de mensagem:', error);
        }
    });

    // Listener para chamadas (anticall)
    sock.ev.on('call', async ({ content, isGroup, id, from, date, accepted }) => {
        try {
            const config = require('./settings/settings.json');
            
            // Se anticall estiver ativo, rejeita automaticamente
            if (config.anticall && !accepted) {
                console.log(`📞 Chamada rejeitada automaticamente: ${from.split('@')[0]} (ANTICALL ativo)`);
                
                // Rejeita a chamada
                await sock.rejectCall(id, from);
                
                // Log da ação
                console.log(`🚫 Chamada de ${from.split('@')[0]} foi rejeitada pelo ANTICALL`);
                
                // Opcional: notifica o dono sobre a chamada rejeitada
                const donoDM = isDono(from) ? null : settings.numeroDoDono + '@s.whatsapp.net';
                if (donoDM && donoDM !== from) {
                    try {
                        await sock.sendMessage(donoDM, {
                            text: `🚫 *ANTICALL ATIVO*\n\n📞 Chamada rejeitada de: @${from.split('@')[0]}\n⏰ Horário: ${new Date(date).toLocaleString()}\n🛡️ Sistema de proteção funcionando!`,
                            mentions: [from]
                        });
                    } catch (err) {
                        console.log('❌ Erro ao notificar dono sobre chamada rejeitada:', err);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao processar chamada:', error);
        }
    });

    // console.log('🔧 Listeners configurados com sucesso!');
}

// Exporta a função
module.exports = { setupListeners };