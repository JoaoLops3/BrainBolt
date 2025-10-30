/*
 * Brain Bolt - Controlador de Botões Físicos
 * Comunicação via Serial para WebSocket Bridge
 *
 * Hardware:
 * - 4 botões de resposta (A, B, C, D)
 * - 1 botão de resposta rápida
 * - 5 LEDs para feedback
 * - 1 buzzer para sons
 *
 * Conexões:
 * Botões: D2, D3, D4, D5, D6
 * LEDs: D7, D8, D9, D10, D11
 * Buzzer: D12
 */

#include <ArduinoJson.h>

// Configuração dos pinos
const int BUTTON_A = 2;
const int BUTTON_B = 3;
const int BUTTON_C = 4;
const int BUTTON_D = 5;
const int BUTTON_FAST = 6;

const int LED_A = 7;
const int LED_B = 8;
const int LED_C = 9;
const int LED_D = 10;
const int LED_FAST = 11;

const int BUZZER = 12;

// Estados dos botões (debounce)
unsigned long lastDebounceTime[5] = {0};
const unsigned long debounceDelay = 50;
bool lastButtonState[5] = {LOW};
bool buttonState[5] = {LOW};

// Estado da conexão
bool connected = false;
String roomCode = "";
String playerId = "";
bool gameActive = false;

// Pergunta atual
String currentQuestionId = "";
String currentQuestionText = "";
int currentCorrectAnswer = -1;
String currentDifficulty = "";
String currentCategory = "";

void setup()
{
  Serial.begin(115200);

  Serial.println(F("\n\n================================="));
  Serial.println(F("Brain Bolt - Hardware Controller"));
  Serial.println(F("Versao: 2.0.0"));
  Serial.println(F("=================================\n"));

  // Configurar pinos dos botões
  pinMode(BUTTON_A, INPUT);
  pinMode(BUTTON_B, INPUT);
  pinMode(BUTTON_C, INPUT);
  pinMode(BUTTON_D, INPUT);
  pinMode(BUTTON_FAST, INPUT);

  // Configurar pinos dos LEDs
  pinMode(LED_A, OUTPUT);
  pinMode(LED_B, OUTPUT);
  pinMode(LED_C, OUTPUT);
  pinMode(LED_D, OUTPUT);
  pinMode(LED_FAST, OUTPUT);

  // Configurar buzzer
  pinMode(BUZZER, OUTPUT);

  // Teste inicial do hardware
  testHardware();

  Serial.println(F("Arduino pronto!"));
  Serial.println(F("Aguardando conexao com o Brain Bolt..."));

  // LED de status piscando
  blinkStatusLED();
}

void loop()
{
  // Verificar botões
  checkButtons();

  // Processar mensagens do Serial
  if (Serial.available())
  {
    String message = Serial.readStringUntil('\n');
    message.trim();
    if (message.length() > 0)
    {
      handleMessage(message);
    }
  }

  // Piscar LED de status se não conectado
  if (!connected)
  {
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 1000)
    {
      digitalWrite(LED_FAST, !digitalRead(LED_FAST));
      lastBlink = millis();
    }
  }
}

