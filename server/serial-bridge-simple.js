const WebSocket = require('ws');
const { program } = require('commander');
const { spawn } = require('child_process');

// Configuração via linha de comando
program
  .option('-p, --port <port>', 'Porta serial do Arduino', '/dev/ttyUSB0')
  .option('-w, --ws <url>', 'URL do WebSocket', 'ws://localhost:8080/ws/hardware')
  .option('-v, --verbose', 'Modo verboso')
  .parse();

const options = program.opts();

console.log('🚀 Brain Bolt - Bridge Serial Simplificado para Arduino');
console.log('=====================================================');
console.log(`📡 Porta Serial: ${options.port}`);
console.log(`🌐 WebSocket: ${options.ws}`);
console.log('');

let ws;
let deviceId = 'arduino_' + Date.now();
let isConnected = false;
let arduinoProcess;

// Conectar ao WebSocket
function connectWebSocket() {
  console.log('🔌 Conectando ao WebSocket...');
  
  ws = new WebSocket(options.ws);
  
  ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket!');
    isConnected = true;
    
    // Registrar dispositivo Arduino real
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
      sendToArduino(`{"type":"test_buttons_start","message":"Teste iniciado"}\n`);
      break;

    case 'led_control':
      console.log(`💡 Controlando LED ${message.led}: ${message.action}`);
      sendToArduino(`{"type":"led_control","led":"${message.led}","action":"${message.action}","duration":${message.duration}}\n`);
      break;

    case 'question_update':
      console.log(`📝 Nova pergunta enviada para Arduino: "${message.question.text}"`);
      console.log(`   Resposta correta: ${String.fromCharCode(65 + message.question.correctAnswer)}`);
      sendToArduino(`{"type":"question_update","question":${JSON.stringify(message.question)}}\n`);
      break;

    default:
      if (options.verbose) {
        console.log('📨 Mensagem não tratada:', message.type);
      }
  }
}

// Conectar ao Arduino via cat (comando Unix)
function connectArduino() {
  console.log(`🔌 Conectando ao Arduino em ${options.port}...`);
  
  try {
    // Usar cat para ler da porta serial
    arduinoProcess = spawn('cat', [options.port], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    arduinoProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (line.length > 0) {
          handleArduinoMessage(line);
        }
      });
    });

    arduinoProcess.stderr.on('data', (data) => {
      console.error('❌ Erro Serial:', data.toString());
    });

    arduinoProcess.on('close', (code) => {
      console.log(`🔌 Arduino desconectado (código: ${code})`);
      
      // Tentar reconectar em 5 segundos
      setTimeout(connectArduino, 5000);
    });

    arduinoProcess.on('error', (error) => {
      console.error('❌ Erro ao conectar Arduino:', error.message);
      console.log('💡 Verifique se:');
      console.log('   - O Arduino está conectado via USB');
      console.log('   - A porta está correta (use: ls /dev/tty* para listar)');
      console.log('   - O Arduino IDE não está usando a porta');
      console.log('   - O código está carregado no Arduino');
      
      // Tentar reconectar em 10 segundos
      setTimeout(connectArduino, 10000);
    });

    console.log('✅ Arduino conectado via Serial!');
    
    // Enviar comando de conexão para o Arduino
    setTimeout(() => {
      sendToArduino(`{"type":"connected","device_id":"${deviceId}"}\n`);
    }, 1000);

  } catch (error) {
    console.error('❌ Erro ao conectar Arduino:', error.message);
    
    // Tentar reconectar em 10 segundos
    setTimeout(connectArduino, 10000);
  }
}

// Processar mensagens do Arduino
function handleArduinoMessage(line) {
  try {
    const message = JSON.parse(line);
    
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
  } catch (error) {
    // Se não for JSON, tratar como mensagem de texto
    console.log('📱 Arduino:', line);
  }
}

// Enviar mensagem para o Arduino
function sendToArduino(message) {
  if (arduinoProcess && arduinoProcess.stdin) {
    arduinoProcess.stdin.write(message);
    
    if (options.verbose) {
      console.log('📤 Enviado para Arduino:', message.trim());
    }
  } else {
    console.warn('⚠️ Arduino não conectado');
  }
}

// Listar portas seriais disponíveis
function listSerialPorts() {
  console.log('🔍 Portas seriais disponíveis:');
  
  const { spawn } = require('child_process');
  const lsProcess = spawn('ls', ['/dev/tty*'], { stdio: 'pipe' });
  
  lsProcess.stdout.on('data', (data) => {
    const ports = data.toString().split('\n').filter(port => 
      port.includes('ttyUSB') || port.includes('ttyACM') || port.includes('tty.usb')
    );
    
    if (ports.length === 0) {
      console.log('   Nenhuma porta Arduino encontrada');
    } else {
      ports.forEach(port => {
        console.log(`   ${port}`);
      });
    }
    console.log('');
  });
  
  lsProcess.on('close', () => {
    // Continuar com a inicialização
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando bridge...');
  
  if (arduinoProcess) {
    arduinoProcess.kill();
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
