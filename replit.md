# Bot WhatsApp - Neext LTDA

## 📋 Visão Geral
Bot WhatsApp completo desenvolvido pela Neext LTDA com múltiplas funcionalidades incluindo jogos, RPG, comandos administrativos, sistema anti-spam e muito mais.

## 🎯 Status Atual
- ✅ Projeto importado do GitHub e configurado no Replit
- ✅ ffmpeg instalado (sistema) 
- ✅ Dependências npm instaladas (408 packages)
- ✅ Workflow "WhatsApp Bot" configurado e **RODANDO**
- ✅ **Bot aguardando conexão** - Digite 1 (QR Code) ou 2 (Pairing) no console
- 📌 Conexão preservada - Nenhuma modificação nos arquivos de autenticação

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

### Primeira Execução

#### Opção 1: Modo Interativo (Console)
1. No console do Replit, o bot pergunta o método de conexão
2. Digite `1` para QR Code ou `2` para Pairing Code
3. Se escolher QR Code: Escaneie com WhatsApp
4. Se escolher Pairing: Digite seu número e use o código mostrado
5. Bot salva sessão em `conexao/`
6. Reconexões automáticas subsequentes

#### Opção 2: Variáveis de Ambiente (Automático)
1. Copie `.env.example` para `.env`
2. Configure `BOT_CONNECTION_METHOD=qr` ou `pairing`
3. Se usar `pairing`, defina `BOT_OWNER_NUMBER=5527999999999`
4. Reinicie o workflow
5. Bot conecta automaticamente

### Reconectar WhatsApp
Se o bot mostrar erro 401/440 (credenciais inválidas):
1. Parar o workflow
2. Limpar pasta `conexao/` (manter só `.keep`)
3. Reiniciar workflow
4. Conectar novamente

## 📝 Mudanças Recentes

### 12/10/2025 - Proteção da Pasta Conexão e Logs Limpos ✅
- ✅ **Pasta `conexao` protegida** - NUNCA será apagada automaticamente pelo bot
- ✅ **Logs de cache removidos** - Sem mais "🧹 Cache limpo" aparecendo a cada 5 minutos
- ✅ **Logs de debug removidos** - Console mais limpo e profissional
- ✅ **Reconexão melhorada** - Bot reconecta automaticamente sem apagar credenciais
- 📌 **Segurança garantida** - Conexão do WhatsApp sempre preservada

### 12/10/2025 - Importação GitHub Finalizada ✅
- ✅ **Projeto importado do GitHub com sucesso**
- ✅ **ffmpeg instalado** - Dependência de sistema para processamento de mídia
- ✅ **408 pacotes npm instalados** - Todas as dependências do projeto
- ✅ **Workflow "WhatsApp Bot" configurado** - Executando `node main.js`
- ✅ **Bot operacional** - Aguardando escolha do método de conexão (1=QR ou 2=Pairing)
- 📌 **Conexão preservada** - Nenhuma modificação nos arquivos de autenticação
- ✅ **Pronto para uso** - Basta conectar ao WhatsApp no console

### 12/10/2025 - Configuração Completa no Replit ✅
- ✅ **Projeto importado do GitHub e configurado com sucesso**
- ✅ **Dependências instaladas**: 408 pacotes npm + ffmpeg (sistema)
- ✅ **Workflow configurado**: "WhatsApp Bot" rodando `node main.js`
- ✅ **Bot operacional**: Aguardando escolha do método de conexão
- 📌 **Autenticação preservada**: Nenhuma modificação nos arquivos de conexão
- ✅ **Pronto para uso**: Basta conectar ao WhatsApp e começar a usar

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

### 12/10/2025 - Setup Completo no Replit ✅
- ✅ **Projeto importado do GitHub com sucesso**
- ✅ **Dependências npm instaladas** - 408 pacotes instalados corretamente
- ✅ **Workflow "WhatsApp Bot" configurado** - `node main.js` rodando
- ✅ **Bot iniciado e operacional** - aguardando conexão WhatsApp
- 📌 **Conexão preservada** - Nenhuma alteração nos arquivos de autenticação
- ✅ **Status**: Bot rodando e aguardando escolha do método de conexão (1=QR ou 2=Pairing)

### 10/10/2025 - Correções de Desempenho
- ✅ **Cache de mensagens otimizado** - Reduzido de 5min para 30s (evita comandos ignorados)
- ✅ **Reconexão automática melhorada** - Erro 440 agora limpa sessão automaticamente
- ✅ **Reset de listeners** - Listeners são resetados ao limpar sessão
- ✅ **Novo comando `.reset`** - Dono pode limpar cache manualmente
- ✅ ffmpeg instalado para comandos de figurinha

### 11/10/2025 - Importação GitHub e Configuração Replit
- ✅ Projeto importado e configurado no Replit
- ✅ Dependências npm instaladas (408 packages)
- ✅ Workflow "WhatsApp Bot" configurado (`node main.js`)
- 📌 Conexão preservada sem modificações (conforme solicitado)
- ✅ **Removidos comandos antifake e antiporno completamente**
- ✅ **Corrigido flood de "Mensagem não encontrada" nos grupos**
  - Função `getMessage` agora retorna `undefined` em vez de enviar mensagem
  - Função `reply` não envia mais mensagens de erro quando há problemas internos

## 🐛 Problemas Conhecidos

### Resolvidos
- ✅ Dependências instaladas corretamente
- ✅ Workflow configurado e funcionando
- ✅ Flood de "Mensagem não encontrada" corrigido
- ✅ Comandos antifake e antiporno removidos

### Requer Ação do Usuário
- ⏳ Conectar ao WhatsApp (método definido na primeira execução)
- ⏳ Após conectar, bot estará pronto para uso

## 💡 Notas Importantes

1. **Nunca mexer na pasta `conexao/`** - Contém autenticação do WhatsApp
2. **LID vs Número** - Bot usa LID para identificar donos (mais confiável)
3. **Múltiplos Donos** - Configurar em `settings/necessary.json`
4. **Agendamento** - Verifica schedules a cada 1 minuto automaticamente
5. **RPG** - Sistema completo de economia/trabalho/educação integrado

## 🔄 Workflow
- **Nome**: WhatsApp Bot
- **Comando**: `node main.js`
- **Saída**: Console
- **Auto-restart**: Sim (em caso de desconexão)
- **Status**: ✅ Rodando