void handleMessage(String payload)
{
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error)
  {
    Serial.print(F("JSON Error: "));
    Serial.println(error.c_str());
    return;
  }

  const char *type = doc["type"];

  if (strcmp(type, "connected") == 0)
  {
    connected = true;
    Serial.println(F("Conectado ao Brain Bolt!"));
    playSuccess();
    allLEDsOff();
    digitalWrite(LED_FAST, HIGH); // LED de conexão
  }
  else if (strcmp(type, "room_joined") == 0)
  {
    roomCode = doc["room_code"].as<String>();
    playerId = doc["player_id"].as<String>();
    Serial.print(F("Sala: "));
    Serial.println(roomCode);
    Serial.print(F("Player ID: "));
    Serial.println(playerId);
    playSuccess();
    flashLED(LED_FAST, 3);
  }
  else if (strcmp(type, "question_start") == 0)
  {
    gameActive = true;
    Serial.println(F("Nova pergunta iniciada!"));
    allLEDsOn();
    playTone(1000, 200);
    delay(200);
    allLEDsOff();
  }
  else if (strcmp(type, "answer_correct") == 0)
  {
    Serial.println(F("Resposta correta!"));
    playSuccess();
    flashLED(LED_FAST, 5);
  }
  else if (strcmp(type, "answer_wrong") == 0)
  {
    Serial.println(F("Resposta incorreta"));
    playError();
  }
  else if (strcmp(type, "game_end") == 0)
  {
    gameActive = false;
    Serial.println(F("Jogo finalizado!"));
    celebrationAnimation();
  }
  else if (strcmp(type, "disconnected") == 0)
  {
    connected = false;
    gameActive = false;
    Serial.println(F("Desconectado do Brain Bolt"));
    allLEDsOff();
  }
  else if (strcmp(type, "test_buttons_start") == 0)
  {
    Serial.println(F("Teste de botoes iniciado!"));
    Serial.println(F("Pressione os botoes para testar..."));
    testButtons();
  }
  else if (strcmp(type, "led_control") == 0)
  {
    const char *led = doc["led"];
    const char *action = doc["action"];
    int duration = doc["duration"] | 1000;

    controlLED(led, action, duration);
  }
  else if (strcmp(type, "question_update") == 0)
  {
    // Armazenar pergunta atual
    JsonObject question = doc["question"];
    currentQuestionId = question["id"].as<String>();
    currentQuestionText = question["text"].as<String>();
    currentCorrectAnswer = question["correctAnswer"];
    currentDifficulty = question["difficulty"].as<String>();
    currentCategory = question["category"].as<String>();

    Serial.println(F("Nova pergunta recebida:"));
    Serial.print(F("   Pergunta: "));
    Serial.println(currentQuestionText);
    Serial.print(F("   Resposta correta: "));
    Serial.print((char)('A' + currentCorrectAnswer));
    Serial.print(F(" (indice "));
    Serial.print(currentCorrectAnswer);
    Serial.println(F(")"));
    Serial.print(F("   Dificuldade: "));
    Serial.println(currentDifficulty);
    Serial.print(F("   Categoria: "));
    Serial.println(currentCategory);
  }
}

void checkButtons()
{
  checkButton(0, BUTTON_A, LED_A, "A");
  checkButton(1, BUTTON_B, LED_B, "B");
  checkButton(2, BUTTON_C, LED_C, "C");
  checkButton(3, BUTTON_D, LED_D, "D");
  checkButton(4, BUTTON_FAST, LED_FAST, "FAST");
}

void checkButton(int index, int buttonPin, int ledPin, const char *buttonName)
{
  int reading = digitalRead(buttonPin);

  if (reading != lastButtonState[index])
  {
    lastDebounceTime[index] = millis();
  }

  if ((millis() - lastDebounceTime[index]) > debounceDelay)
  {
    if (reading != buttonState[index])
    {
      buttonState[index] = reading;

      if (buttonState[index] == HIGH)
      {
        onButtonPress(buttonName, ledPin);
      }
    }
  }

  lastButtonState[index] = reading;
}

void onButtonPress(const char *button, int ledPin)
{
  // Acender LED físico
  digitalWrite(ledPin, HIGH);

  // Som de clique
  playTone(800, 50);

  // Enviar para o computador via Serial (sempre, mesmo sem jogo ativo)
  StaticJsonDocument<200> doc;
  doc["type"] = "button_press";
  doc["button"] = button;
  doc["player_id"] = playerId;
  doc["timestamp"] = millis();

  String output;
  serializeJson(doc, output);
  Serial.println(output);

  Serial.print(F("Botao pressionado: "));
  Serial.println(button);

  // Apagar LED após 300ms
  delay(300);
  digitalWrite(ledPin, LOW);
}

void allLEDsOn()
{
  digitalWrite(LED_A, HIGH);
  digitalWrite(LED_B, HIGH);
  digitalWrite(LED_C, HIGH);
  digitalWrite(LED_D, HIGH);
  digitalWrite(LED_FAST, HIGH);
}

void allLEDsOff()
{
  digitalWrite(LED_A, LOW);
  digitalWrite(LED_B, LOW);
  digitalWrite(LED_C, LOW);
  digitalWrite(LED_D, LOW);
  digitalWrite(LED_FAST, LOW);
}

