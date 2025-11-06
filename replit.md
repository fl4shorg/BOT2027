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
🟢 **Bot configurado e pronto para uso no Replit!**

O workflow "WhatsApp Bot" está rodando automaticamente. O bot está configurado para usar QR Code por padrão.

### Como Conectar seu WhatsApp
1. Acesse o console do workflow "WhatsApp Bot"
2. Você verá um QR Code gerado automaticamente
3. Abra o WhatsApp no seu celular
4. Vá em "Dispositivos Conectados" > "Conectar um dispositivo"
5. Escaneie o QR Code mostrado no console
6. Aguarde a conexão ser estabelecida

### Alterando o Método de Conexão
Se preferir usar código de pareamento ao invés de QR Code:
1. Edite o arquivo `.env` na raiz do projeto
2. Altere `BOT_CONNECTION_METHOD=qr` para `BOT_CONNECTION_METHOD=pairing`
3. Adicione seu número: `BOT_OWNER_NUMBER=5521999999999`
4. Reinicie o workflow

### Persistência da Sessão
Os dados de autenticação são salvos na pasta `/conexao` e persistem entre reinicializações, então você só precisa conectar uma vez.

## Atualizações Recentes

### 06 de Novembro de 2025 - Noite (Parte 2)
- ✅ **Conflito entre comandos play e playstore resolvido**:
  - O comando `.play` agora funciona APENAS para música (download de áudio/vídeo do YouTube)
  - O comando `.playstore` funciona APENAS para buscar apps na Play Store
  - Antes, ambos os comandos compartilhavam o alias "play", causando conflito
  - Agora cada comando tem sua função específica sem interferências

### 06 de Novembro de 2025 - Noite (Parte 1)
- ✅ **Comando attp adicionado**: Novo comando `.attp [texto]` para texto animado colorido
  - Cria figurinha animada com texto colorido e animações
  - API: https://www.api.neext.online/attp
  - Retorna como sticker/figurinha animada no WhatsApp
  - Adicionado na seção "COMANDOS FIGURINHAS" do menu
- ✅ **Comando bratgif corrigido**: Agora retorna como **figurinha animada** (sticker)
  - Aceita dois ou mais textos separados por espaço: `.bratgif [texto1] [texto2]`
  - API: https://www.api.neext.online/bratvideo
  - Converte o vídeo para WebP animado e envia como sticker
  - Adicionado na seção "COMANDOS FIGURINHAS" do menu
- ✅ **14 Comandos de Notícias adicionados**: Nova seção "COMANDOS DE NOTÍCIAS" no menu
  - `.jovempan` - Notícias da Jovem Pan
  - `.g1` - Notícias do G1
  - `.poder360` - Notícias do Poder360
  - `.uol` - Notícias do UOL
  - `.cnn` - Notícias da CNN Brasil
  - `.estadao` - Notícias do Estadão
  - `.terra` - Notícias do Terra
  - `.exame` - Notícias da Exame
  - `.bbc` - Notícias da BBC Brasil
  - `.agazeta` - Notícias da A Gazeta
  - `.veja` - Notícias da Veja
  - `.metropoles` - Notícias do Metrópoles
  - `.folha` - Notícias da Folha de S.Paulo
  - `.espn` - Notícias esportivas da ESPN
  - Cada comando retorna uma notícia aleatória da fonte escolhida
  - Exibe imagem quando disponível + título + link
- ✅ **Comando DDD adicionado**: Novo comando `.ddd [número]` para consultar códigos DDD brasileiros
  - Retorna o estado e todas as cidades que usam aquele DDD
  - API integrada: https://www.api.neext.online/ddd
  - Adicionado na seção "COMANDOS TOOLS" do menu

### 06 de Novembro de 2025 - Tarde
- ✅ **Comando audiomeme adicionado**: Pesquisa e envia áudio aleatório via `.audiomeme` ou `.audio`
- ✅ **Contador de comandos corrigido**: Agora conta corretamente independente da indentação
- ✅ **Sistema de retry em comandos de logo**: Tenta 2x automaticamente antes de falhar
- ✅ **Mensagens de erro melhoradas**: Feedback detalhado quando logos falham (timeout, API offline, etc)
- ✅ **Menulogos otimizado**: Responde instantaneamente (removido carregamento de imagem)

### 06 de Novembro de 2025 - Manhã
- ✅ Corrigidos todos os comandos de logos (menulogos)
- ✅ API retorna imagem diretamente (removida lógica desnecessária de JSON)
- ✅ Criada função `processarLogoTextpro` para logos Textpro (usa parâmetro `text1`)
- ✅ Função `processarLogo` para logos Ephoto (usa parâmetro `text`)
- ✅ Função `processarLogoDuplo` para logos com 2 textos
- ✅ Timeout ajustado para 45s com retry automático
- ✅ Todos os 60+ comandos de logo funcionando perfeitamente

### 03 de Novembro de 2025
- Importado e configurado para Replit
