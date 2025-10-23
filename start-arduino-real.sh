#!/bin/bash

# Brain Bolt - Script de Inicialização para Arduino Real
# Este script inicia todos os serviços necessários para usar Arduino físico

echo "🚀 Brain Bolt - Iniciando com Arduino Real"
echo "=========================================="

# Funções auxiliares
print_status() {
    echo -e "\n[INFO] $1"
}

print_success() {
    echo -e "[SUCCESS] $1"
}

print_error() {
    echo -e "[ERROR] $1"
}

print_warning() {
    echo -e "[WARNING] $1"
}

# Verificar se o Arduino está conectado
check_arduino() {
    print_status "Verificando conexão do Arduino..."
    
    # Listar portas seriais disponíveis
    ARDUINO_PORTS=$(ls /dev/tty* 2>/dev/null | grep -E "(ttyUSB|ttyACM|tty.usb)" | head -1)
    
    if [ -z "$ARDUINO_PORTS" ]; then
        print_error "Arduino não encontrado!"
        echo "💡 Verifique se:"
        echo "   - O Arduino está conectado via USB"
        echo "   - O cabo USB está funcionando"
        echo "   - O Arduino está ligado"
        echo ""
        echo "🔍 Portas disponíveis:"
        ls /dev/tty* 2>/dev/null | head -10
        echo ""
        read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        ARDUINO_PORTS="/dev/ttyUSB0"  # Porta padrão
    else
        print_success "Arduino encontrado em: $ARDUINO_PORTS"
    fi
    
    export ARDUINO_PORT="$ARDUINO_PORTS"
}

# Verificar dependências
check_dependencies() {
    print_status "Verificando dependências..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js não encontrado. Instale o Node.js primeiro."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm não encontrado. Instale o npm primeiro."
        exit 1
    fi
    
    print_success "Dependências verificadas"
}

# Instalar dependências do servidor
install_server_deps() {
    print_status "Instalando dependências do servidor..."
    
    cd server
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Dependências do servidor instaladas"
        else
            print_error "Falha ao instalar dependências do servidor"
            exit 1
        fi
    else
        print_success "Dependências do servidor já instaladas"
    fi
    cd ..
}

# Iniciar servidor WebSocket
start_websocket_server() {
    print_status "Iniciando servidor WebSocket..."
    
    cd server
    node simple-server.js &
    WEBSOCKET_PID=$!
    cd ..
    
    # Aguardar servidor inicializar
    sleep 3
    
    if ps -p $WEBSOCKET_PID > /dev/null; then
        print_success "Servidor WebSocket iniciado (PID: $WEBSOCKET_PID)"
    else
        print_error "Falha ao iniciar servidor WebSocket"
        exit 1
    fi
}

# Iniciar bridge serial
start_serial_bridge() {
    print_status "Iniciando bridge serial para Arduino..."
    
    cd server
    node serial-bridge-simple.js --port "$ARDUINO_PORT" &
    BRIDGE_PID=$!
    cd ..
    
    # Aguardar bridge inicializar
    sleep 2
    
    if ps -p $BRIDGE_PID > /dev/null; then
        print_success "Bridge serial iniciado (PID: $BRIDGE_PID)"
    else
        print_error "Falha ao iniciar bridge serial"
        exit 1
    fi
}

# Iniciar frontend
start_frontend() {
    print_status "Iniciando frontend..."
    
    # Verificar se já está rodando
    if pgrep -f "vite" > /dev/null; then
        print_success "Frontend já está rodando"
    else
        npm run dev &
        FRONTEND_PID=$!
        
        # Aguardar frontend inicializar
        sleep 5
        
        if ps -p $FRONTEND_PID > /dev/null; then
            print_success "Frontend iniciado (PID: $FRONTEND_PID)"
        else
            print_error "Falha ao iniciar frontend"
            exit 1
        fi
    fi
}

# Função de cleanup
cleanup() {
    echo ""
    print_status "Encerrando serviços..."
    
    # Parar processos
    kill $WEBSOCKET_PID 2>/dev/null || true
    kill $BRIDGE_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    print_success "Serviços encerrados"
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Executar inicialização
main() {
    check_dependencies
    check_arduino
    install_server_deps
    start_websocket_server
    start_serial_bridge
    start_frontend
    
    echo ""
    print_success "🎉 Brain Bolt com Arduino Real iniciado!"
    echo ""
    echo "📱 URLs disponíveis:"
    echo "   Frontend: http://localhost:8081/"
    echo "   WebSocket: ws://localhost:8080/ws/hardware"
    echo ""
    echo "🔧 Arduino conectado em: $ARDUINO_PORT"
    echo ""
    echo "💡 Como usar:"
    echo "   1. Acesse http://localhost:8081/"
    echo "   2. Clique em 'Modo Físico'"
    echo "   3. Clique em 'Conectar Hardware'"
    echo "   4. Teste os botões e LEDs físicos!"
    echo ""
    echo "🛑 Pressione Ctrl+C para parar todos os serviços"
    echo ""
    
    # Manter script rodando
    while true; do
        sleep 1
    done
}

# Executar função principal
main
