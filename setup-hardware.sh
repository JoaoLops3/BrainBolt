#!/bin/bash

# Brain Bolt - Setup Automático para Hardware Arduino
# Este script configura automaticamente o ambiente para usar botões físicos

set -e

echo "🚀 Brain Bolt - Setup Automático para Hardware"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto Brain Bolt"
    exit 1
fi

print_status "Verificando dependências do sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado"
    exit 1
fi

print_success "npm $(npm --version) encontrado"

# Verificar Arduino IDE (opcional)
if command -v arduino-cli &> /dev/null; then
    print_success "Arduino CLI encontrado: $(arduino-cli version --format json | jq -r '.Application.Version')"
elif command -v arduino &> /dev/null; then
    print_success "Arduino IDE encontrado"
else
    print_warning "Arduino IDE não encontrado. Instale para programar o Arduino."
fi

echo ""
print_status "Instalando dependências do projeto..."

# Instalar dependências principais
npm install

print_success "Dependências principais instaladas"

# Instalar dependências do servidor
print_status "Instalando dependências do servidor de hardware..."
cd server
npm install

print_success "Dependências do servidor instaladas"

# Voltar para raiz
cd ..

echo ""
print_status "Configurando variáveis de ambiente..."

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    print_status "Criando arquivo .env.local..."
    cat > .env.local << EOF
# Brain Bolt - Configurações de Hardware
VITE_ENABLE_PHYSICAL_MODE=true
VITE_HARDWARE_WS_URL=ws://localhost:8080/ws/hardware

# Supabase (configure com suas credenciais)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
    print_success "Arquivo .env.local criado"
else
    print_warning "Arquivo .env.local já existe"
fi

# Criar arquivo .env no servidor se não existir
if [ ! -f "server/.env" ]; then
    print_status "Criando arquivo server/.env..."
    cat > server/.env << EOF
# Brain Bolt Hardware Server
WS_PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EOF
    print_success "Arquivo server/.env criado"
else
    print_warning "Arquivo server/.env já existe"
fi

echo ""
print_status "Verificando portas seriais disponíveis..."

# Detectar portas seriais (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SERIAL_PORTS=$(ls /dev/tty.usb* 2>/dev/null || echo "")
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    SERIAL_PORTS=$(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null || echo "")
else
    print_warning "Sistema operacional não suportado para detecção automática de portas"
    SERIAL_PORTS=""
fi

if [ -n "$SERIAL_PORTS" ]; then
    print_success "Portas seriais encontradas:"
    for port in $SERIAL_PORTS; do
        echo "  - $port"
    done
else
    print_warning "Nenhuma porta serial encontrada. Conecte o Arduino e execute novamente."
fi

echo ""
print_status "Criando scripts de inicialização..."

# Script para iniciar tudo
cat > start-hardware.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando Brain Bolt com Hardware..."
echo "======================================"

# Verificar se o servidor está rodando
if ! pgrep -f "hardware-websocket.ts" > /dev/null; then
    echo "📡 Iniciando servidor WebSocket..."
    cd server
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    # Aguardar servidor inicializar
    sleep 3
else
    echo "✅ Servidor WebSocket já está rodando"
fi

# Verificar se o bridge está rodando
if ! pgrep -f "simple-bridge.js" > /dev/null; then
    echo "🔗 Iniciando bridge WebSocket..."
    cd server
    npm run bridge &
    BRIDGE_PID=$!
    cd ..
else
    echo "✅ Bridge WebSocket já está rodando"
fi

# Iniciar aplicação frontend
echo "🌐 Iniciando aplicação web..."
npm run dev

# Cleanup ao sair
trap "kill $SERVER_PID $BRIDGE_PID 2>/dev/null" EXIT
EOF

chmod +x start-hardware.sh
print_success "Script start-hardware.sh criado"

# Script para parar tudo
cat > stop-hardware.sh << 'EOF'
#!/bin/bash

echo "🛑 Parando Brain Bolt Hardware..."

# Parar processos
pkill -f "hardware-websocket.ts" 2>/dev/null || true
pkill -f "simple-bridge.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "✅ Todos os processos foram parados"
EOF

chmod +x stop-hardware.sh
print_success "Script stop-hardware.sh criado"

echo ""
print_status "Criando documentação de uso..."

# Criar README específico para hardware
cat > HARDWARE-SETUP.md << 'EOF'
# 🎮 Brain Bolt - Setup de Hardware

## ✅ Setup Concluído!

O ambiente para usar botões físicos com Arduino foi configurado com sucesso.

## 🚀 Como usar:

### 1. Conectar Arduino
- Conecte o Arduino ao computador via USB
- Verifique se a porta serial está disponível

### 2. Programar Arduino
- Abra o Arduino IDE
- Carregue o arquivo `arduino/brainbolt_controller.ino`
- Configure a porta serial correta
- Faça upload do código

### 3. Iniciar Sistema
```bash
# Opção 1: Script automático
./start-hardware.sh

# Opção 2: Manual
# Terminal 1 - Servidor WebSocket
cd server && npm run dev

# Terminal 2 - Bridge Serial-WebSocket  
cd server && npm run bridge

# Terminal 3 - Frontend
npm run dev
```

### 4. Usar no App
- Acesse o Brain Bolt no navegador
- Vá para "Modo Multiplayer"
- Selecione "Modo Físico"
- Conecte o hardware
- Inicie o jogo!

## 🔧 Solução de Problemas:

### Arduino não conecta
- Verifique se o cabo USB está funcionando
- Instale drivers CH340/CH341 se necessário
- Verifique a porta serial no Arduino IDE

### Bridge não funciona
- Verifique se a porta serial está correta
- Execute: `npm run bridge -- --port /dev/ttyUSB0` (Linux) ou `COM3` (Windows)
- Verifique se o Arduino está enviando dados

### WebSocket não conecta
- Verifique se o servidor está rodando na porta 8080
- Verifique firewall/antivírus
- Teste: `curl http://localhost:8080`

## 📁 Arquivos importantes:
- `arduino/brainbolt_controller.ino` - Código do Arduino
- `server/serial-bridge.js` - Bridge Serial-WebSocket
- `server/hardware-websocket.ts` - Servidor WebSocket
- `src/hooks/usePhysicalMode.ts` - Hook para modo físico
- `src/components/game/PhysicalMode.tsx` - Interface do modo físico

## 🆘 Suporte:
Se encontrar problemas, verifique:
1. Logs do servidor WebSocket
2. Logs do bridge Serial-WebSocket  
3. Serial Monitor do Arduino
4. Console do navegador (F12)
EOF

print_success "Documentação HARDWARE-SETUP.md criada"

echo ""
print_success "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure suas credenciais do Supabase em .env.local e server/.env"
echo "2. Conecte o Arduino ao computador"
echo "3. Programe o Arduino com o código em arduino/brainbolt_controller.ino"
echo "4. Execute: ./start-hardware.sh"
echo "5. Acesse o Brain Bolt e use o Modo Físico!"
echo ""
echo "📚 Documentação completa: HARDWARE-SETUP.md"
echo "🆘 Para ajuda: docs/hardware/ARDUINO-SETUP.md"
echo ""
print_status "Boa sorte com seu projeto! 🚀"
