# WhatsApp Bot - NEEXT LTDA

## Visão Geral
Bot do WhatsApp desenvolvido pela NEEXT LTDA usando a biblioteca Baileys. O bot oferece diversos recursos incluindo sistema RPG, jogos, anti-spam, e muito mais.

## Estrutura do Projeto
```
├── main.js           # Ponto de entrada principal
├── connect.js        # Gerencia conexão com WhatsApp
├── index.js          # Handlers de mensagens e comandos
├── arquivos/         # Módulos e funcionalidades
│   ├── rpg/         # Sistema RPG completo
│   ├── funcoes/     # Funções auxiliares
│   └── ...          # Outros módulos
├── config/          # Configurações do ambiente
├── settings/        # Configurações do bot
│   ├── settings.json      # Configurações principais
│   └── necessary.json     # Donos adicionais
├── database/        # Dados persistentes
│   └── grupos/      # Dados dos grupos
└── conexao/         # Sessão do WhatsApp (credenciais)
```

## Como Usar

### Primeira Execução
1. O bot vai perguntar o método de conexão:
   - **Opção 1**: QR Code (escanear com WhatsApp)
   - **Opção 2**: Pairing Code (código numérico)

2. Após conectar, os dados da sessão são salvos em `/conexao`

3. O bot ficará online e responderá comandos nos grupos

### Comandos
- Prefixo padrão: `.` (configurável em `settings/settings.json`)
- Sistema RPG disponível
- Anti-spam e anti-link
- Jogos: Xadrez, Akinator, Anagrama
- Sistema de ranking de ativos
- Welcome/Boas-vindas automático

## Configuração

### settings.json
Localizado em `settings/settings.json`:
- `prefix`: Prefixo dos comandos (padrão: ".")
- `nomeDoBot`: Nome do bot
- `nickDoDono`: Apelido do dono
- `numeroDono`: Número do dono
- `lidDono`: LID do dono (identificação WhatsApp)
- `idDoCanal`: ID do canal de status
- `antipv`: Bloquear mensagens privadas

### Variáveis de Ambiente (Opcionais)
- `BOT_CONNECTION_METHOD`: "qr" ou "pairing"
- `BOT_OWNER_NUMBER`: Número do dono
- `BOT_PHONE_NUMBER`: Número do bot
- `BOT_STATE_DIR`: Diretório de sessão customizado

## Tecnologias
- **Node.js**: Runtime JavaScript
- **@whiskeysockets/baileys**: Biblioteca WhatsApp
- **Moment.js**: Manipulação de datas
- **Jimp/Sharp**: Processamento de imagens
- **Chess.js**: Sistema de xadrez
- **Akinator API**: Jogo Akinator

## Recursos Principais
- ✅ Sistema RPG completo (NeextCity)
- ✅ Anti-spam e anti-link inteligente
- ✅ Sistema de ranking de ativos
- ✅ Welcome/Boas-vindas customizável
- ✅ Jogos: Xadrez, Akinator, Anagrama
- ✅ Download Instagram
- ✅ Criação de stickers
- ✅ Sistema de registros
- ✅ Agendamento de grupos
- ✅ Reconexão automática

## Status Atual
🟢 **Bot configurado e pronto para uso!**

O workflow "WhatsApp Bot" está rodando. Conecte seu WhatsApp escolhendo o método de conexão no console.

## Última Atualização
03 de Novembro de 2025
