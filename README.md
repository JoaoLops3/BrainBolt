# 🧠 Brain Bolt - Plataforma Educacional de Quiz

<div align="center">
  <img src="./public/Brain-Bolt-Logo.png" alt="Brain Bolt Logo" width="200" height="200">
  
  ![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=flat)
  ![Versão](https://img.shields.io/badge/Vers%C3%A3o-2.0.0-blue?style=flat)
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.57.2-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-7.4.3-119EFF?style=flat&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
</div>

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Stack Tecnológica](#-stack-tecnológica)
- [Instalação](#-instalação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura do Banco de Dados](#-arquitetura-do-banco-de-dados)
- [Performance](#-performance)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🎯 Visão Geral

**Brain Bolt** é uma plataforma educacional de quiz abrangente, projetada para transformar o aprendizado em uma experiência envolvente e gamificada. Construída especificamente para ambientes de sala de aula, combina tecnologia digital com interação física para criar um ecossistema educacional imersivo.

### Missão

Resolver um dos maiores desafios da educação moderna: manter o foco e o engajamento dos alunos durante as aulas através de gamificação, competição saudável e aprendizado interativo.

### Destaques

- **400+ perguntas** selecionadas em 6 categorias
- **Multiplayer em tempo real** com sincronização WebSocket
- **Sistema de gerenciamento** de salas de aula
- **Criação de perguntas** personalizadas
- **Integração com hardware** físico (botões ESP32/Arduino)
- **Progressive Web App** com suporte offline
- **Apps nativos** para iOS e Android

---

## ✨ Funcionalidades Principais

### 🎮 Sistema de Jogo

**Modos de Jogo:**

- **Modo Normal**: Foco em estudo, sem pressão de tempo
- **Modo Veloz**: Limite de 15 segundos por pergunta
- **Modo Físico**: Integração com botões de hardware para sala de aula

**Pontuação e Progresso:**

- 100 pontos por resposta correta
- Bônus de streak por respostas consecutivas corretas
- Personagens colecionáveis desbloqueados por desempenho em categorias
- Rankings globais e por sala de aula

### 🏫 Ferramentas Educacionais

**Gerenciamento de Sala de Aula:**

- Criar e gerenciar grupos de sala de aula
- Definir períodos de competição com datas de início e fim
- Inscrição de alunos via códigos de turma únicos
- Acompanhamento de desempenho e análises em tempo real
- Biblioteca de perguntas personalizadas por sala

**Recursos para Professores:**

- Criação ilimitada de perguntas personalizadas
- Atribuição de categoria e dificuldade
- Compartilhamento de perguntas e biblioteca pública
- Relatórios detalhados de desempenho dos alunos
- Rankings específicos por sala de aula

**Sistema de Roles:**

- **Professor**: Criar salas, gerenciar perguntas, visualizar análises
- **Líder**: Organizar grupos de estudo e competições
- **Estudante**: Participar de salas e responder quizzes

### 👥 Social e Multiplayer

- **Partidas 1v1 em Tempo Real**: Salas privadas com gameplay sincronizado
- **Sistema de Amigos**: Buscar, adicionar e desafiar amigos
- **Rankings Globais**: Comparar desempenho com todos os jogadores
- **Estatísticas Detalhadas**: Acompanhar progresso em todos os modos de jogo

### 🔧 Recursos Técnicos

- **Suporte PWA**: Funcionalidade offline após primeiro carregamento
- **Code Splitting**: Tamanho de bundle otimizado (~40% de redução)
- **Lazy Loading**: Carregamento dinâmico de componentes
- **Service Worker**: Estratégias inteligentes de cache
- **Modo Escuro**: Claro, escuro e automático pelo sistema
- **Design Responsivo**: Abordagem mobile-first com suporte tablet/desktop

---

## 🚀 Stack Tecnológica

### Frontend

| Tecnologia         | Versão | Propósito                                       |
| ------------------ | ------ | ----------------------------------------------- |
| **React**          | 18.3.1 | Framework UI com hooks e context                |
| **TypeScript**     | 5.8.3  | Tipagem estática e qualidade de código          |
| **Vite**           | 5.4.19 | Build tool rápida e servidor de desenvolvimento |
| **Tailwind CSS**   | 3.4.17 | Framework CSS utilitário                        |
| **shadcn/ui**      | Latest | Componentes modernos e acessíveis               |
| **React Router**   | 6.30.1 | Roteamento client-side                          |
| **TanStack Query** | 5.83.0 | Busca de dados e cache                          |
| **Zustand**        | Latest | Gerenciamento de estado                         |

### Backend e Infraestrutura

| Tecnologia                  | Propósito                           |
| --------------------------- | ----------------------------------- |
| **Supabase**                | Plataforma Backend-as-a-Service     |
| **PostgreSQL**              | Banco de dados relacional com RLS   |
| **Real-time Subscriptions** | Atualizações ao vivo via WebSocket  |
| **Edge Functions**          | Funções serverless                  |
| **Supabase Auth**           | Autenticação com provedores sociais |

### Mobile

| Tecnologia    | Propósito                            |
| ------------- | ------------------------------------ |
| **Capacitor** | 7.4.3 - Wrapper para apps nativos    |
| **iOS**       | App nativo para dispositivos Apple   |
| **Android**   | App nativo para dispositivos Android |
| **PWA**       | Recursos de Progressive Web App      |

---

## 💻 Instalação

### Pré-requisitos

- Node.js 18 ou superior
- npm ou bun (gerenciador de pacotes)
- Conta no Supabase

### Início Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/JoaoLops3/BrainBolt.git
cd BrainBolt

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais do Supabase:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# 4. Execute as migrações do banco de dados
# Execute os arquivos SQL de supabase/migrations/ no dashboard do Supabase
# em ordem cronológica

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação em `http://localhost:8080`

### Configuração do Banco de Dados

Execute as seguintes migrações em ordem:

```sql
-- 1. Tabelas do sistema core
20250906171319_*.sql  -- Perfis e sistema de usuários
20250909203617_*.sql  -- Salas multiplayer
20251001000000_*.sql  -- Sistema de salas de aula
20251001000005_*.sql  -- Performance multiplayer

-- 2. Sistema de perguntas customizadas
20251015000000_*.sql  -- Tabela de perguntas customizadas
20251015000001_*.sql  -- Setup de perguntas customizadas
20251015000002_*.sql  -- Adicionar todas as colunas

-- 3. Segurança e roles
20251015000003_*.sql  -- Prevenção de conflito professor/aluno
20251015000004_*.sql  -- Campo de role do usuário
20251015000005_*.sql  -- Trigger de criação de perfil
```

### Desenvolvimento Mobile

```bash
# Build para produção
npm run build

# Sincronizar com plataformas nativas
npx cap sync

# Abrir no IDE
npx cap open ios      # Xcode (requer macOS)
npx cap open android  # Android Studio

# Executar em dispositivo/simulador
npx cap run ios
npx cap run android
```

---

## 📁 Estrutura do Projeto

```
BrainBolt/
├── src/
│   ├── components/
│   │   ├── game/              # Componentes de lógica do jogo
│   │   ├── classroom/         # Gerenciamento de sala de aula
│   │   ├── friends/           # Recursos sociais
│   │   ├── tutorial/          # Tutorial interativo
│   │   └── ui/                # Componentes UI reutilizáveis
│   ├── contexts/              # Contextos React
│   │   ├── AuthContext.tsx    # Autenticação
│   │   ├── StatsContext.tsx   # Estatísticas do usuário
│   │   └── ThemeContext.tsx   # Gerenciamento de tema
│   ├── hooks/                 # Hooks personalizados React
│   ├── integrations/          # Serviços externos
│   │   └── supabase/          # Cliente e tipos Supabase
│   ├── data/                  # Dados estáticos
│   │   └── perguntas.ts       # 400+ perguntas de quiz
│   ├── pages/                 # Páginas de rota
│   ├── types/                 # Definições TypeScript
│   └── lib/                   # Utilitários
├── supabase/
│   └── migrations/            # Migrações do banco de dados
├── ios/                       # Projeto nativo iOS
├── android/                   # Projeto nativo Android
├── public/                    # Assets estáticos
└── docs/                      # Documentação
```

---

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Principais

#### `profiles`

Perfis de usuário com estatísticas e preferências

- Armazena: pontuações, jogos realizados, taxa de vitória, conquistas
- Atualizado automaticamente via triggers após cada jogo

#### `game_sessions`

Histórico completo de jogos e estatísticas

- Rastreia: modo, pontuação, precisão, tempo, streaks
- Suporta sessões single e multiplayer

#### `classrooms`

Grupos educacionais de sala de aula

- Gerenciado por professores
- Períodos de competição com datas de início e fim
- Códigos únicos de entrada para estudantes

#### `classroom_students`

Relacionamento muitos-para-muitos entre usuários e salas

- Inscrição de estudantes e status
- Rastreamento de desempenho por sala

#### `custom_questions`

Perguntas criadas por professores

- Perguntas ilimitadas por professor/sala
- Rastreamento de categoria, dificuldade e estatísticas
- Capacidades de compartilhamento público

#### `multiplayer_rooms`

Sessões de jogo multiplayer em tempo real

- Sincronização WebSocket
- Sistema host/convidado
- Rastreamento de pontuação ao vivo

#### `friendships`

Conexões sociais entre usuários

- Solicitações de amizade e status
- Relacionamentos bidirecionais

### Recursos de Segurança

- **Row Level Security (RLS)**: Controle de acesso granular
- **Triggers Automáticos**: Atualizações de estatísticas em tempo real
- **Funções SQL**: Lógica de negócios server-side
- **Real-time Subscriptions**: Sincronização de dados ao vivo

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor dev (localhost:8080)
npm run build        # Build de produção
npm run preview      # Preview do build de produção
npm run lint         # Executar ESLint

# Mobile
npx cap sync         # Sincronizar código web com plataformas nativas
npx cap open ios     # Abrir no Xcode
npx cap open android # Abrir no Android Studio
npx cap doctor       # Verificar configuração do Capacitor

# Banco de Dados
# Execute as migrações manualmente no dashboard do Supabase
```

---

## 📈 Estatísticas do Projeto

- **Linhas de Código**: ~25.000+
- **Componentes**: 80+
- **Arquivos TypeScript**: 141
- **Categorias de Quiz**: 6
- **Perguntas Integradas**: 400+
- **Perguntas Customizadas**: Ilimitadas

---

## 👨‍💻 Autor

**João Gabriel Lopes Aguiar**

- GitHub: [@JoaoLops3](https://github.com/JoaoLops3)
- Email: joaogabriellops@outlook.com
- Versão: 2.0.0

---

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Infraestrutura backend
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Lucide](https://lucide.dev) - Biblioteca de ícones
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- **Educadores e Estudantes** - Inspiração e feedback

---

## 📄 Licença

Este projeto é open source para fins educacionais.

---

<div align="center">
  <b>🧠 Brain Bolt - Aprenda Brincando ⚡</b>
  <br><br>
  Feito com ❤️ para educadores e estudantes do mundo todo
  <br><br>
  <a href="https://github.com/JoaoLops3/BrainBolt/issues">Reportar Bug</a>
  ·
  <a href="https://github.com/JoaoLops3/BrainBolt/issues">Solicitar Funcionalidade</a>
</div>
