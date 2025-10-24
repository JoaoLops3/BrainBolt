#!/usr/bin/env node

/**
 * Brain Bolt - Servidor WebSocket Simplificado
 * Versão JavaScript pura (sem TypeScript)
 */

const WebSocket = require('ws');
const http = require('http');

console.log('🚀 Brain Bolt Hardware WebSocket Server');
console.log('=========================================\n');

// Estado
const devices = new Map();
const rooms = new Map();

// Servidor HTTP
const httpServer = http.createServer();
const wss = new WebSocket.Server({
  server: httpServer,
  path: '/ws/hardware',
});

// Conexão WebSocket
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🔌 Nova conexão de: ${clientIP}`);

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      sendError(ws, 'Mensagem inválida');
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ Erro de WebSocket:', error);
  });
});

// Processar mensagens
async function handleMessage(ws, message) {
  console.log('📨 Mensagem recebida:', message.type);

  switch (message.type) {
    case 'register':
      await handleRegister(ws, message);
      break;

    case 'button_press':
      await handleButtonPress(ws, message);
      break;

    case 'test_buttons':
      await handleTestButtons(ws, message);
      break;

    case 'control_leds':
      await handleControlLEDs(ws, message);
      break;

    case 'question_update':
      await handleQuestionUpdate(ws, message);
      break;

    case 'ping':
      // Responder ao ping
      send(ws, { type: 'pong' });
      break;

    default:
      console.log('📨 Mensagem não tratada:', message.type);
  }
}

// Registrar dispositivo
async function handleRegister(ws, message) {
  const { device, mac } = message;
  const deviceId = `device_${mac.replace(/:/g, '_')}`;
  const isRealArduino = device === 'arduino_real';

  const newDevice = {
    id: deviceId,
    ws,
    type: device,
    mac,
    isRealArduino,
    connectedAt: new Date(),
    lastActivity: new Date(),
  };

  devices.set(deviceId, newDevice);

  console.log(`✅ Dispositivo registrado: ${deviceId} (${mac}) - ${isRealArduino ? 'Arduino Real' : 'Simulado'}`);
  console.log(`📊 Total de dispositivos: ${devices.size}`);

  send(ws, {
    type: 'registered',
    device_id: deviceId,
    is_real_arduino: isRealArduino,
    server_time: new Date().toISOString(),
  });
}

// Processar botão pressionado
async function handleButtonPress(ws, message) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, 'Dispositivo não registrado');
  }

  const { button, timestamp } = message;

  console.log(`🔘 Botão ${button} pressionado por ${device.isRealArduino ? 'Arduino Real' : 'Hardware Simulado'} (${device.id})`);

  // Feedback para o dispositivo
  send(ws, {
    type: 'button_press_received',
    button,
    timestamp: Date.now(),
  });
}

// Processar teste de botões
async function handleTestButtons(ws, message) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, 'Dispositivo não registrado');
  }

  console.log(`🧪 Iniciando teste de botões para ${device.isRealArduino ? 'Arduino Real' : 'Hardware Simulado'} (${device.id})`);

  // Enviar comando de teste para o Arduino
  send(ws, {
    type: 'test_buttons_start',
    message: 'Teste de botões iniciado. Pressione os botões para testar.',
    timestamp: Date.now(),
  });

  // Simular feedback de teste após 2 segundos
  setTimeout(() => {
    send(ws, {
      type: 'test_feedback',
      message: 'Teste concluído. Todos os botões funcionando corretamente.',
      timestamp: Date.now(),
    });
  }, 2000);
}

// Controlar LEDs
async function handleControlLEDs(ws, message) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, 'Dispositivo não registrado');
  }

  const { action, led, duration } = message;

  console.log(`💡 ${device.isRealArduino ? 'Arduino Real' : 'Hardware Simulado'} - LED ${led}: ${action} por ${duration}ms`);

  // Enviar comando para o Arduino
  send(ws, {
    type: 'led_control',
    action,
    led,
    duration,
    timestamp: Date.now(),
  });
}

// Iniciar jogo
async function handleStartGame(ws, message) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, 'Dispositivo não registrado');
  }

  const { game_mode } = message;

  console.log(`🎮 Iniciando jogo ${game_mode} para ${device.isRealArduino ? 'Arduino Real' : 'Hardware Simulado'} (${device.id})`);

  // Enviar comando para o Arduino
  send(ws, {
    type: 'game_start',
    game_mode,
    message: 'Jogo iniciado. Aguarde as perguntas.',
    timestamp: Date.now(),
  });
}

// Processar atualização de pergunta
async function handleQuestionUpdate(ws, message) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, 'Dispositivo não registrado');
  }

  const { question } = message;

  console.log(`📝 ${device.isRealArduino ? 'Arduino Real' : 'Hardware Simulado'} - Nova pergunta: "${question.text}"`);
  console.log(`   Opções: A) ${question.options[0]} | B) ${question.options[1]} | C) ${question.options[2]} | D) ${question.options[3]}`);
  console.log(`   Resposta correta: ${String.fromCharCode(65 + question.correctAnswer)} (${question.options[question.correctAnswer]})`);

  // Enviar pergunta para o Arduino
  send(ws, {
    type: 'question_update',
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      category: question.category
    },
    timestamp: Date.now(),
  });
}

// Encontrar dispositivo por WebSocket
function findDeviceByWs(ws) {
  for (const device of devices.values()) {
    if (device.ws === ws) {
      return device;
    }
  }
  return undefined;
}

// Enviar mensagem
function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Enviar erro
function sendError(ws, message) {
  send(ws, {
    type: 'error',
    message,
  });
}

// Desconexão
function handleDisconnect(ws) {
  const device = findDeviceByWs(ws);
  if (device) {
    console.log(`🔌 Dispositivo desconectado: ${device.id}`);
    devices.delete(device.id);
    console.log(`📊 Total de dispositivos: ${devices.size}`);
  }
}

// Heartbeat
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  });
}, 30000);

// Iniciar servidor
const PORT = process.env.WS_PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws/hardware`);
  console.log(`\n💡 Aguardando conexões de dispositivos...\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');

  wss.clients.forEach((ws) => {
    ws.close();
  });

  httpServer.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});
