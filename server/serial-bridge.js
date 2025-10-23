#!/usr/bin/env node

/**
 * Brain Bolt - Serial to WebSocket Bridge
 * 
 * Este script conecta o Arduino (via Serial) ao servidor WebSocket
 * Permite que os botões físicos controlem o jogo web
 * 
 * Uso:
 * node serial-bridge.js --port /dev/ttyUSB0 --ws ws://localhost:8080/ws/hardware
 */

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const WebSocket = require('ws');
const { program } = require('commander');

// Configuração via linha de comando
program
  .option('-p, --port <port>', 'Porta serial do Arduino', '/dev/ttyUSB0')
  .option('-w, --ws <url>', 'URL do WebSocket', 'ws://localhost:8080/ws/hardware')
  .option('-b, --baud <rate>', 'Taxa de baud do Arduino', '115200')
  .option('-v, --verbose', 'Modo verboso')
  .parse();

const options = program.opts();

console.log('🚀 Brain Bolt - Serial to WebSocket Bridge');
console.log('==========================================');
console.log(`📡 Porta Serial: ${options.port}`);
console.log(`🌐 WebSocket: ${options.ws}`);
console.log(`⚡ Baud Rate: ${options.baud}`);
console.log('');

let serialPort;
let ws;
let deviceId = 'arduino_' + Date.now();
let isConnected = false;
let reconnectInterval;

// Conectar ao WebSocket
function connectWebSocket() {
  console.log('🔌 Conectando ao WebSocket...');
  
  ws = new WebSocket(options.ws);
  
  ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket!');
    isConnected = true;
    
    // Registrar dispositivo
    ws.send(JSON.stringify({
      type: 'register',
      device: 'arduino',
      mac: deviceId
    }));
    
    // Enviar status de conexão para Arduino
    if (serialPort && serialPort.isOpen) {
      serialPort.write(JSON.stringify({
        type: 'connected',
        device_id: deviceId
      }) + '\n');
    }
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
    
    // Notificar Arduino
    if (serialPort && serialPort.isOpen) {
      serialPort.write(JSON.stringify({
        type: 'disconnected'
      }) + '\n');
    }
    
    // Tentar reconectar em 5 segundos
    reconnectInterval = setTimeout(connectWebSocket, 5000);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error.message);
  });
}

// Processar mensagens do WebSocket
function handleWebSocketMessage(message) {
  if (options.verbose) {
    console.log('📨 WebSocket → Arduino:', message.type);
  }
  
  // Enviar mensagem para Arduino
  if (serialPort && serialPort.isOpen) {
    serialPort.write(JSON.stringify(message) + '\n');
  }
}

// Conectar à porta serial
function connectSerial() {
  console.log('🔌 Conectando ao Arduino...');
  
  serialPort = new SerialPort(options.port, {
    baudRate: parseInt(options.baud),
    autoOpen: false
  });
  
  const parser = serialPort.pipe(new Readline({ delimiter: '\n' }));
  
  serialPort.open((error) => {
    if (error) {
      console.error('❌ Erro ao conectar Arduino:', error.message);
      console.log('🔄 Tentando novamente em 3 segundos...');
      setTimeout(connectSerial, 3000);
      return;
    }
    
    console.log('✅ Arduino conectado!');
    
    // Processar mensagens do Arduino
    parser.on('data', (data) => {
      try {
        const message = JSON.parse(data.trim());
        handleSerialMessage(message);
      } catch (error) {
        // Mensagens não-JSON são logs do Arduino
        if (data.trim().length > 0) {
          console.log('📟 Arduino:', data.trim());
        }
      }
    });
    
    serialPort.on('error', (error) => {
      console.error('❌ Erro Serial:', error.message);
    });
    
    serialPort.on('close', () => {
      console.log('🔌 Arduino desconectado');
      setTimeout(connectSerial, 3000);
    });
  });
}

// Processar mensagens do Arduino
function handleSerialMessage(message) {
  if (options.verbose) {
    console.log('📨 Arduino → WebSocket:', message.type);
  }
  
  // Enviar para WebSocket se conectado
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.log('⚠️  WebSocket não conectado, mensagem ignorada');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando bridge...');
  
  if (reconnectInterval) {
    clearTimeout(reconnectInterval);
  }
  
  if (ws) {
    ws.close();
  }
  
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  
  console.log('✅ Bridge encerrado');
  process.exit(0);
});

// Iniciar conexões
console.log('🚀 Iniciando bridge...');
connectSerial();
connectWebSocket();

// Heartbeat para manter conexão
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.ping();
  }
}, 30000);
