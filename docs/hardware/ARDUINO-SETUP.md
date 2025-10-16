# 🎮 Brain Bolt - Sistema de Botões Físicos com Arduino

## 📖 Visão Geral

Este tutorial ensina como construir o sistema de botões físicos para o modo de sala de aula do Brain Bolt usando Arduino. O sistema permite que alunos respondam perguntas usando botões físicos conectados ao jogo.

## 🎯 O que você vai construir

Um sistema com:

- **4 botões coloridos** (A, B, C, D) - Para escolher as respostas
- **1 botão especial** - Botão de resposta rápida (primeiro a responder)
- **LEDs indicadores** - Feedback visual das respostas
- **Buzzer** - Feedback sonoro
- **Display LCD** (opcional) - Mostrar informações do jogo

---

## 🛠️ Materiais Necessários

### Arduino Uno com Módulo WiFi

- **1x Arduino Uno R3** (~R$ 40-70)
- **1x Módulo WiFi ESP8266 (ESP-01)** ou **Shield Ethernet W5100** (~R$ 20-50)
- **5x Botões Push Button** (arcade buttons ou push buttons grandes)
- **5x LEDs** (vermelho, verde, azul, amarelo, branco)
- **5x Resistores 220Ω** (para LEDs)
- **5x Resistores 10kΩ** (pull-down para botões)
- **1x Buzzer passivo**
- **1x Display LCD 16x2 I2C** (opcional)
- **Protoboard** ou **Placa PCB**
- **Jumpers** e fios
- **Caixa/Case** para montagem (pode ser MDF, acrílico ou impressão 3D)
- **Cabo USB** para Arduino
- **Fonte de alimentação 9V** (recomendado para uso contínuo)

---

## 🔧 Esquema de Conexões - Arduino Uno

### Pinout do Arduino

```
Arduino Uno           Componentes
───────────           ───────────

Digital 2  ──────────→  Botão A (Vermelho)
Digital 3  ──────────→  Botão B (Verde)
Digital 4  ──────────→  Botão C (Azul)
Digital 5  ──────────→  Botão D (Amarelo)
Digital 6  ──────────→  Botão RÁPIDO (Branco)

Digital 7  ──────────→  LED Vermelho (com resistor 220Ω)
Digital 8  ──────────→  LED Verde (com resistor 220Ω)
Digital 9  ──────────→  LED Azul (com resistor 220Ω)
Digital 10 ──────────→  LED Amarelo (com resistor 220Ω)
Digital 11 ──────────→  LED Branco (com resistor 220Ω)

Digital 12 ──────────→  Buzzer (+)
GND        ──────────→  Buzzer (-)

A4 (SDA)   ──────────→  Display LCD (SDA) [opcional]
A5 (SCL)   ──────────→  Display LCD (SCL) [opcional]

5V         ──────────→  VCC Display LCD
GND        ──────────→  GND (comum para todos)

--- Módulo WiFi ESP8266 ---
Digital 0 (RX) ───────→  TX do ESP8266
Digital 1 (TX) ───────→  RX do ESP8266
3.3V       ──────────→  VCC e CH_PD do ESP8266
GND        ──────────→  GND do ESP8266
```

### Diagrama de Circuito

```
                    Arduino Uno
          ┌──────────────────────┐
          │                      │
   Botão A├─D2              D7   ├─→ LED A ──[220Ω]── GND
   Botão B├─D3              D8   ├─→ LED B ──[220Ω]── GND
   Botão C├─D4              D9   ├─→ LED C ──[220Ω]── GND
   Botão D├─D5              D10  ├─→ LED D ──[220Ω]── GND
   Botão R├─D6              D11  ├─→ LED R ──[220Ω]── GND
          │                      │
    Buzzer├─D12            GND   ├─→ GND comum
          │                      │
          │    I2C (Opcional)    │
  LCD SDA ├─A4                   │
  LCD SCL ├─A5                   │
          │                      │
  WiFi RX ├─D0 (TX)              │
  WiFi TX ├─D1 (RX)              │
          │                      │
          └──────────────────────┘

Cada botão:
         Pin ─→ [Botão] ─→ GND
                    │
                 [10kΩ] (pull-down)
                    │
                   GND
```

---

## 💻 Código para Arduino

### 1. Instalação do Arduino IDE

