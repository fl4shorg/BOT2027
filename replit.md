# Bot WhatsApp - Neext LTDA

## 📋 Visão Geral
Bot WhatsApp completo desenvolvido pela Neext LTDA com múltiplas funcionalidades incluindo jogos, RPG, comandos administrativos, sistema anti-spam e muito mais.

## 🎯 Status Atual
- ✅ Projeto importado do GitHub
- ✅ Configuração do Replit completa
- ✅ ffmpeg instalado para suporte a figurinhas
- ⚠️ Requer reconexão ao WhatsApp (credenciais expiradas)

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
  "numeroDono": "5527999999999",
  "lidDono": "74982159855828",
  "idDoCanal": "120363399209756764@g.us",
  "fotoDoBot": "https://i.ibb.co/...",
  "antipv": true
}
```

### Donos Adicionais (settings/necessary.json)
Sistema permite múltiplos donos com seus LIDs específicos.

## 🎮 Funcionalidades

### Sistemas Principais
1. **Sistema RPG** - NeextCity completo com economia, trabalhos, educação
2. **Anti-Spam** - Proteção contra links, flood, arquivos indesejados
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

## 🔒 Segurança

### Proteção de Dados
- ❌ Pasta `conexao/` NÃO é versionada (contém credenciais)
- ❌ Settings com dados sensíveis protegidos
- ✅ .gitignore configurado adequadamente

### Sistema Anti-Spam
- Anti-link
- Anti-contato
- Anti-documento
- Anti-flood
- Banimento automático de infratores

## 🚀 Como Usar

### Primeira Execução
1. Bot pergunta método de conexão (QR Code ou Pairing)
2. Conectar WhatsApp conforme escolhido
3. Bot salva sessão em `conexao/`
4. Reconexões automáticas subsequentes

### Reconectar WhatsApp
Se o bot mostrar erro 401/440 (credenciais inválidas):
1. Parar o workflow
2. Limpar pasta `conexao/` (manter só `.keep`)
3. Reiniciar workflow
4. Conectar novamente

## 📝 Mudanças Recentes

### 10/10/2025 - Correções de Desempenho
- ✅ **Cache de mensagens otimizado** - Reduzido de 5min para 30s (evita comandos ignorados)
- ✅ **Reconexão automática melhorada** - Erro 440 agora limpa sessão automaticamente
- ✅ **Reset de listeners** - Listeners são resetados ao limpar sessão
- ✅ **Novo comando `.reset`** - Dono pode limpar cache manualmente
- ✅ ffmpeg instalado para comandos de figurinha

### 10/10/2025 - Importação GitHub
- ✅ Projeto importado e configurado no Replit
- ✅ `.gitignore` criado para proteger dados sensíveis
- ✅ Workflow configurado (npm start)
- 📌 Pasta de conexão preservada (não modificada)

## 🐛 Problemas Conhecidos

### Resolvidos
- ✅ Erro "Cannot find ffmpeg" - ffmpeg instalado

### Requer Ação do Usuário
- ⚠️ Reconectar WhatsApp (credenciais expiradas)
- ⚠️ Testar comando de figurinha após reconexão

## 💡 Notas Importantes

1. **Nunca mexer na pasta `conexao/`** - Contém autenticação do WhatsApp
2. **LID vs Número** - Bot usa LID para identificar donos (mais confiável)
3. **Múltiplos Donos** - Configurar em `settings/necessary.json`
4. **Agendamento** - Verifica schedules a cada 1 minuto automaticamente
5. **RPG** - Sistema completo de economia/trabalho/educação integrado

## 🔄 Workflow
- **Nome**: WhatsApp Bot
- **Comando**: `npm start`
- **Saída**: Console
- **Auto-restart**: Sim (em caso de desconexão)