void flashLED(int ledPin, int times)
{
  for (int i = 0; i < times; i++)
  {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
}

void blinkStatusLED()
{
  for (int i = 0; i < 3; i++)
  {
    digitalWrite(LED_FAST, HIGH);
    delay(200);
    digitalWrite(LED_FAST, LOW);
    delay(200);
  }
}

void celebrationAnimation()
{
  for (int i = 0; i < 3; i++)
  {
    allLEDsOn();
    playTone(1000, 200);
    delay(200);
    allLEDsOff();
    delay(200);
  }
}

void playTone(int frequency, int duration)
{
  tone(BUZZER, frequency, duration);
  delay(duration);
  noTone(BUZZER);
}

void playSuccess()
{
  playTone(1000, 100);
  delay(50);
  playTone(1500, 100);
  delay(50);
  playTone(2000, 200);
}

void playError()
{
  playTone(300, 200);
  delay(100);
  playTone(200, 300);
}

void testHardware()
{
  Serial.println(F("Testando hardware..."));

  // Testar LEDs sequencialmente
  int leds[] = {LED_A, LED_B, LED_C, LED_D, LED_FAST};
  const char *names[] = {"A", "B", "C", "D", "FAST"};

  for (int i = 0; i < 5; i++)
  {
    Serial.print(F("  LED "));
    Serial.print(names[i]);
    Serial.print(F(": "));

    digitalWrite(leds[i], HIGH);
    playTone(500 + (i * 200), 100);
    delay(200);
    digitalWrite(leds[i], LOW);

    Serial.println(F("OK"));
  }

  // Testar todos os LEDs
  Serial.println(F("  Todos os LEDs: "));
  allLEDsOn();
  playTone(1500, 300);
  delay(500);
  allLEDsOff();
  Serial.println(F("OK"));

  Serial.println(F("Teste de hardware concluido!\n"));
}

// Função para testar botões
void testButtons()
{
  Serial.println(F("Teste de botoes iniciado"));
  Serial.println(F("Pressione cada botao para testar..."));

  // Acender todos os LEDs para indicar modo de teste
  allLEDsOn();
  playTone(1000, 200);
  delay(500);
  allLEDsOff();

  // Aguardar 10 segundos para teste
  unsigned long testStart = millis();
  while (millis() - testStart < 10000)
  {
    checkButtons();
    delay(10);
  }

  Serial.println(F("Teste de botoes concluido"));
  playSuccess();
}

// Função para controlar LEDs individualmente
void controlLED(const char *led, const char *action, int duration)
{
  int ledPin = -1;

  // Identificar qual LED controlar
  if (strcmp(led, "A") == 0)
    ledPin = LED_A;
  else if (strcmp(led, "B") == 0)
    ledPin = LED_B;
  else if (strcmp(led, "C") == 0)
    ledPin = LED_C;
  else if (strcmp(led, "D") == 0)
    ledPin = LED_D;
  else if (strcmp(led, "FAST") == 0)
    ledPin = LED_FAST;

  if (ledPin == -1)
  {
    Serial.print(F("LED invalido: "));
    Serial.println(led);
    return;
  }

  // Executar ação
  if (strcmp(action, "on") == 0)
  {
    digitalWrite(ledPin, HIGH);
    Serial.print(F("LED "));
    Serial.print(led);
    Serial.println(F(" ligado"));
    playTone(800, 100);
  }
  else if (strcmp(action, "off") == 0)
  {
    digitalWrite(ledPin, LOW);
    Serial.print(F("LED "));
    Serial.print(led);
    Serial.println(F(" desligado"));
  }
  else if (strcmp(action, "blink") == 0)
  {
    Serial.print(F("LED "));
    Serial.print(led);
    Serial.print(F(" piscando por "));
    Serial.print(duration);
    Serial.println(F("ms"));

    unsigned long startTime = millis();
    while (millis() - startTime < duration)
    {
      digitalWrite(ledPin, HIGH);
      delay(100);
      digitalWrite(ledPin, LOW);
      delay(100);
    }
  }
}
