/*
 * Brain Bolt - Controlador de Botões Físicos
 * Comunicação via Web Serial API (USB → Navegador)
 *
 * Hardware:
 * - 4 botões de resposta (A, B, C, D)
 * - 2 botões de resposta rápida (FAST1, FAST2)
 * - 6 LEDs para feedback
 * - 1 buzzer para sons
 *
 * Conexões:
 * Botões: D2, D3, D4, D5, D6, D13
 * LEDs: D7, D8, D9, D10, D11, D12
 * Buzzer: D14
 */

#include <ArduinoJson.h>

// Configuração dos pinos
const int BUTTON_A = 2;
const int BUTTON_B = 3;
const int BUTTON_C = 4;
const int BUTTON_D = 5;
const int BUTTON_FAST = 6;
const int BUTTON_FAST2 = 13;

const int LED_A = 7;
const int LED_B = 8;
const int LED_C = 9;
const int LED_D = 10;
const int LED_FAST = 11;
const int LED_FAST2 = 12;

const int BUZZER = 14;

// Estados dos botões (debounce)
unsigned long lastDebounceTime[6] = {0};
const unsigned long debounceDelay = 50;
bool lastButtonState[6] = {LOW};
bool buttonState[6] = {LOW};

// Estado da conexão
bool connected = false;
String roomCode = "";
String playerId = "";
bool gameActive = false;

// Competição entre jogadores
bool competitionMode = false;
String currentWinner = "";
unsigned long competitionStartTime = 0;

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
  pinMode(BUTTON_FAST2, INPUT);

  // Configurar pinos dos LEDs
  pinMode(LED_A, OUTPUT);
  pinMode(LED_B, OUTPUT);
  pinMode(LED_C, OUTPUT);
  pinMode(LED_D, OUTPUT);
  pinMode(LED_FAST, OUTPUT);
  pinMode(LED_FAST2, OUTPUT);

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
    competitionMode = true;
    currentWinner = "";
    competitionStartTime = millis();
    Serial.println(F("Nova pergunta iniciada!"));
    Serial.println(F("COMPETICAO: Aperte FAST1 ou FAST2 para responder!"));

    // Piscar LEDs FAST para indicar competição
    for (int i = 0; i < 3; i++)
    {
      digitalWrite(LED_FAST, HIGH);
      digitalWrite(LED_FAST2, HIGH);
      playTone(1000, 100);
      delay(100);
      digitalWrite(LED_FAST, LOW);
      digitalWrite(LED_FAST2, LOW);
      delay(100);
    }
  }
  else if (strcmp(type, "answer_correct") == 0)
  {
    Serial.println(F("Resposta correta!"));
    playSuccess();

    // Piscar LED do vencedor
    if (currentWinner == "FAST1")
      flashLED(LED_FAST, 5);
    else if (currentWinner == "FAST2")
      flashLED(LED_FAST2, 5);

    // Resetar competição
    competitionMode = false;
    currentWinner = "";
  }
  else if (strcmp(type, "answer_wrong") == 0)
  {
    Serial.println(F("Resposta incorreta"));
    playError();
    allLEDsOff();

    // Resetar competição
    competitionMode = false;
    currentWinner = "";
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
  else if (strcmp(type, "test_leds_sequential") == 0)
  {
    Serial.println(F("Teste sequencial de LEDs iniciado!"));
    testLEDsSequential();
  }
  else if (strcmp(type, "stop_led_test") == 0)
  {
    Serial.println(F("Teste de LEDs parado"));
    allLEDsOff();
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
  checkButton(4, BUTTON_FAST, LED_FAST, "FAST1");
  checkButton(5, BUTTON_FAST2, LED_FAST2, "FAST2");
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

  // Verificar se é botão FAST em modo competição
  if (competitionMode && (strcmp(button, "FAST1") == 0 || strcmp(button, "FAST2") == 0))
  {
    if (currentWinner.length() == 0)
    {
      // Primeiro jogador a apertar!
      currentWinner = String(button);
      competitionMode = false;

      unsigned long reactionTime = millis() - competitionStartTime;

      Serial.print(F("VENCEDOR DA COMPETICAO: "));
      Serial.println(button);
      Serial.print(F("Tempo de reacao: "));
      Serial.print(reactionTime);
      Serial.println(F("ms"));

      // Animação do vencedor
      for (int i = 0; i < 5; i++)
      {
        digitalWrite(ledPin, HIGH);
        playTone(1500 + (i * 200), 80);
        delay(80);
        digitalWrite(ledPin, LOW);
        delay(80);
      }

      // Enviar evento de vitória
      StaticJsonDocument<256> doc;
      doc["type"] = "competition_winner";
      doc["winner"] = button;
      doc["player_id"] = playerId;
      doc["reaction_time"] = reactionTime;
      doc["timestamp"] = millis();

      String output;
      serializeJson(doc, output);
      Serial.println(output);

      // Manter LED do vencedor aceso
      digitalWrite(ledPin, HIGH);
      return;
    }
    else
    {
      // Jogador perdeu
      Serial.print(F("Tarde demais! "));
      Serial.print(button);
      Serial.print(F(" perdeu para "));
      Serial.println(currentWinner);
      playError();
      delay(300);
      digitalWrite(ledPin, LOW);
      return;
    }
  }

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
  digitalWrite(LED_FAST2, HIGH);
}

void allLEDsOff()
{
  digitalWrite(LED_A, LOW);
  digitalWrite(LED_B, LOW);
  digitalWrite(LED_C, LOW);
  digitalWrite(LED_D, LOW);
  digitalWrite(LED_FAST, LOW);
  digitalWrite(LED_FAST2, LOW);
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
  int leds[] = {LED_A, LED_B, LED_C, LED_D, LED_FAST, LED_FAST2};
  const char *names[] = {"A", "B", "C", "D", "FAST1", "FAST2"};

  for (int i = 0; i < 6; i++)
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

// Função para testar LEDs sequencialmente
void testLEDsSequential()
{
  Serial.println(F("Iniciando teste sequencial de LEDs..."));

  // Array com todos os LEDs e seus nomes
  const int leds[] = {LED_A, LED_B, LED_C, LED_D, LED_FAST, LED_FAST2};
  const char *ledNames[] = {"LED A", "LED B", "LED C", "LED D", "LED FAST1", "LED FAST2"};
  const int numLeds = 6;

  // Testar cada LED individualmente
  for (int i = 0; i < numLeds; i++)
  {
    Serial.print(F("Testando "));
    Serial.println(ledNames[i]);

    // Acender LED atual
    digitalWrite(leds[i], HIGH);
    playTone(800 + (i * 100), 150);
    delay(800); // LED fica aceso por 800ms

    // Apagar LED atual
    digitalWrite(leds[i], LOW);
    delay(200); // Pausa entre LEDs
  }

  // Animação final - todos piscando juntos
  Serial.println(F("Teste final - todos os LEDs juntos"));
  for (int j = 0; j < 3; j++)
  {
    allLEDsOn();
    playTone(1200, 100);
    delay(150);
    allLEDsOff();
    delay(150);
  }

  Serial.println(F("Teste de LEDs concluido!"));
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
  else if (strcmp(led, "FAST1") == 0 || strcmp(led, "FAST") == 0)
    ledPin = LED_FAST;
  else if (strcmp(led, "FAST2") == 0)
    ledPin = LED_FAST2;

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
