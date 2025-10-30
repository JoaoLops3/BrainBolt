import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { supabaseServer as supabase } from "./supabase-server";

// TYPES
interface Device {
  id: string;
  ws: WebSocket;
  type: "arduino";
  mac: string;
  roomId?: string;
  connectedAt: Date;
  lastActivity: Date;
}

interface PhysicalRoom {
  id: string;
  code: string;
  hostDeviceId: string;
  players: Set<string>;
  currentQuestionId?: string;
  questionStartTime?: Date;
  status: "waiting" | "playing" | "finished";
  createdAt: Date;
}

interface ButtonPressMessage {
  type: "button_press";
  button: "A" | "B" | "C" | "D" | "FAST";
  player_id: string;
  timestamp: number;
}

interface QuestionMessage {
  type: "question";
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  category: string;
}

// STATE

const devices = new Map<string, Device>();
const rooms = new Map<string, PhysicalRoom>();

// WEBSOCKET SERVER

const httpServer = createServer();
const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws/hardware",
});

console.log("🚀 Brain Bolt Hardware WebSocket Server");
console.log("=========================================\n");

// CONNECTION HANDLER

wss.on("connection", (ws: WebSocket, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🔌 Nova conexão de: ${clientIP}`);

  ws.on("message", async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, message);
    } catch (error) {
      console.error("❌ Erro ao processar mensagem:", error);
      sendError(ws, "Mensagem inválida");
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });

  ws.on("error", (error) => {
    console.error("❌ Erro de WebSocket:", error);
  });

  // Heartbeat
  ws.on("pong", () => {
    const device = findDeviceByWs(ws);
    if (device) {
      device.lastActivity = new Date();
    }
  });
});

// MESSAGE HANDLERS

async function handleMessage(ws: WebSocket, message: any) {
  console.log("📨 Mensagem recebida:", message.type);

  switch (message.type) {
    case "register":
      await handleRegister(ws, message);
      break;

    case "create_room":
      await handleCreateRoom(ws, message);
      break;

    case "join_room":
      await handleJoinRoom(ws, message);
      break;

    case "button_press":
      await handleButtonPress(ws, message);
      break;

    case "start_question":
      await handleStartQuestion(ws, message);
      break;

    case "end_game":
      await handleEndGame(ws, message);
      break;

    case "ping":
      // Mantém a conexão ativa sem gerar erro no cliente
      try {
        // Responde com pong para clientes que esperam confirmação
        send(ws, { type: "pong", server_time: new Date().toISOString() });
        // Atualiza atividade do dispositivo, se conhecido
        const device = findDeviceByWs(ws);
        if (device) {
          device.lastActivity = new Date();
        }
      } catch (_) {
        // Não interrompe o fluxo em caso de erro de ping
      }
      break;

    default:
      sendError(ws, "Tipo de mensagem desconhecido");
  }
}

// REGISTER DEVICE

async function handleRegister(ws: WebSocket, message: any) {
  const { device, mac } = message;

  const deviceId = generateDeviceId(mac);

  const newDevice: Device = {
    id: deviceId,
    ws,
    type: device,
    mac,
    connectedAt: new Date(),
    lastActivity: new Date(),
  };

  devices.set(deviceId, newDevice);

  console.log(`✅ Dispositivo registrado: ${deviceId} (${mac})`);
  console.log(`📊 Total de dispositivos: ${devices.size}`);

  const isRealArduino = device === "arduino_real" || device === "arduino";

  send(ws, {
    type: "registered",
    device_id: deviceId,
    server_time: new Date().toISOString(),
    is_real_arduino: isRealArduino,
  });
}

//
// ROOM MANAGEMENT
//

async function handleCreateRoom(ws: WebSocket, message: any) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, "Dispositivo não registrado");
  }

  const roomCode = generateRoomCode();
  const roomId = `room_${roomCode}_${Date.now()}`;

  const room: PhysicalRoom = {
    id: roomId,
    code: roomCode,
    hostDeviceId: device.id,
    players: new Set([device.id]),
    status: "waiting",
    createdAt: new Date(),
  };

  rooms.set(roomId, room);
  device.roomId = roomId;

  console.log(`🏠 Sala criada: ${roomCode} por ${device.id}`);

  send(ws, {
    type: "room_created",
    room_id: roomId,
    room_code: roomCode,
  });
}

async function handleJoinRoom(ws: WebSocket, message: any) {
  const device = findDeviceByWs(ws);
  if (!device) {
    return sendError(ws, "Dispositivo não registrado");
  }

  const { room_code } = message;
  const room = findRoomByCode(room_code);

  if (!room) {
    return sendError(ws, "Sala não encontrada");
  }

  if (room.status !== "waiting") {
    return sendError(ws, "Sala já iniciou o jogo");
  }

  room.players.add(device.id);
  device.roomId = room.id;

  console.log(`👥 ${device.id} entrou na sala ${room_code}`);

  // Notificar todos na sala
  broadcastToRoom(room.id, {
    type: "player_joined",
    device_id: device.id,
    total_players: room.players.size,
  });

  send(ws, {
    type: "room_joined",
    room_id: room.id,
    room_code: room_code,
    player_id: device.id,
  });
}

// GAME LOGIC

async function handleStartQuestion(ws: WebSocket, message: any) {
  const device = findDeviceByWs(ws);
  if (!device || !device.roomId) {
    return sendError(ws, "Dispositivo não está em uma sala");
  }

  const room = rooms.get(device.roomId);
  if (!room) {
    return sendError(ws, "Sala não encontrada");
  }

  if (room.hostDeviceId !== device.id) {
    return sendError(ws, "Apenas o host pode iniciar perguntas");
  }

  const { question_id, question_data } = message;

  room.currentQuestionId = question_id;
  room.questionStartTime = new Date();
  room.status = "playing";

  console.log(`❓ Pergunta iniciada na sala ${room.code}: ${question_id}`);

  // Enviar pergunta para todos os dispositivos
  broadcastToRoom(room.id, {
    type: "question_start",
    question_id,
    ...question_data,
    start_time: room.questionStartTime.toISOString(),
  });
}

async function handleButtonPress(ws: WebSocket, message: ButtonPressMessage) {
  const device = findDeviceByWs(ws);
  if (!device || !device.roomId) {
    return sendError(ws, "Dispositivo não está em uma sala");
  }

  const room = rooms.get(device.roomId);
  if (!room || room.status !== "playing") {
    return sendError(ws, "Nenhuma pergunta ativa");
  }

  const { button, timestamp } = message;

  // Calcular tempo de resposta
  const responseTime = room.questionStartTime
    ? (new Date(timestamp).getTime() - room.questionStartTime.getTime()) / 1000
    : 0;

  console.log(
    `🔘 Botão pressionado: ${button} por ${device.id} (${responseTime}s)`
  );

  // Salvar resposta no Supabase
  try {
    const buttonIndex = getButtonIndex(button);
    const isCorrect = await checkAnswer(room.currentQuestionId!, buttonIndex);

    await supabase.from("custom_question_usage").insert({
      question_id: room.currentQuestionId,
      user_id: device.id,
      was_correct: isCorrect,
      time_spent: Math.floor(responseTime),
    });

    // Feedback para o dispositivo
    send(ws, {
      type: isCorrect ? "answer_correct" : "answer_wrong",
      button,
      response_time: responseTime,
    });

    // Notificar sala
    broadcastToRoom(
      room.id,
      {
        type: "player_answered",
        device_id: device.id,
        button,
        is_correct: isCorrect,
        response_time: responseTime,
      },
      device.id
    );
  } catch (error) {
    console.error("❌ Erro ao processar resposta:", error);
    sendError(ws, "Erro ao processar resposta");
  }
}

async function handleEndGame(ws: WebSocket, message: any) {
  const device = findDeviceByWs(ws);
  if (!device || !device.roomId) {
    return;
  }

  const room = rooms.get(device.roomId);
  if (!room) {
    return;
  }

  if (room.hostDeviceId !== device.id) {
    return sendError(ws, "Apenas o host pode finalizar o jogo");
  }

  room.status = "finished";

  console.log(`🏁 Jogo finalizado na sala ${room.code}`);

  broadcastToRoom(room.id, {
    type: "game_end",
    final_stats: message.stats || {},
  });

  // Limpar sala após 1 minuto
  setTimeout(() => {
    rooms.delete(room.id);
    console.log(`🧹 Sala ${room.code} removida`);
  }, 60000);
}

// UTILITY FUNCTIONS

function findDeviceByWs(ws: WebSocket): Device | undefined {
  for (const device of devices.values()) {
    if (device.ws === ws) {
      return device;
    }
  }
  return undefined;
}

function findRoomByCode(code: string): PhysicalRoom | undefined {
  for (const room of rooms.values()) {
    if (room.code === code) {
      return room;
    }
  }
  return undefined;
}

function send(ws: WebSocket, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendError(ws: WebSocket, message: string) {
  send(ws, {
    type: "error",
    message,
  });
}

function broadcastToRoom(roomId: string, data: any, excludeDeviceId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const playerId of room.players) {
    if (excludeDeviceId && playerId === excludeDeviceId) continue;

    const device = devices.get(playerId);
    if (device) {
      send(device.ws, data);
    }
  }
}

function handleDisconnect(ws: WebSocket) {
  const device = findDeviceByWs(ws);
  if (!device) return;

  console.log(`🔌 Dispositivo desconectado: ${device.id}`);

  // Remover de sala
  if (device.roomId) {
    const room = rooms.get(device.roomId);
    if (room) {
      room.players.delete(device.id);

      // Notificar sala
      broadcastToRoom(device.roomId, {
        type: "player_left",
        device_id: device.id,
        total_players: room.players.size,
      });

      // Se era o host, encerrar sala
      if (room.hostDeviceId === device.id) {
        broadcastToRoom(device.roomId, {
          type: "room_closed",
          reason: "Host desconectou",
        });
        rooms.delete(device.roomId);
      }
    }
  }

  // Remover dispositivo
  devices.delete(device.id);
  console.log(`📊 Total de dispositivos: ${devices.size}`);
}

function generateDeviceId(mac: string): string {
  return `device_${mac.replace(/:/g, "_")}`;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getButtonIndex(button: string): number {
  const map: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };
  return map[button] ?? -1;
}

async function checkAnswer(
  questionId: string,
  buttonIndex: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("custom_questions")
    .select("correct_answer")
    .eq("id", questionId)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar pergunta:", error);
    return false;
  }

  return data.correct_answer === buttonIndex;
}

// HEARTBEAT

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

// CLEANUP

setInterval(() => {
  const now = new Date();

  // Remover dispositivos inativos (5 minutos)
  for (const [id, device] of devices.entries()) {
    const inactiveTime = now.getTime() - device.lastActivity.getTime();
    if (inactiveTime > 5 * 60 * 1000) {
      console.log(`🧹 Removendo dispositivo inativo: ${id}`);
      device.ws.close();
      devices.delete(id);
    }
  }

  // Remover salas vazias (10 minutos)
  for (const [id, room] of rooms.entries()) {
    if (room.players.size === 0) {
      const roomAge = now.getTime() - room.createdAt.getTime();
      if (roomAge > 10 * 60 * 1000) {
        console.log(`🧹 Removendo sala vazia: ${room.code}`);
        rooms.delete(id);
      }
    }
  }
}, 60000);

// START SERVER

const PORT = process.env.WS_PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando na porta ${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws/hardware`);
  console.log(`\n💡 Aguardando conexões de dispositivos Arduino...\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 Encerrando servidor...");

  wss.clients.forEach((ws) => {
    ws.close();
  });

  httpServer.close(() => {
    console.log("✅ Servidor encerrado");
    process.exit(0);
  });
});
