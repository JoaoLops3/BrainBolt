const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { program } = require('commander');

// Configuração via linha de comando
program
  .option('-p, --port <port>', 'Porta serial do Arduino', '/dev/ttyUSB0')
  .option('-b, --baudrate <rate>', 'Taxa de transmissão', '115200')
  .option('-w, --ws <url>', 'URL do WebSocket', 'ws://localhost:8080/ws/hardware')
  .option('-v, --verbose', 'Modo verboso')
  .parse();

const options = program.opts();

console.log('🚀 Brain Bolt - Bridge Serial Real para Arduino');
console.log('===============================================');
console.log(`📡 Porta Serial: ${options.port}`);
console.log(`📊 Baudrate: ${options.baudrate}`);
console.log(`🌐 WebSocket: ${options.ws}`);
console.log('');

let serialPort;
let ws;
let deviceId = 'arduino_' + Date.now();
let isConnected = false;
let arduinoConnected = false;

// Conectar ao WebSocket
function connectWebSocket() {
  console.log('🔌 Conectando ao WebSocket...');
  
  ws = new WebSocket(options.ws);
  
  ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket!');
    isConnected = true;
    
    // Registrar dispositivo Arduino
    ws.send(JSON.stringify({
      type: 'register',
      device: 'arduino_real',
      mac: deviceId
    }));
    
    console.log('📱 Dispositivo Arduino registrado:', deviceId);
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket desconectado');
    isConnected = false;
    
    // Tentar reconectar em 5 segundos
    setTimeout(connectWebSocket, 5000);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error.message);
  });
}

// Processar mensagens do WebSocket
function handleWebSocketMessage(message) {
  if (options.verbose) {
    console.log('📨 Mensagem WebSocket:', message.type);
  }

  switch (message.type) {
    case 'registered':
      console.log('✅ Dispositivo registrado no servidor');
      break;

    case 'test_buttons_start':
      console.log('🧪 Teste de botões iniciado no Arduino');
      sendToArduino({
        type: 'test_buttons_start',
        message: 'Teste iniciado'
      });
      break;

    case 'led_control':
      console.log(`💡 Controlando LED ${message.led}: ${message.action}`);
      sendToArduino({
        type: 'led_control',
        led: message.led,
        action: message.action,
        duration: message.duration
      });
      break;

    case 'game_start':
      console.log('🎮 Iniciando jogo no Arduino');
      sendToArduino({
        type: 'game_start',
        game_mode: message.game_mode
      });
      break;

    case 'button_press_received':
      console.log(`🔘 Botão ${message.button} recebido pelo servidor`);
      break;

    default:
      if (options.verbose) {
        console.log('📨 Mensagem não tratada:', message.type);
      }
  }
}

// Conectar ao Arduino via Serial
function connectArduino() {
  console.log(`🔌 Conectando ao Arduino em ${options.port}...`);
  
  try {
    serialPort = new SerialPort({
      path: options.port,
      baudRate: parseInt(options.baudrate),
      autoOpen: false
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => {
      console.log('✅ Arduino conectado via Serial!');
      arduinoConnected = true;
      
      // Enviar comando de conexão para o Arduino
      sendToArduino({
        type: 'connected',
        device_id: deviceId
      });
    });

    parser.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString().trim());
        handleArduinoMessage(message);
      } catch (error) {
        // Se não for JSON, tratar como mensagem de texto
        console.log('📱 Arduino:', data.toString().trim());
      }
    });

    serialPort.on('error', (error) => {
      console.error('❌ Erro Serial:', error.message);
      arduinoConnected = false;
      
      // Tentar reconectar em 5 segundos
      setTimeout(connectArduino, 5000);
    });

    serialPort.on('close', () => {
      console.log('🔌 Arduino desconectado');
      arduinoConnected = false;
      
      // Tentar reconectar em 5 segundos
      setTimeout(connectArduino, 5000);
    });

    serialPort.open();

  } catch (error) {
    console.error('❌ Erro ao conectar Arduino:', error.message);
    console.log('💡 Verifique se:');
    console.log('   - O Arduino está conectado via USB');
    console.log('   - A porta está correta (use: ls /dev/tty* para listar)');
    console.log('   - O Arduino IDE não está usando a porta');
    console.log('   - O código está carregado no Arduino');
    
    // Tentar reconectar em 10 segundos
    setTimeout(connectArduino, 10000);
  }
}

// Processar mensagens do Arduino
function handleArduinoMessage(message) {
  if (options.verbose) {
    console.log('📱 Mensagem Arduino:', message.type);
  }

  switch (message.type) {
    case 'button_press':
      console.log(`🔘 Botão ${message.button} pressionado no Arduino!`);
      
      // Enviar para o WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'button_press',
          button: message.button,
          player_id: message.player_id,
          timestamp: message.timestamp
        }));
      }
      break;

    case 'hardware_test':
      console.log('🔧 Teste de hardware concluído no Arduino');
      break;

    case 'error':
      console.error('❌ Erro do Arduino:', message.message);
      break;

    default:
      if (options.verbose) {
        console.log('📱 Mensagem Arduino não tratada:', message.type);
      }
  }
}

// Enviar mensagem para o Arduino
function sendToArduino(message) {
  if (serialPort && serialPort.isOpen) {
    const jsonMessage = JSON.stringify(message) + '\n';
    serialPort.write(jsonMessage);
    
    if (options.verbose) {
      console.log('📤 Enviado para Arduino:', message.type);
    }
  } else {
    console.warn('⚠️ Arduino não conectado');
  }
}

// Listar portas seriais disponíveis
function listSerialPorts() {
  console.log('🔍 Portas seriais disponíveis:');
  SerialPort.list().then(ports => {
    if (ports.length === 0) {
      console.log('   Nenhuma porta encontrada');
    } else {
      ports.forEach(port => {
        console.log(`   ${port.path} - ${port.manufacturer || 'Desconhecido'}`);
      });
    }
    console.log('');
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando bridge...');
  
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  
  if (ws) {
    ws.close();
  }
  
  console.log('✅ Bridge encerrado');
  process.exit(0);
});

// Iniciar conexões
console.log('🚀 Iniciando bridge...');

// Listar portas disponíveis
listSerialPorts();

// Conectar ao WebSocket
connectWebSocket();

// Conectar ao Arduino após 2 segundos
setTimeout(connectArduino, 2000);

// Heartbeat para manter conexões
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
