// ---------------------------
// Pacotes
// ---------------------------
const cfonts = require("cfonts");

// Cores ANSI
const roxo = '\x1b[35m';
const reset = '\x1b[0m';

// ---------------------------
// Configurações do Bot
// ---------------------------
const settings = require("../../settings/settings.json");
const prefix = settings.prefix || ".";
const botNome = settings.nomeDoBot || "NEEXT BOT";

// ---------------------------
// Banner do bot
// ---------------------------
function mostrarBanner() {
    console.clear();

    // GODDARD com degradê verde limão e azul neon
    const banner = cfonts.render('GODDARD', {
        font: 'block',
        align: 'center',
        colors: ['#BFFF00', '#00FFFF'], // verde limão e azul neon
        background: 'transparent',
        letterSpacing: 1,
        lineHeight: 1,
        space: true,
        gradient: ['#BFFF00', '#00FFFF'],
        transitionGradient: true, // suaviza a transição
        env: 'node'
    });

    console.log(banner.string ? banner.string : banner);

    // Banner secundário com informações do criador e canal
    const banner2 = cfonts.render(
        'CRIADOR: FLASH\nCANAL: https://whatsapp.com/channel/0029Vacb5xJKrWQpjjJgwi1z\nV4.0\nINSTAGRAM: @NEET.TK',
        {
            font: 'console',
            align: 'center',
            colors: ['#BFFF00', '#00FFFF'],
            gradient: ['#BFFF00', '#00FFFF'],
            transitionGradient: true,
            env: 'node'
        }
    );

    console.log(banner2.string ? banner2.string : banner2);
    console.log("\n");
}

// ---------------------------
// Logs simples (sem duplicação e sem criar arquivos)
// ---------------------------
const mensagensRegistradas = new Set();

// Helper para tentar resolver o número de telefone a partir do JID/LID
function resolverNumero(jidCompleto, sock) {
    try {
        if (!jidCompleto || !sock) return null;
        
        // Método 1: Tenta usar decodeJid (Baileys mantém mapeamento LID→WID)
        const decoded = sock.decodeJid ? sock.decodeJid(jidCompleto) : jidCompleto;
        
        // Se temos um número normal (não é LID), extrai ele
        if (decoded && !decoded.includes(':lid')) {
            const numero = decoded.split('@')[0];
            // Verifica se é um número válido (não é grupo, status, etc)
            if (numero && /^\d+$/.test(numero)) {
                return numero;
            }
        }
        
        // Método 2: Busca no mapeamento do authState (lidJidMapping)
        if (sock.authState?.creds?.lidJidMapping?.lidToWid) {
            const mapping = sock.authState.creds.lidJidMapping.lidToWid;
            const wid = mapping[jidCompleto];
            if (wid) {
                const numero = wid.split('@')[0];
                if (numero && /^\d+$/.test(numero)) {
                    return numero;
                }
            }
        }
        
        // Método 3: Busca no store de contatos do Baileys
        if (sock.store?.contacts?.[jidCompleto]) {
            const contact = sock.store.contacts[jidCompleto];
            if (contact.id) {
                const numero = contact.id.split('@')[0].split(':')[0];
                if (numero && /^\d+$/.test(numero)) {
                    return numero;
                }
            }
        }
        
        // Método 4: Extrai o LID e tenta buscar mapeamento reverso
        if (jidCompleto.includes('@lid')) {
            const lidNumero = jidCompleto.split('@')[0].split(':')[0];
            
            // Tenta buscar no mapeamento reverso
            if (sock.authState?.creds?.lidJidMapping?.widToLid) {
                const mappingReverso = sock.authState.creds.lidJidMapping.widToLid;
                for (const [wid, lid] of Object.entries(mappingReverso)) {
                    if (lid === jidCompleto) {
                        const numero = wid.split('@')[0];
                        if (numero && /^\d+$/.test(numero)) {
                            return numero;
                        }
                    }
                }
            }
            
            // Se o LID tem número, tenta extrair diretamente
            if (lidNumero && /^\d+$/.test(lidNumero)) {
                return lidNumero;
            }
        }
        
        return null;
    } catch (err) {
        console.error('❌ Erro ao resolver número:', err.message);
        return null;
    }
}

