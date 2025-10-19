# Bot WhatsApp - Neext LTDA

## 📋 Visão Geral
Bot WhatsApp completo desenvolvido pela Neext LTDA com múltiplas funcionalidades incluindo jogos, RPG, comandos administrativos, sistema anti-spam e muito mais.

## 🎯 Status Atual
- ✅ Projeto importado do GitHub e configurado no Replit (14/10/2025)
- ✅ Dependências instaladas: 408 pacotes npm
- ✅ Workflow "Bot WhatsApp" configurado e **RODANDO**
- ✅ **Bot 100% operacional** - QR Code gerado automaticamente
- ✅ **Método de conexão automático** - QR Code configurado via variável de ambiente
- 📌 Conexão preservada - Nenhuma modificação nos arquivos de autenticação
- 📌 Sistema pronto para uso - Basta escanear o QR Code no console

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios
```
├── arquivos/          # Módulos de funcionalidades
│   ├── funcoes/      # Funções auxiliares
│   ├── rpg/          # Sistema RPG NeextCity
│   └── *.js          # Diversos sistemas (akinator, xadrez, etc)
├── conexao/          # Autenticação WhatsApp (NÃO MEXER)
├── config/           # Configurações de ambiente
├── database/         # Dados persistentes
│   ├── grupos/      # Dados dos grupos
│   └── registros/   # Registros de usuários
├── menus/           # Sistema de menus
└── settings/        # Configurações do bot
    ├── settings.json     # Config principal
    └── necessary.json    # Donos adicionais
```

### Arquivos Principais
- `main.js` - Ponto de entrada com gerenciamento de erros
- `connect.js` - Gerencia conexão WhatsApp (QR/Pairing)
- `index.js` - Lógica principal do bot (9000+ linhas)

## 🔧 Tecnologias

### Dependências Principais
- `@whiskeysockets/baileys` - Cliente WhatsApp
- `fluent-ffmpeg` - Processamento de mídia
- `sharp`, `jimp` - Manipulação de imagens
- `chess.js` - Sistema de xadrez
- `akinator-api` - Jogo akinator
- `axios`, `cheerio` - Web scraping
- `moment-timezone` - Datas/horários

### Dependências do Sistema
- `ffmpeg` - Requerido para criar figurinhas

## ⚙️ Configuração

### Settings (settings/settings.json)
```json
{
  "prefix": ".",
  "nomeDoBot": "Goddard",
  "nickDoDono": "Flash",
  "numeroDono": "5521993272080",
  "lidDono": "74982159855828",
  "idDoCanal": "120363399209756764@g.us",
  "fotoDoBot": "https://i.ibb.co/nqgG6z6w/IMG-20250720-WA0041-2.jpg",
  "antipv": true
}
```

### Donos Adicionais (settings/necessary.json)
Sistema permite múltiplos donos com seus LIDs específicos.

## 🎮 Funcionalidades

### Sistemas Principais
1. **Sistema RPG** - NeextCity completo com economia, trabalhos, educação
2. **Anti-Spam** - Proteção contra links, flood, arquivos indesejados, palavrões
3. **Welcome System** - Boas-vindas automáticas
4. **Ranking Ativo** - Sistema de XP por atividade
5. **Xadrez** - Jogo de xadrez completo
6. **Akinator** - Jogo de adivinhação
7. **Agendamento** - Sistema de mensagens agendadas para grupos

### Comandos Destacados
- `.s` - Criar figurinha (sticker)
- `.menu` - Menu principal
- `.rpg` - Sistema RPG
- `.xadrez` - Jogar xadrez
- `.pinterest` - Buscar imagens
- `.ping` - Verificar latência
- `.linkgrupo` - Mostra link do grupo
- `.antiloc on/off` - Anti-localização
- `.antiimg on/off` - Anti-imagem
- `.time-status` - Ver agendamentos do grupo

## 🔒 Segurança

