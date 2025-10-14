# 🔧 Brain Bolt - Servidor WebSocket para Hardware Físico

Este é o servidor WebSocket que gerencia a comunicação entre os dispositivos ESP32/Arduino e o aplicativo Brain Bolt.

## 📋 Pré-requisitos

- Node.js 18+
- Dispositivos ESP32/Arduino configurados (veja [../docs/hardware/ESP32-ARDUINO-SETUP.md](../docs/hardware/ESP32-ARDUINO-SETUP.md))

## 🚀 Instalação

```bash
cd server
npm install
```

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no diretório `server/` baseado no arquivo `env.example`:

```bash
cp env.example .env
```

### 2. Preencher Credenciais do Supabase

Edite o arquivo `.env` e preencha com suas credenciais do Supabase:

```env
# Porta do servidor WebSocket
WS_PORT=8080

# Ambiente (development ou production)
NODE_ENV=development

# Credenciais do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

**⚠️ IMPORTANTE:**

- **Nunca commite o arquivo `.env`** no Git (ele já está no `.gitignore`)
- As credenciais podem ser encontradas no [dashboard do Supabase](https://supabase.com/dashboard) em: Settings → API
- Use a **anon/public key** para operações básicas
- Para produção com operações sensíveis, considere usar a **service_role_key**

## ▶️ Execução

### Desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor iniciará na porta `8080` por padrão.

## 🔌 Endpoint

- **WebSocket**: `ws://localhost:8080/ws/hardware`

## 📡 Protocolo de Comunicação

### Mensagens do ESP32 → Servidor

#### 1. Registro de Dispositivo

```json
{
  "type": "register",
  "device": "esp32_buttons",
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

**Resposta:**

```json
{
  "type": "registered",
  "device_id": "device_AA_BB_CC_DD_EE_FF",
  "server_time": "2025-10-14T12:00:00.000Z"
}
```

#### 2. Criar Sala

```json
{
  "type": "create_room"
}
```

**Resposta:**

```json
{
  "type": "room_created",
  "room_id": "room_ABC123_1697280000000",
  "room_code": "ABC123"
}
```

#### 3. Entrar em Sala

```json
{
  "type": "join_room",
  "room_code": "ABC123"
}
```

**Resposta:**

```json
{
  "type": "room_joined",
  "room_id": "room_ABC123_1697280000000",
  "room_code": "ABC123",
  "player_id": "device_AA_BB_CC_DD_EE_FF"
}
```

#### 4. Pressionar Botão

```json
{
  "type": "button_press",
  "button": "A",
  "player_id": "device_AA_BB_CC_DD_EE_FF",
  "timestamp": 1697280000000
}
```

**Resposta:**

```json
{
  "type": "answer_correct",
  "button": "A",
  "response_time": 2.5
}
```

ou

```json
{
  "type": "answer_wrong",
  "button": "A",
  "response_time": 2.5
}
```

### Mensagens do Servidor → ESP32

#### Notificações de Sala

```json
{
  "type": "player_joined",
  "device_id": "device_XX_XX_XX_XX_XX_XX",
  "total_players": 2
}
```

```json
{
  "type": "player_left",
  "device_id": "device_XX_XX_XX_XX_XX_XX",
  "total_players": 1
}
```

#### Início de Pergunta

```json
{
  "type": "question_start",
  "question_id": "uuid-here",
  "question_text": "Qual é a capital do Brasil?",
  "options": ["São Paulo", "Brasília", "Rio de Janeiro", "Salvador"],
  "start_time": "2025-10-14T12:00:00.000Z"
}
```

#### Fim de Jogo

```json
{
  "type": "game_end",
  "final_stats": {
    "total_questions": 10,
    "correct_answers": 7
  }
}
```

## 🔐 Segurança

- O servidor valida todas as mensagens recebidas
- Dispositivos inativos por mais de 5 minutos são removidos automaticamente
- Salas vazias são limpas após 10 minutos
- Heartbeat a cada 30 segundos para verificar conexões

## 📊 Monitoramento

O servidor exibe logs em tempo real:

```
🚀 Brain Bolt Hardware WebSocket Server
=========================================

✅ Servidor rodando na porta 8080
📡 WebSocket: ws://localhost:8080/ws/hardware

💡 Aguardando conexões de dispositivos ESP32/Arduino...

🔌 Nova conexão de: 192.168.1.100
✅ Dispositivo registrado: device_AA_BB_CC_DD_EE_FF (AA:BB:CC:DD:EE:FF)
📊 Total de dispositivos: 1
🏠 Sala criada: ABC123 por device_AA_BB_CC_DD_EE_FF
```

## 🐛 Troubleshooting

### Dispositivo não conecta

1. Verifique se o servidor está rodando
2. Confirme o IP e porta no código do ESP32
3. Verifique firewall

### Mensagens não chegam

1. Veja logs do servidor para identificar erros
2. Verifique formato JSON das mensagens
3. Confirme que o dispositivo está registrado

### Sala não funciona

1. Verifique se o código da sala está correto
2. Confirme que a sala não foi encerrada
3. Veja se há dispositivos ativos na sala

## 🔄 Fluxo Típico

1. ESP32 conecta ao WebSocket
2. ESP32 envia `register`
3. Servidor confirma com `registered`
4. ESP32 envia `create_room` ou `join_room`
5. Servidor confirma criação/entrada na sala
6. Professor/Host envia pergunta via `start_question`
7. Alunos respondem com `button_press`
8. Servidor processa e envia feedback
9. Repetir passos 6-8 para mais perguntas
10. Host finaliza com `end_game`

## 📝 Variáveis de Ambiente Disponíveis

| Variável            | Descrição                   | Padrão        | Obrigatório |
| ------------------- | --------------------------- | ------------- | ----------- |
| `WS_PORT`           | Porta do servidor WebSocket | `8080`        | Não         |
| `NODE_ENV`          | Ambiente de execução        | `development` | Não         |
| `SUPABASE_URL`      | URL do projeto Supabase     | -             | **Sim**     |
| `SUPABASE_ANON_KEY` | Chave pública do Supabase   | -             | **Sim**     |

## 🚀 Deploy em Produção

### Opção 1: VPS (Digital Ocean, AWS, etc)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start npm --name "brainbolt-ws" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Opção 2: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
```

## 📚 Integração com Supabase

O servidor se conecta ao Supabase para:

- Salvar respostas dos alunos
- Buscar perguntas customizadas
- Registrar estatísticas de uso

O servidor utiliza um cliente Supabase configurado especificamente para ambiente Node.js (`supabase-server.ts`), sem dependências de APIs do navegador como `localStorage`. Isso garante compatibilidade total com o ambiente de servidor.

## 🤝 Contribuindo

Para contribuir com melhorias no servidor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](../LICENSE) para detalhes.

---

**Desenvolvido por**: João Gabriel Lopes Aguiar  
**Projeto**: Brain Bolt - Quiz Educacional  
**Versão**: 1.0.0