function logMensagem(m, text = "", isCommand = false, sock = null) {
    const fromMe = m?.key?.fromMe || false;
    const jid = m?.key?.remoteJid || "";
    const isGroup = jid.endsWith("@g.us") || jid.endsWith("@lid");
    const senderJid = m?.key?.participant || jid;
    const sender = senderJid?.split("@")[0] || "desconhecido";
    const pushName = m?.pushName || "Sem nome";

    const conteudo = text || (() => {
        if (m?.message?.conversation) return m.message.conversation;
        if (m?.message?.extendedTextMessage?.text) return m.message.extendedTextMessage.text;
        if (m?.message?.imageMessage?.caption) return m.message.imageMessage.caption;
        if (m?.message?.videoMessage?.caption) return m.message.videoMessage.caption;
        return "[conteúdo não suportado]";
    })();

    // Evita duplicação
    const logKey = `${fromMe}-${jid}-${conteudo}`;
    if (mensagensRegistradas.has(logKey)) return;
    mensagensRegistradas.add(logKey);

    const tipo = isCommand || (conteudo.startsWith(prefix)) ? "COMANDO" : "MENSAGEM";
    const local = isGroup ? "GRUPO" : "PV";
    
    // Detecta se é LID ou número tradicional
    const isLid = senderJid && senderJid.includes('@lid');
    const isTradicional = senderJid && senderJid.includes('@s.whatsapp.net');
    
    let infoRemetente = pushName;
    
    // Se for LID, tenta resolver o número E mostra o LID
    if (isLid) {
        const numero = resolverNumero(senderJid, sock);
        const lid = senderJid.split('@')[0];
        if (numero) {
            infoRemetente = `${pushName} (📞 ${numero} | 🆔 LID: ${lid})`;
        } else {
            infoRemetente = `${pushName} (🆔 LID: ${lid})`;
        }
    }
    // Se for tradicional, mostra o número direto
    else if (isTradicional) {
        const numero = senderJid.split('@')[0];
        infoRemetente = `${pushName} (📞 ${numero})`;
    }
    // Fallback genérico
    else {
        const id = senderJid ? senderJid.split('@')[0] : "desconhecido";
        infoRemetente = `${pushName} (ID: ${id})`;
    }
    
    if (fromMe) infoRemetente += " [EU]";

    // Monta informações adicionais
    let detalhes = [];
    if (isGroup) {
        detalhes.push(`${roxo}│ 📍 Grupo ID: ${jid.split('@')[0]}${reset}`);
        if (senderJid) detalhes.push(`${roxo}│ 👤 Sender: ${senderJid}${reset}`);
    } else {
        detalhes.push(`${roxo}│ 👤 RemoteJid: ${jid}${reset}`);
    }

    const logText = `
${roxo}╭──〔 ${tipo} ${local} 〕──⪩${reset}
${roxo}│ De: ${infoRemetente}${reset}
${detalhes.join('\n')}
${roxo}│ Conteúdo: ${conteudo}${reset}
${roxo}╰─────────⪨${reset}`;

    console.log(logText);
}

// ---------------------------
// Função para buscar buffer de URL
// ---------------------------
async function getBuffer(url) {
    try {
        const response = await require('axios').get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Erro ao buscar buffer da URL:', error);
        throw error;
    }
}

// Função para formatar JID
function formatJid(jid) {
    return String(jid || "").replace(/@s\.whatsapp\.net|@g\.us|@lid/g,'');
}

// ---------------------------
// Função para saudação baseada no horário
// ---------------------------
function obterSaudacao() {
    const moment = require('moment-timezone');
    const hora = moment().tz('America/Sao_Paulo').hour();
    
    if (hora >= 6 && hora < 12) {
        return "🌅 Bom dia";
    } else if (hora >= 12 && hora < 18) {
        return "☀️ Boa tarde";
    } else if (hora >= 18 && hora < 24) {
        return "🌙 Boa noite";
    } else {
        return "🌃 Boa madrugada";
    }
}

// ---------------------------
// Função para contar grupos
// ---------------------------
async function contarGrupos(sock) {
    try {
        const grupos = await sock.groupFetchAllParticipating();
        return Object.keys(grupos).length;
    } catch (error) {
        console.error('Erro ao contar grupos:', error);
        return 0;
    }
}

// ---------------------------
// Função para contar comandos automaticamente
// ---------------------------
function contarComandos() {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Lê o arquivo index.js
        const indexPath = path.join(__dirname, '../../index.js');
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Conta TODOS os cases do arquivo (não para no primeiro default)
        const lines = indexContent.split('\n');
        const comandosPrincipais = new Set();
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Procura cases com QUALQUER quantidade de espaços
            const caseMatch = line.match(/^\s+case\s+["']([^"']+)["']/);
            if (caseMatch) {
                comandosPrincipais.add(caseMatch[1]);
            }
        }
        
        // Adiciona os comandos hentai se houver
        let totalHentai = 0;
        try {
            const hentaiPath = path.join(__dirname, '../hentai.js');
            const hentai = require(hentaiPath);
            const comandosHentai = Object.keys(hentai.HENTAI_COMMANDS || {});
            totalHentai = comandosHentai.length;
            comandosHentai.forEach(cmd => comandosPrincipais.add(cmd));
        } catch (err) {
            // Ignora se não houver arquivo hentai
        }
        
        const total = comandosPrincipais.size;
        console.log(`✅ Total de comandos contados: ${total}`);
        return total;
    } catch (error) {
        console.error('❌ Erro ao contar comandos automaticamente:', error);
        // Fallback seguro
        return 452;
    }
}

// ---------------------------
// Exportações
// ---------------------------
module.exports = {
    mostrarBanner,
    logMensagem,
    formatJid,
    getBuffer,
    obterSaudacao,
    contarGrupos,
    contarComandos
};