### Proteção de Dados
- ❌ Pasta `conexao/` NÃO é versionada (contém credenciais)
- ❌ Settings com dados sensíveis protegidos
- ✅ .gitignore configurado adequadamente

### Sistema Anti-Spam
- Anti-link (normal e avançado)
- Anti-contato
- Anti-documento
- Anti-vídeo/áudio/sticker
- Anti-flood
- Anti-palavrão
- Anti-pagamento
- Anti-localização 📍
- Anti-imagem 🖼️
- X9 Monitor (ações de admin)
- Banimento automático de infratores

## 🚀 Como Usar

### Conectar ao WhatsApp
1. O bot está configurado para usar **QR Code automaticamente**
2. Veja o QR Code no console do workflow "Bot WhatsApp"
3. Abra WhatsApp no celular > Dispositivos Conectados > Conectar dispositivo
4. Escaneie o QR Code
5. O bot salva a sessão em `conexao/` e reconecta automaticamente

### Alterar para Pairing Code
Se preferir usar código de pareamento:
1. Edite o workflow para `BOT_CONNECTION_METHOD=pairing npm start`
2. Defina também `BOT_OWNER_NUMBER=seu_numero` (ex: 5527999999999)
3. Reinicie o workflow
4. Use o código mostrado no console para parear no WhatsApp

### Reconectar WhatsApp
Se o bot mostrar erro 401/440 (credenciais inválidas):
1. Parar o workflow
2. Limpar pasta `conexao/` (manter só `.keep`)
3. Reiniciar workflow
4. Conectar novamente

## 📝 Mudanças Recentes

### 19/10/2025 - Downloads Limpos (Sem "Enviado via anúncio") ✅
- ✅ **Áudios e vídeos sem marcação de anúncio** - Removido `showAdAttribution` de todos os downloads
- ✅ **Comandos atualizados**:
  - `.playspotify` - Áudio limpo sem anúncio
  - `play` - Áudio limpo sem anúncio
  - `spotify` - Áudio limpo sem anúncio
  - `tiktok`/`tt` - Vídeo totalmente limpo
  - Instagram - Vídeo sem anúncio
  - Facebook - Vídeo sem anúncio
  - Twitter - Vídeo sem anúncio
  - `spotifysearch` - Texto mantém reply do canal
- 🚫 **Removido**: forwardedNewsletterMessageInfo (reply de canal) e showAdAttribution (marcação de anúncio)
- ✅ **Mantido**: externalAdReply para preview de informações
- 🎯 **Resultado**: Downloads sem "Enviado via anúncio", apenas com preview limpo

### 14/10/2025 - Figurinhas 100% Limpas (Sem Selinho, Reply e Caption) ✅
- ✅ **Envio totalmente limpo** - Removido selinho (contato fake), reply e caption dos comandos de sticker
- ✅ **Sem contextAnuncio** - Removido "enviado via anúncio" das figurinhas
- ✅ **Comandos afetados**:
  - `.s` - Criar figurinha de imagem/vídeo
  - `.rename` - Renomear figurinha existente
  - `.take` - Pegar figurinha com nome personalizado
- 🚫 **Removido do index.js (comando .s)**:
  - contextInfo com externalAdReply
  - { quoted: message }
- 🚫 **Removido do arquivos/rename.js**:
  - selinho (contato fake da NEEXT)
  - contextAnuncio
  - { quoted: selinho }
- 🎯 **Resultado**: Figurinhas são enviadas TOTALMENTE PURAS, sem qualquer caption, reply ou context anexado

### 14/10/2025 - Mensagens de Ativação Simplificadas ✅
- ✅ **Mensagens limpas e diretas** - Removidas informações técnicas das mensagens de ativação/desativação
- ✅ **Todos os sistemas anti atualizados** - antilink, anticontato, antidocumento, antivideo, antiaudio, antisticker, antiflod, antiloc, antiimg, x9, etc.
- ✅ **Formato simples**:
  - Ativar: `✅ *ANTILINK ATIVADO*`
  - Desativar: `❌ *ANTILINK DESATIVADO*`
  - Já ativo: `⚠️ *ANTILINK JÁ ESTÁ ATIVO!*`
  - Já desativado: `⚠️ *ANTILINK JÁ ESTÁ DESATIVADO!*`
