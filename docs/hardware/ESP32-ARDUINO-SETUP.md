# 🎮 Brain Bolt - Sistema de Botões Físicos com ESP32/Arduino

## 📖 Visão Geral

Este tutorial ensina como construir o sistema de botões físicos para o modo de sala de aula do Brain Bolt usando ESP32 ou Arduino. O sistema permite que alunos respondam perguntas usando botões físicos conectados ao jogo.

## 🎯 O que você vai construir

Um sistema com:

- **4 botões coloridos** (A, B, C, D) - Para escolher as respostas
- **1 botão especial** - Botão de resposta rápida (primeiro a responder)
- **LEDs indicadores** - Feedback visual das respostas
- **Buzzer** - Feedback sonoro
- **Display OLED** (opcional) - Mostrar informações do jogo

---

## 🛠️ Materiais Necessários

### Opção 1: ESP32 (Recomendado)

- **1x ESP32 DevKit** (~R$ 30-50)
- **5x Botões Push Button** (arcade buttons ou push buttons grandes)
- **5x LEDs** (vermelho, verde, azul, amarelo, branco)
- **5x Resistores 220Ω** (para LEDs)
- **5x Resistores 10kΩ** (pull-down para botões)
- **1x Buzzer passivo**
- **1x Display OLED 0.96" I2C** (opcional)
- **Protoboard** ou **Placa PCB**
- **Jumpers** e fios
- **Caixa/Case** para montagem (pode ser MDF, acrílico ou impressão 3D)
- **Cabo USB** para ESP32

### Opção 2: Arduino Uno

- **1x Arduino Uno**
- Mesmos componentes da Opção 1
- **Módulo Bluetooth HC-05** ou **Shield Ethernet**

---

## 🔧 Esquema de Conexões - ESP32

### Pinout do ESP32

```
ESP32 DevKit           Componentes
─────────────          ───────────

GPIO 23  ──────────→  Botão A (Vermelho) + LED Vermelho
GPIO 22  ──────────→  Botão B (Verde) + LED Verde
GPIO 21  ──────────→  Botão C (Azul) + LED Azul
GPIO 19  ──────────→  Botão D (Amarelo) + LED Amarelo
GPIO 18  ──────────→  Botão RÁPIDO (Branco) + LED Branco

GPIO 5   ──────────→  Buzzer (+)
GND      ──────────→  Buzzer (-)

GPIO 32  ──────────→  LED Vermelho (com resistor 220Ω)
GPIO 33  ──────────→  LED Verde (com resistor 220Ω)
GPIO 25  ──────────→  LED Azul (com resistor 220Ω)
GPIO 26  ──────────→  LED Amarelo (com resistor 220Ω)
GPIO 27  ──────────→  LED Branco (com resistor 220Ω)

GPIO 22  ──────────→  Display OLED (SCL) [opcional]
GPIO 21  ──────────→  Display OLED (SDA) [opcional]

3.3V     ──────────→  VCC Display OLED
GND      ──────────→  GND (comum para todos)
```

### Diagrama de Circuito

```
                    ESP32
          ┌──────────────────────┐
          │                      │
   Botão A├─GPIO23         GPIO32├─→ LED A ──[220Ω]── GND
   Botão B├─GPIO22         GPIO33├─→ LED B ──[220Ω]── GND
   Botão C├─GPIO21         GPIO25├─→ LED C ──[220Ω]── GND
   Botão D├─GPIO19         GPIO26├─→ LED D ──[220Ω]── GND
   Botão R├─GPIO18         GPIO27├─→ LED R ──[220Ω]── GND
          │                      │
    Buzzer├─GPIO5           GND  ├─→ GND comum
          │                      │
          │    I2C (Opcional)    │
  OLED SDA├─GPIO21               │
  OLED SCL├─GPIO22               │
          │                      │
          └──────────────────────┘

Cada botão:
         GPIO ─→ [Botão] ─→ GND
                    │
                 [10kΩ] (pull-down)
                    │
                   GND
```

