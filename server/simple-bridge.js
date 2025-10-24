#!/usr/bin/env node

/**
 * Brain Bolt - WebSocket Bridge Simplificado
 * 
 * Este script conecta diretamente ao servidor WebSocket
 * Permite que o modo físico funcione mesmo sem Arduino conectado
 * 
 * Uso:
 * node simple-bridge.js --ws ws://localhost:8080/ws/hardware
 */

const WebSocket = require('ws');
const { program } = require('commander');

// Configuração via linha de comando
program
  .option('-w, --ws <url>', 'URL do WebSocket', 'ws://localhost:8080/ws/hardware')
  .option('-v, --verbose', 'Modo verboso')
  .parse();

const options = program.opts();

console.log('🚀 Brain Bolt - WebSocket Bridge Simplificado');
console.log('=============================================');
console.log(`🌐 WebSocket: ${options.ws}`);
console.log('');

let ws;
let deviceId = 'web_client_' + Date.now();
let isConnected = false;

// Conectar ao WebSocket
function connectWebSocket() {
  console.log('🔌 Conectando ao WebSocket...');
  
  ws = new WebSocket(options.ws);
  
  ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket!');
    isConnected = true;
    
    // Registrar dispositivo como simulado
    ws.send(JSON.stringify({
      type: 'register',
      device: 'web_client',
      mac: deviceId
    }));
    
    console.log('📱 Dispositivo web registrado:', deviceId);
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (options.verbose) {
        console.log('📨 Mensagem recebida:', message.type);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
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

// Simular botões físicos via teclado
function setupKeyboardSimulation() {
  console.log('⌨️  Simulação de botões via teclado:');
  console.log('   A, B, C, D - Botões de resposta');
  console.log('   F - Botão rápido');
  console.log('   LED A, B, C, D, FAST - Testar LEDs');
  console.log('   TEST - Iniciar teste de botões');
  console.log('   help - Mostrar ajuda completa');
  console.log('   quit - Sair');
  console.log('');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', (input) => {
    const key = input.trim().toUpperCase();
    
    if (['A', 'B', 'C', 'D', 'F'].includes(key)) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const button = key === 'F' ? 'FAST' : key;
        
        ws.send(JSON.stringify({
          type: 'button_press',
          button: button,
          player_id: deviceId,
          timestamp: Date.now()
        }));
        
        console.log(`🔘 Botão ${button} pressionado!`);
      } else {
        console.log('❌ WebSocket não conectado');
      }
    } else if (key === 'HELP' || key === 'H') {
      console.log('⌨️  Comandos disponíveis:');
      console.log('   A, B, C, D - Botões de resposta');
      console.log('   F - Botão rápido');
      console.log('   LED A, B, C, D, FAST - Testar LEDs');
      console.log('   TEST - Iniciar teste de botões');
      console.log('   help - Mostrar esta ajuda');
      console.log('   quit - Sair');
    } else if (key.startsWith('LED ')) {
      const led = key.replace('LED ', '');
      if (['A', 'B', 'C', 'D', 'FAST'].includes(led)) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'control_leds',
            led: led,
            action: 'on',
            duration: 1000
          }));
          console.log(`💡 LED ${led} ligado!`);
        } else {
          console.log('❌ WebSocket não conectado');
        }
      } else {
        console.log('❓ LED inválido. Use: LED A, LED B, LED C, LED D, LED FAST');
      }
    } else if (key === 'TEST') {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'test_buttons'
        }));
        console.log('🧪 Teste de botões iniciado!');
      } else {
        console.log('❌ WebSocket não conectado');
      }
    } else if (key === 'QUIT' || key === 'Q') {
      console.log('👋 Encerrando bridge...');
      process.exit(0);
    } else {
      console.log('❓ Comando desconhecido. Digite "help" para ajuda.');
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando bridge...');
  
  if (ws) {
    ws.close();
  }
  
  console.log('✅ Bridge encerrado');
  process.exit(0);
});

// Iniciar conexão
console.log('🚀 Iniciando bridge...');
connectWebSocket();

// Configurar simulação de teclado após 2 segundos
setTimeout(setupKeyboardSimulation, 2000);

// Heartbeat para manter conexão
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