- 🚫 **Removido**: Mensagens longas com "Ação: Delete + Ban automático", "Conteúdo será removido e usuário banido", etc.
- 🎯 **Experiência melhorada** - Interface mais limpa e profissional

### 14/10/2025 - Configuração Inicial no Replit ✅
- ✅ **Dependências instaladas** - npm install executado com sucesso (408 pacotes)
- ✅ **Workflow configurado** - Bot WhatsApp rodando com QR Code automático
- ✅ **Conexão preservada** - Nenhuma alteração nos arquivos de autenticação
- ✅ **Bot operacional** - Pronto para conectar ao WhatsApp
- 📌 **Comando do workflow**: `BOT_CONNECTION_METHOD=qr npm start`

### 13/10/2025 - Cache NPM Desabilitado ✅
- ✅ **Pasta `.npm` removida** - Liberado espaço no servidor
- ✅ **Cache NPM desabilitado** - Arquivo `.npmrc` criado
- ✅ **Configuração permanente** - NPM não criará mais cache
- 🎯 **Problema resolvido:** Servidor não fica mais sem espaço por causa do cache NPM

### 13/10/2025 - Conexão Permanente e Estável ✅
- ✅ **Timeouts otimizados para conexão estável**
  - Keep-alive: 30s → **60s** (menos agressivo, evita desconexões)
  - Query timeout: 15s → **60s** (operações não expiram prematuramente)
  - Connect timeout: 60s → **120s** (mais tempo para conectar)
- ✅ **Reconexão inteligente com Exponential Backoff**
  - Começa com 3 segundos e dobra a cada tentativa
  - Máximo de 60 segundos entre reconexões
  - Reseta contador quando conecta com sucesso
- ✅ **Features pesadas desabilitadas**
  - Não sincroniza histórico completo (syncFullHistory: false)
  - Não sincroniza contatos (syncContacts: false)
  - Não sincroniza chats antigos (syncChats: false)
  - **Resultado:** Conexão muito mais leve e estável
- ✅ **Tratamento inteligente de erros**
  - Diferencia logout real de desconexão temporária
  - Mostra tentativas de reconexão e tempo de espera
  - Só encerra processo em caso de logout manual
- 🎯 **Problema resolvido:** Bot não desconecta mais após algumas horas

### 12/10/2025 - Configuração Automática no Replit ✅
- ✅ **Workflow atualizado** - `BOT_CONNECTION_METHOD=qr npm start`
- ✅ **Conexão automática via QR Code** - Sem necessidade de escolha interativa
- ✅ **QR Code gerado automaticamente** - Basta escanear e usar
- ✅ **Bot 100% funcional** - Pronto para conectar ao WhatsApp

### 12/10/2025 - Comando Instagram Corrigido ✅
- ✅ **API atualizada** - Usando `https://api.nekolabs.my.id/downloader/instagram`
- ✅ **Suporte a imagens e vídeos** - Detecta automaticamente o tipo de mídia
- ✅ **Informações completas** - Mostra username, curtidas, comentários e legenda
- ✅ **Timeout otimizado** - Aumentado de 15s para 20s na busca, 60s no download
- ✅ **Caption aprimorada** - Exibe até 200 caracteres da legenda original

### 12/10/2025 - Comando Pinterest Corrigido ✅
- ✅ **API atualizada** - Usando `https://api.nekolabs.my.id/discovery/pinterest/search`
- ✅ **Verificação corrigida** - Agora checa `success` ao invés de `status` (compatível com API)
- ✅ **Timeout otimizado** - Aumentado de 15s para 20s
- ✅ **Carrossel funcional** - Envia até 5 imagens do Pinterest com informações do autor

