const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');

async function downloadMedia(message) {
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
        const tempInput = path.join(__dirname, '..', 'temp_input_' + Date.now() + '.mp4');
        
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
        const tempInput = path.join(__dirname, '..', 'temp_audio_input_' + Date.now() + '.mp3');
        
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_videolento_' + Date.now() + '.mp4');
        
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_videorapido_' + Date.now() + '.mp4');
        
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_videocontrario_' + Date.now() + '.mp4');
        
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_audiolento_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'atempo=0.5'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_audiorapido_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'atempo=2.0'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_grave_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.8,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_grave2_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.7,aresample=44100,bass=g=10'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_esquilo_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*1.5,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_estourar_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'volume=20dB,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|0/-7|20/-7:gain=5'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_bass_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'bass=g=15,dynaudnorm'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_bass2_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'bass=g=20,equalizer=f=60:t=o:w=2:g=10'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_vozmenino_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*1.3,aresample=44100'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_vozrobo_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_vozradio_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'highpass=f=300,lowpass=f=3000'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_vozfantasma_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'asetrate=44100*0.75,aresample=44100,aphaser=in_gain=0.4'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
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
        
        const mediaBuffer = await downloadMedia(quotedMsg);
        const outputPath = path.join(__dirname, '..', 'output_vozdistorcida_' + Date.now() + '.mp3');
        
        await processarAudio(mediaBuffer, outputPath, {
            audioFilter: 'vibrato=f=8:d=0.8,tremolo=f=6:d=0.7'
        });
        
        await sock.sendMessage(from, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            ptt: true
        });
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    } catch (error) {
        console.error('Erro ao processar voz distorcida:', error);
        await sock.sendMessage(from, { text: '❌ Erro ao processar áudio. Marque um áudio/vídeo válido.' });
    }
}

module.exports = {
    videoLento,
    videoRapido,
    videoContrario,
    audioLento,
    audioRapido,
    grave,
    grave2,
    esquilo,
    estourar,
    bass,
    bass2,
    vozMenino,
    vozRobo,
    vozRadio,
    vozFantasma,
    vozDistorcida
};