1. Baixe o [Arduino IDE](https://www.arduino.cc/en/software)
2. Instale a versão mais recente para seu sistema operacional
3. Conecte o Arduino Uno via USB

### 2. Instalar Bibliotecas

No Arduino IDE, vá em `Sketch → Include Library → Manage Libraries` e instale:

- **ArduinoJson** (by Benoit Blanchon)
- **ESP8266WiFi** (para módulo ESP8266) ou **Ethernet** (para Shield Ethernet)
- **WebSockets** (by Markus Sattler)
- **LiquidCrystal I2C** (opcional, para display LCD)

### 3. Código Principal - Arduino com ESP8266

Crie um novo sketch e cole o código abaixo:

```cpp
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

const char* ssid = "SEU_WIFI_AQUI";           // Nome da sua rede WiFi
const char* password = "SUA_SENHA_AQUI";       // Senha do WiFi
const char* serverIP = "192.168.1.100";        // IP do servidor Brain Bolt
const int serverPort = 8080;                   // Porta do servidor

// Botões
const int BUTTON_A = 2;
const int BUTTON_B = 3;
const int BUTTON_C = 4;
const int BUTTON_D = 5;
const int BUTTON_FAST = 6;

// LEDs
const int LED_A = 7;
const int LED_B = 8;
const int LED_C = 9;
const int LED_D = 10;
const int LED_FAST = 11;

// Buzzer
const int BUZZER = 12;

// Comunicação Serial com ESP8266
SoftwareSerial espSerial(0, 1); // RX, TX

bool connected = false;
String roomCode = "";
String playerId = "";

// Estado dos botões (debounce)
unsigned long lastDebounceTime[5] = {0};
const unsigned long debounceDelay = 50;
bool lastButtonState[5] = {LOW};
bool buttonState[5] = {LOW};

void setup() {
  Serial.begin(115200);
  espSerial.begin(115200);

  Serial.println(F("\n\n================================="));
  Serial.println(F("Brain Bolt - Hardware Controller"));
  Serial.println(F("=================================\n"));

  // Configurar pinos dos botões (INPUT com pull-down externo)
  pinMode(BUTTON_A, INPUT);
  pinMode(BUTTON_B, INPUT);
  pinMode(BUTTON_C, INPUT);
  pinMode(BUTTON_D, INPUT);
  pinMode(BUTTON_FAST, INPUT);

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

  // Configurar ESP8266
  setupESP8266();

  // Conectar ao WiFi
  connectWiFi();
}

void loop() {
  // Verificar botões
  checkButtons();

  // Processar dados do ESP8266
  if (espSerial.available()) {
    String response = espSerial.readStringUntil('\n');
    handleMessage(response);
  }

  // Piscar LED de conexão se não conectado
  if (!connected) {
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 500) {
      digitalWrite(LED_FAST, !digitalRead(LED_FAST));
      lastBlink = millis();
    }
  }
}

void setupESP8266() {
  Serial.println(F("Configurando ESP8266..."));

  // Reset ESP8266
  espSerial.println(F("AT+RST"));
  delay(2000);

  // Configurar modo WiFi
  espSerial.println(F("AT+CWMODE=1"));
  delay(1000);

  Serial.println(F("ESP8266 configurado"));
}

void connectWiFi() {
  Serial.print(F("Conectando ao WiFi"));

  String cmd = "AT+CWJAP=\"";
  cmd += ssid;
  cmd += "\",\"";
  cmd += password;
  cmd += "\"";

  espSerial.println(cmd);

  unsigned long timeout = millis();
  while (millis() - timeout < 20000) {
    if (espSerial.find("OK")) {
      Serial.println(F("\n✓ WiFi Conectado!"));
      playSuccess();
      connected = true;
      return;
    }
    Serial.print(".");
    delay(500);
  }

  Serial.println(F("\n✗ Falha ao conectar WiFi"));
  playError();
}

void connectWebSocket() {
  Serial.println(F("Conectando ao servidor WebSocket..."));

  String cmd = "AT+CIPSTART=\"TCP\",\"";
  cmd += serverIP;
  cmd += "\",";
  cmd += serverPort;

  espSerial.println(cmd);
  delay(2000);

  if (espSerial.find("OK")) {
    Serial.println(F("✓ Conectado ao servidor!"));
    registerDevice();
  } else {
    Serial.println(F("✗ Falha na conexão"));
  }
}

void registerDevice() {
  StaticJsonDocument<200> doc;
  doc["type"] = "register";
  doc["device"] = "arduino_buttons";
  doc["mac"] = getMacAddress();

  String output;
  serializeJson(doc, output);
  sendWebSocketMessage(output);

  Serial.println(F("Dispositivo registrado"));
}

void sendWebSocketMessage(String message) {
  String cmd = "AT+CIPSEND=";
  cmd += message.length();

  espSerial.println(cmd);
  delay(100);

  if (espSerial.find(">")) {
    espSerial.print(message);
  }
}

String getMacAddress() {
  // Simula um MAC address único baseado no tempo
  return "AR:DU:IN:O0:00:01";
}

void handleMessage(String payload) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print(F("JSON Error: "));
    Serial.println(error.c_str());
    return;
  }

  const char* type = doc["type"];

  if (strcmp(type, "room_joined") == 0) {
    roomCode = doc["room_code"].as<String>();
    playerId = doc["player_id"].as<String>();
    Serial.print(F("Sala: "));
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

void checkButtons() {
  checkButton(0, BUTTON_A, LED_A, "A");
  checkButton(1, BUTTON_B, LED_B, "B");
  checkButton(2, BUTTON_C, LED_C, "C");
  checkButton(3, BUTTON_D, LED_D, "D");
  checkButton(4, BUTTON_FAST, LED_FAST, "FAST");
}

void checkButton(int index, int buttonPin, int ledPin, const char* buttonName) {
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

void onButtonPress(const char* button, int ledPin) {
  Serial.print(F("Botão pressionado: "));
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
    sendWebSocketMessage(output);
  }

  // Apagar LED após 300ms
  delay(300);
  digitalWrite(ledPin, LOW);
}

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

void testHardware() {
  Serial.println(F("Testando hardware..."));

  // Testar LEDs
  int leds[] = {LED_A, LED_B, LED_C, LED_D, LED_FAST};
  for (int i = 0; i < 5; i++) {
    digitalWrite(leds[i], HIGH);
    playTone(500 + (i * 200), 100);
    delay(200);
    digitalWrite(leds[i], LOW);
  }

  // Testar todos acesos
  allLEDsOn();
  playTone(1500, 300);
  delay(500);
  allLEDsOff();

  Serial.println(F("✓ Teste concluído\n"));
}
```

---

## 📱 Integração com o App Brain Bolt

### Backend - Criar endpoint WebSocket

O servidor WebSocket já está configurado no diretório `server/`. Veja a documentação completa em [server/README.md](../../server/README.md).

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
│     [Display LCD - Opcional]        │
│                                     │
│         [Arduino interno]           │
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

     [Display Central + Arduino]
```

### Materiais para Case

**MDF 3mm:**

- Corte as peças em uma cortadora laser
- Dimensões recomendadas: 200x150x50mm

**Impressão 3D:**

- Material: PLA ou ABS
- Previsão de custo: R$ 30-50

**Acrílico:**

- Mais durável, use parafusos M3
- Transparente para visualizar componentes

---

## 🔧 Configuração e Uso

### 1. Preparar o Arduino

1. Abra o código no Arduino IDE
2. Altere as configurações no início do código:

   ```cpp
   const char* ssid = "SEU_WIFI_AQUI";
   const char* password = "SUA_SENHA_AQUI";
   const char* serverIP = "192.168.1.100";  // IP do servidor Brain Bolt
   ```

3. Selecione a placa:

   - `Tools → Board → Arduino Uno`

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
   cd server
   npm run dev
   ```

### 3. Conectar e Testar

1. Ligue o Arduino
2. Observe o Serial Monitor:

   - `Tools → Serial Monitor`
   - Baud rate: 115200

3. Verifique:

   ```
   ✓ WiFi Conectado!
   ✓ Conectado ao servidor!
   Dispositivo registrado
   ```

4. No app Brain Bolt:
   - Entre em "Salas Educacionais"
   - Crie uma sala como professor
   - Selecione "Modo Físico"
   - Os botões devem aparecer como conectados

---

## 🐛 Solução de Problemas

### Arduino não conecta ao WiFi

- Verifique SSID e senha
- Certifique-se que a rede é 2.4GHz (não 5GHz)
- Verifique se o ESP8266 está bem conectado
- Tente resetar o Arduino

### Botões não respondem

- Verifique as conexões dos pinos
- Teste no Serial Monitor se os botões estão sendo detectados
- Verifique os resistores pull-down (10kΩ)
- Confirme que os botões estão funcionando com um multímetro

### WebSocket desconecta

- Verifique se o servidor está rodando
- Verifique o IP do servidor
- Verifique firewall
- Tente aumentar o timeout de conexão

### LEDs não acendem

- Verifique polaridade dos LEDs (perna longa = +)
- Verifique resistores (220Ω)
- Teste com um LED simples direto no pino digital
- Confirme que os LEDs não estão queimados

### ESP8266 não responde

- Verifique alimentação (3.3V, não 5V!)
- Certifique-se que CH_PD está conectado ao 3.3V
- Verifique conexões RX/TX (são cruzadas: RX do Arduino → TX do ESP8266)
- Teste comandos AT manualmente no Serial Monitor

---

## 💡 Dicas Adicionais

### Alimentação

- Para uso em sala de aula, use fonte de alimentação 9V DC (não USB)
- Power bank pode ser usado para demonstrações móveis
- Autonomia típica: 6-8 horas com power bank de 10.000mAh

### Melhorias Futuras

- Adicionar display LCD para mostrar pontuação local
- Implementar modo offline com cartão SD
- Adicionar mais LEDs RGB para feedback colorido
- Criar case personalizado com impressão 3D

### Segurança

- Use case fechado para evitar curtos-circuitos
- Certifique-se que todas as conexões estão firmes
- Evite exposição à água ou umidade excessiva
- Mantenha longe de superfícies condutoras

---

## 📚 Recursos Adicionais

- [Arduino Official Documentation](https://www.arduino.cc/reference/en/)
- [ESP8266 AT Commands](https://www.espressif.com/sites/default/files/documentation/4a-esp8266_at_instruction_set_en.pdf)
- [ArduinoJson Documentation](https://arduinojson.org/)
- [WebSocket Protocol RFC 6455](https://tools.ietf.org/html/rfc6455)

---

## 🤝 Contribuindo

Encontrou algum problema ou tem sugestões de melhoria? Abra uma issue no repositório!

---

**Desenvolvido por**: João Gabriel Lopes Aguiar  
**Projeto**: Brain Bolt - Quiz Educacional  
**Versão Hardware**: 1.0.0