### 12/10/2025 - Comandos Play e Play-Spotify Corrigidos ✅
- ✅ **Comando `.play` otimizado** - Timeout aumentado para 2 minutos (download completo)
- ✅ **Comando `.playspotify` otimizado** - Timeouts ajustados em todas as etapas
- ✅ **Busca melhorada** - 40s para buscar música no Spotify
- ✅ **Download melhorado** - 2 minutos para baixar áudio sem interrupção
- ✅ **Sem erros falsos** - Não mostra mais erro antes da música baixar completamente

### 12/10/2025 - Proteção da Pasta Conexão e Logs Limpos ✅
- ✅ **Pasta `conexao` protegida** - NUNCA será apagada automaticamente pelo bot
- ✅ **Logs de cache removidos** - Sem mais "🧹 Cache limpo" aparecendo a cada 5 minutos
- ✅ **Logs de debug removidos** - Console mais limpo e profissional
- ✅ **Reconexão melhorada** - Bot reconecta automaticamente sem apagar credenciais
- 📌 **Segurança garantida** - Conexão do WhatsApp sempre preservada

### 12/10/2025 - Comando x9visuunica Removido ✅
- ✅ **Comando `.x9visuunica` removido completamente do bot**
  - Função processarX9VisuUnica removida do index.js
  - Removido de todos os menus (menuadm)
  - Removido do sistema antispam
  - Documentação atualizada
- 📌 **Motivo**: Removido a pedido do usuário

### 12/10/2025 - Novos Comandos Anti-Spam e Link do Grupo ✅
- ✅ **Comando `.time-status` corrigido** - Variável configBot não definida estava causando erro
- ✅ **Novo comando `.antiloc`** - Bane e apaga quem manda localização quando ativado
- ✅ **Novo comando `.antiimg`** - Bane e apaga quem manda imagem quando ativado
- ✅ **Novo comando `.linkgrupo`** - Mostra link de convite do grupo
  - Aliases: `.linkdogrupo`, `.link`
  - Mostra nome do grupo, total de membros e link
  - Bot precisa ser admin para gerar link
- ✅ **Comandos adicionados ao menuadm**
- ✅ **Comandos adicionados ao grupo-status**
- ✅ **Sistema antispam atualizado** com suporte a antiloc e antiimg

### 10/10/2025 - Correções de Desempenho
- ✅ **Cache de mensagens otimizado** - Reduzido de 5min para 30s (evita comandos ignorados)
- ✅ **Reconexão automática melhorada** - Erro 440 agora limpa sessão automaticamente
- ✅ **Reset de listeners** - Listeners são resetados ao limpar sessão
- ✅ **Novo comando `.reset`** - Dono pode limpar cache manualmente
- ✅ ffmpeg instalado para comandos de figurinha

## 💡 Notas Importantes

1. **Nunca mexer na pasta `conexao/`** - Contém autenticação do WhatsApp
2. **LID vs Número** - Bot usa LID para identificar donos (mais confiável)
3. **Múltiplos Donos** - Configurar em `settings/necessary.json`
4. **Agendamento** - Verifica schedules a cada 1 minuto automaticamente
5. **RPG** - Sistema completo de economia/trabalho/educação integrado

## 🔄 Workflow Configurado
- **Nome**: Bot WhatsApp
- **Comando**: `BOT_CONNECTION_METHOD=qr npm start`
- **Método**: QR Code automático
- **Saída**: Console
- **Auto-restart**: Sim (em caso de desconexão)
- **Status**: ✅ Rodando e gerando QR Code

## 📌 Preferências do Usuário
- ⚠️ **NUNCA** mexer ou alterar arquivos de conexão (connect.js, main.js, pasta conexao/)
- ✅ Preservar a autenticação e sessão existente do WhatsApp
