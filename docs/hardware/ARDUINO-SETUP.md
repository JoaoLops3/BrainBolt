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

### Arduino Uno (Comunicação USB)

- **1x Arduino Uno R3** (~R$ 40-70)
- **5x Botões Push Button** (arcade buttons ou push buttons grandes)
- **5x LEDs** (vermelho, verde, azul, amarelo, branco)
- **5x Resistores 220Ω** (para LEDs)
- **5x Resistores 10kΩ** (pull-down para botões)
- **1x Buzzer passivo**
- **1x Display LCD 16x2 I2C** (opcional)
- **Protoboard** ou **Placa PCB**
- **Jumpers** e fios
- **Caixa/Case** para montagem (pode ser MDF, acrílico ou impressão 3D)
- **Cabo USB tipo A-B** para Arduino (comunicação com o computador)

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

USB        ──────────→  Computador (comunicação serial)
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
          │                 USB  ├─→ Computador
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
- **LiquidCrystal I2C** (opcional, para display LCD)

### 3. Código Principal - Arduino com Comunicação Serial

Crie um novo sketch e cole o código abaixo:

```cpp
#include <ArduinoJson.h>

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

  Serial.println(F("Aguardando conexão do computador..."));
}

void loop() {
  // Verificar botões
  checkButtons();

  // Processar dados do Serial (computador)
  if (Serial.available()) {
    String response = Serial.readStringUntil('\n');
    handleMessage(response);
  }

  // Piscar LED de status se não conectado
  if (!connected) {
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 500) {
      digitalWrite(LED_FAST, !digitalRead(LED_FAST));
      lastBlink = millis();
    }
  }
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

  if (strcmp(type, "connected") == 0) {
    connected = true;
    Serial.println(F("✓ Conectado ao Brain Bolt!"));
    playSuccess();
    allLEDsOff();
  }
  else if (strcmp(type, "room_joined") == 0) {
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
  // Acender LED
  digitalWrite(ledPin, HIGH);

  // Som de clique
  playTone(800, 50);

  // Enviar para computador via Serial
  StaticJsonDocument<200> doc;
  doc["type"] = "button_press";
  doc["button"] = button;
  doc["player_id"] = playerId;
  doc["timestamp"] = millis();

  String output;
  serializeJson(doc, output);
  Serial.println(output);

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
2. Selecione a placa:

   - `Tools → Board → Arduino Uno`

3. Selecione a porta:

   - `Tools → Port → /dev/ttyUSB0` (Linux/Mac)
   - `Tools → Port → COM3` (Windows)

4. Upload:
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

1. Conecte o Arduino ao computador via USB
2. Observe o Serial Monitor:

   - `Tools → Serial Monitor`
   - Baud rate: 115200

3. Verifique a mensagem de inicialização:

   ```
   =================================
   Brain Bolt - Hardware Controller
   =================================

   Testando hardware...
   ✓ Teste concluído

   Aguardando conexão do computador...
   ```

4. No app Brain Bolt:
   - Entre em "Salas Educacionais"
   - Crie uma sala como professor
   - Selecione "Modo Físico"
   - Os botões devem aparecer como conectados

---

## 🐛 Solução de Problemas

### Arduino não é detectado pelo computador

- Verifique se o cabo USB está funcionando (tente outro cabo)
- Instale os drivers CH340/CH341 se necessário (Arduino clones)
- Verifique se a porta serial está correta no Arduino IDE
- Reinicie o Arduino IDE

### Botões não respondem

- Verifique as conexões dos pinos
- Teste no Serial Monitor se os botões estão sendo detectados
- Verifique os resistores pull-down (10kΩ)
- Confirme que os botões estão funcionando com um multímetro

### Comunicação Serial não funciona

- Verifique se o baud rate está em 115200
- Certifique-se que nenhum outro programa está usando a porta serial
- Verifique se o servidor WebSocket está rodando
- Tente desconectar e reconectar o Arduino

### LEDs não acendem

- Verifique polaridade dos LEDs (perna longa = +)
- Verifique resistores (220Ω)
- Teste com um LED simples direto no pino digital
- Confirme que os LEDs não estão queimados

### Buzzer não emite som

- Verifique se é um buzzer passivo (não ativo)
- Teste a polaridade (inverta se necessário)
- Confirme que o pino 12 está correto
- Teste com um multímetro se há sinal no pino

---

## 💡 Dicas Adicionais

### Alimentação

- O Arduino será alimentado via USB conectado ao computador
- Para uso em sala de aula, o computador deve estar próximo dos botões
- Considere usar um cabo USB extenso (até 5 metros com cabos ativos)
- Alternativamente, use um Raspberry Pi ou laptop dedicado

### Melhorias Futuras

- Adicionar display LCD para mostrar pontuação local
- Implementar modo offline com cartão SD
- Adicionar mais LEDs RGB para feedback colorido
- Criar case personalizado com impressão 3D
- Adicionar ESP32 para comunicação WiFi sem fio

### Segurança

- Use case fechado para evitar curtos-circuitos
- Certifique-se que todas as conexões estão firmes
- Evite exposição à água ou umidade excessiva
- Mantenha longe de superfícies condutoras
- Não force a conexão USB

---

## 📚 Recursos Adicionais

- [Arduino Official Documentation](https://www.arduino.cc/reference/en/)
- [ArduinoJson Documentation](https://arduinojson.org/)
- [Arduino Serial Communication](https://www.arduino.cc/reference/en/language/functions/communication/serial/)

---

## 🤝 Contribuindo

Encontrou algum problema ou tem sugestões de melhoria? Abra uma issue no repositório!

---

**Desenvolvido por**: João Gabriel Lopes Aguiar  
**Projeto**: Brain Bolt - Quiz Educacional  
**Versão Hardware**: 1.0.0