---

## 💻 Código para ESP32

### 1. Instalação do Arduino IDE

1. Baixe o [Arduino IDE](https://www.arduino.cc/en/software)
2. Instale o suporte para ESP32:
   - Vá em `File → Preferences`
   - Em "Additional Board Manager URLs", adicione:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Vá em `Tools → Board → Boards Manager`
   - Procure por "ESP32" e instale "esp32 by Espressif Systems"

### 2. Instalar Bibliotecas

No Arduino IDE, vá em `Sketch → Include Library → Manage Libraries` e instale:

- **ArduinoJson** (by Benoit Blanchon)
- **WebSockets** (by Markus Sattler)
- **Adafruit SSD1306** (opcional, para display OLED)
- **Adafruit GFX Library** (opcional, para display OLED)

### 3. Código Principal

Crie um novo sketch e cole o código abaixo:

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// ============================================
// CONFIGURAÇÕES - ALTERE AQUI!
// ============================================
const char* ssid = "SEU_WIFI_AQUI"; // Nome da sua rede WiFi
const char* password = "SUA_SENHA_AQUI"; // Senha do WiFi
const char\* serverIP = "192.168.1.100"; // IP do servidor Brain Bolt
const int serverPort = 8080; // Porta do servidor

// ============================================
// PINOS - ESP32
// ============================================
// Botões
const int BUTTON_A = 23;
const int BUTTON_B = 22;
const int BUTTON_C = 21;
const int BUTTON_D = 19;
const int BUTTON_FAST = 18;

// LEDs
const int LED_A = 32;
const int LED_B = 33;
const int LED_C = 25;
const int LED_D = 26;
const int LED_FAST = 27;

// Buzzer
const int BUZZER = 5;

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
WebSocketsClient webSocket;
bool connected = false;
String roomCode = "";
String playerId = "";

// Estado dos botões (debounce)
unsigned long lastDebounceTime[5] = {0};
const unsigned long debounceDelay = 50;
bool lastButtonState[5] = {LOW};
bool buttonState[5] = {LOW};

// ============================================
// SETUP
// ============================================
void setup() {
Serial.begin(115200);
Serial.println("\n\n=================================");
Serial.println("Brain Bolt - Hardware Controller");
Serial.println("=================================\n");

// Configurar pinos dos botões (INPUT_PULLDOWN)
pinMode(BUTTON_A, INPUT_PULLDOWN);
pinMode(BUTTON_B, INPUT_PULLDOWN);
pinMode(BUTTON_C, INPUT_PULLDOWN);
pinMode(BUTTON_D, INPUT_PULLDOWN);
pinMode(BUTTON_FAST, INPUT_PULLDOWN);

// Configurar pinos dos LEDs (OUTPUT)
pinMode(LED_A, OUTPUT);
pinMode(LED_B, OUTPUT);
pinMode(LED_C, OUTPUT);
pinMode(LED_D, OUTPUT);
pinMode(LED_FAST, OUTPUT);

// Configurar buzzer
pinMode(BUZZER, OUTPUT);

// Teste inicial dos LEDs e buzzer
testHardware();

// Conectar ao WiFi
connectWiFi();

// Configurar WebSocket
setupWebSocket();
}

// ============================================
// LOOP PRINCIPAL
// ============================================
void loop() {
webSocket.loop();

// Verificar botões
checkButtons();

// Piscar LED de conexão se não conectado
if (!connected) {
static unsigned long lastBlink = 0;
if (millis() - lastBlink > 500) {
digitalWrite(LED_FAST, !digitalRead(LED_FAST));
lastBlink = millis();
}
}
}

// ============================================
// FUNÇÕES DE REDE
// ============================================
void connectWiFi() {
Serial.print("Conectando ao WiFi");
WiFi.begin(ssid, password);

int attempts = 0;
while (WiFi.status() != WL_CONNECTED && attempts < 30) {
delay(500);
Serial.print(".");
digitalWrite(LED_FAST, !digitalRead(LED_FAST));
attempts++;
}

if (WiFi.status() == WL_CONNECTED) {
Serial.println("\n✓ WiFi Conectado!");
Serial.print("IP: ");
Serial.println(WiFi.localIP());
playSuccess();
} else {
Serial.println("\n✗ Falha ao conectar WiFi");
playError();
}
}

void setupWebSocket() {
webSocket.begin(serverIP, serverPort, "/ws/hardware");
webSocket.onEvent(webSocketEvent);
webSocket.setReconnectInterval(5000);
Serial.println("WebSocket configurado");
}

void webSocketEvent(WStype_t type, uint8_t \* payload, size_t length) {
switch(type) {
case WStype_DISCONNECTED:
Serial.println("WebSocket Desconectado");
connected = false;
allLEDsOff();
break;

    case WStype_CONNECTED:
      Serial.println("WebSocket Conectado!");
      connected = true;
      playSuccess();
      // Registrar dispositivo
      registerDevice();
      break;

    case WStype_TEXT:
      handleMessage((char*)payload);
      break;

    case WStype_ERROR:
      Serial.println("WebSocket Erro");
      playError();
      break;

}
}

void registerDevice() {
StaticJsonDocument<200> doc;
doc["type"] = "register";
doc["device"] = "esp32_buttons";
doc["mac"] = WiFi.macAddress();

String output;
serializeJson(doc, output);
webSocket.sendTXT(output);
Serial.println("Dispositivo registrado");
}

void handleMessage(char\* payload) {
StaticJsonDocument<512> doc;
DeserializationError error = deserializeJson(doc, payload);

if (error) {
Serial.print("JSON Error: ");
Serial.println(error.c_str());
return;
}

const char\* type = doc["type"];

if (strcmp(type, "room_joined") == 0) {
roomCode = doc["room_code"].as<String>();
playerId = doc["player_id"].as<String>();
Serial.print("Sala: ");
Serial.println(roomCode);
playSuccess();
}
else if (strcmp(type, "question_start") == 0) {
// Nova pergunta - ligar todos os LEDs
allLEDsOn();
playTone(1000, 200);
}
else if (strcmp(type, "answer_correct") == 0) {
// Resposta correta
playSuccess();
flashLED(LED_FAST, 5);
}
else if (strcmp(type, "answer_wrong") == 0) {
// Resposta errada
playError();
}
else if (strcmp(type, "game_end") == 0) {
// Fim do jogo
celebrationAnimation();
}
}

// ============================================
// FUNÇÕES DOS BOTÕES
// ============================================
void checkButtons() {
checkButton(0, BUTTON_A, LED_A, "A");
checkButton(1, BUTTON_B, LED_B, "B");
checkButton(2, BUTTON_C, LED_C, "C");
checkButton(3, BUTTON_D, LED_D, "D");
checkButton(4, BUTTON_FAST, LED_FAST, "FAST");
}

void checkButton(int index, int buttonPin, int ledPin, const char\* buttonName) {
int reading = digitalRead(buttonPin);

if (reading != lastButtonState[index]) {
lastDebounceTime[index] = millis();
}

if ((millis() - lastDebounceTime[index]) > debounceDelay) {
if (reading != buttonState[index]) {
buttonState[index] = reading;

      if (buttonState[index] == HIGH) {
        onButtonPress(buttonName, ledPin);
      }
    }

}

lastButtonState[index] = reading;
}

void onButtonPress(const char\* button, int ledPin) {
Serial.print("Botão pressionado: ");
Serial.println(button);

// Acender LED
digitalWrite(ledPin, HIGH);

// Som de clique
playTone(800, 50);

// Enviar para servidor
if (connected) {
StaticJsonDocument<200> doc;
doc["type"] = "button_press";
doc["button"] = button;
doc["player_id"] = playerId;
doc["timestamp"] = millis();

    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(output);

}

// Apagar LED após 300ms
delay(300);
digitalWrite(ledPin, LOW);
}

// ============================================
// FUNÇÕES DE LEDs
// ============================================
void allLEDsOn() {
digitalWrite(LED_A, HIGH);
digitalWrite(LED_B, HIGH);
digitalWrite(LED_C, HIGH);
digitalWrite(LED_D, HIGH);
digitalWrite(LED_FAST, HIGH);
}

void allLEDsOff() {
digitalWrite(LED_A, LOW);
digitalWrite(LED_B, LOW);
digitalWrite(LED_C, LOW);
digitalWrite(LED_D, LOW);
digitalWrite(LED_FAST, LOW);
}

void flashLED(int ledPin, int times) {
for (int i = 0; i < times; i++) {
digitalWrite(ledPin, HIGH);
delay(100);
digitalWrite(ledPin, LOW);
delay(100);
}
}

void celebrationAnimation() {
for (int i = 0; i < 3; i++) {
allLEDsOn();
playTone(1000, 200);
delay(200);
allLEDsOff();
delay(200);
}
}

// ============================================
// FUNÇÕES DE SOM
// ============================================
void playTone(int frequency, int duration) {
tone(BUZZER, frequency, duration);
delay(duration);
noTone(BUZZER);
}

void playSuccess() {
playTone(1000, 100);
delay(50);
playTone(1500, 100);
delay(50);
playTone(2000, 200);
}

void playError() {
playTone(300, 200);
delay(100);
playTone(200, 300);
}

// ============================================
// TESTE DE HARDWARE
// ============================================
void testHardware() {
Serial.println("Testando hardware...");

// Testar LEDs
int leds[] = {LED_A, LED_B, LED_C, LED_D, LED_FAST};
for (int i = 0; i < 5; i++) {
digitalWrite(leds[i], HIGH);
playTone(500 + (i \* 200), 100);
delay(200);
digitalWrite(leds[i], LOW);
}

// Testar todos acesos
allLEDsOn();
playTone(1500, 300);
delay(500);
allLEDsOff();

Serial.println("✓ Teste concluído\n");
}

````

---

## 📱 Integração com o App Brain Bolt

### Backend - Criar endpoint WebSocket

Adicione no seu servidor (Node.js/Supabase Edge Function):

```typescript
// server/websocket-handler.ts
import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080, path: '/ws/hardware' });

const hardwareDevices = new Map();
const gameRooms = new Map();

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 Hardware conectado');

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'register':
          handleRegister(ws, message);
          break;
        case 'button_press':
          handleButtonPress(message);
          break;
        case 'join_room':
          handleJoinRoom(ws, message);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Hardware desconectado');
    // Remover dispositivo
    hardwareDevices.forEach((device, key) => {
      if (device.ws === ws) {
        hardwareDevices.delete(key);
      }
    });
  });
});

function handleRegister(ws: WebSocket, message: any) {
  const deviceId = message.mac;
  hardwareDevices.set(deviceId, {
    ws,
    type: message.device,
    mac: message.mac,
    connectedAt: new Date()
  });

  ws.send(JSON.stringify({
    type: 'registered',
    device_id: deviceId
  }));

  console.log(`✓ Dispositivo registrado: ${deviceId}`);
}

function handleButtonPress(message: any) {
  const { button, player_id, timestamp } = message;

  // Processar resposta no banco de dados
  processAnswer(player_id, button, timestamp);

  // Notificar outros clientes
  broadcastToRoom(message.room_id, {
    type: 'button_pressed',
    button,
    player_id,
    timestamp
  });
}

function handleJoinRoom(ws: WebSocket, message: any) {
  const { room_code, player_id } = message;

  if (!gameRooms.has(room_code)) {
    gameRooms.set(room_code, new Set());
  }

  gameRooms.get(room_code).add(ws);

  ws.send(JSON.stringify({
    type: 'room_joined',
    room_code,
    player_id
  }));
}

function broadcastToRoom(roomId: string, message: any) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify(message);
  room.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log('🚀 WebSocket Server rodando na porta 8080');
````

---

## 🏗️ Montagem Física

### Opção 1: Caixa Individual (1 jogador)

```
┌─────────────────────────────────────┐
│         BRAIN BOLT                  │
│                                     │
│    ┌───┐  ┌───┐  ┌───┐  ┌───┐       │
│    │ A │  │ B │  │ C │  │ D │       │  ← Botões de resposta
│    └───┘  └───┘  └───┘  └───┘       │
│                                     │
│           ┌─────────┐               │
│           │  RÁPIDO │               │  ← Botão de resposta rápida
│           └─────────┘               │
│                                     │
│     [Display OLED - Opcional]       │
│                                     │
│         [ESP32 interno]             │
└─────────────────────────────────────┘
```

### Opção 2: Mesa Múltipla (4 jogadores)

```
              Jogador 2
                 ↑
         ┌───┬───┬───┬───┐
         │ A │ B │ C │ D │
         └───┴───┴───┴───┘
                 │
Jogador 1 ←──────┼──────→ Jogador 3
                 │
         ┌───┬───┬───┬───┐
         │ A │ B │ C │ D │
         └───┴───┴───┴───┘
                 ↓
              Jogador 4

     [Display Central + ESP32]
```

### Materiais para Case

**MDF 3mm:**

- Corte as peças em uma cortadora laser
- Arquivo DXF disponível em `docs/hardware/case-design.dxf`

**Impressão 3D:**

- Arquivos STL em `docs/hardware/3d-models/`

**Acrílico:**

- Mais durável, use parafusos M3

---

## 🔧 Configuração e Uso

### 1. Preparar o ESP32

1. Abra o código no Arduino IDE
2. Altere as configurações no início do código:

   ```cpp
   const char* ssid = "SEU_WIFI_AQUI";
   const char* password = "SUA_SENHA_AQUI";
   const char* serverIP = "192.168.1.100";  // IP do servidor Brain Bolt
   ```

3. Selecione a placa:

   - `Tools → Board → ESP32 Dev Module`

4. Selecione a porta:

   - `Tools → Port → /dev/ttyUSB0` (Linux)
   - `Tools → Port → COM3` (Windows)

5. Upload:
   - Clique em "Upload" (→)
   - Aguarde "Done uploading"

### 2. Configurar o Servidor Brain Bolt

1. No arquivo `.env.local`:

   ```bash
   VITE_ENABLE_PHYSICAL_MODE=true
   VITE_SERIAL_PORT=/dev/ttyUSB0
   ```

2. Inicie o servidor WebSocket:
   ```bash
   npm run server:ws
   ```

### 3. Conectar e Testar

1. Ligue o ESP32
2. Observe o Serial Monitor:

   - `Tools → Serial Monitor`
   - Baud rate: 115200

3. Verifique:

   ```
   ✓ WiFi Conectado!
   IP: 192.168.1.XXX
   WebSocket Conectado!
   Dispositivo registrado
   ```

4. No app Brain Bolt:
   - Entre em "Salas Educacionais"
   - Crie uma sala como professor
   - Selecione "Modo Físico"
   - Os botões devem aparecer como conectados

---

## 🐛 Solução de Problemas

### ESP32 não conecta ao WiFi

- Verifique SSID e senha
- ESP32 só suporta WiFi 2.4GHz (não 5GHz)
- Tente resetar o ESP32

### Botões não respondem

- Verifique as conexões dos pinos
- Teste no Serial Monitor se os botões estão sendo detectados
- Verifique os resistores pull-down (10kΩ)

### WebSocket desconecta

- Verifique se o servidor está rodando
- Verifique o IP do servidor
- Verifique firewall

### LEDs não acendem

- Verifique polaridade dos LEDs (perna longa = +)
- Verifique resistores (220Ω)
- Teste com um LED simples direto no GPIO

---
