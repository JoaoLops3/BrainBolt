# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-10-21

### 🎉 Adicionado

- Sistema completo de salas de aula para professores
- Perguntas customizadas ilimitadas por sala
- Modo escuro/claro/automático
- Tutorial interativo para novos usuários
- Suporte para hardware físico com Arduino
- Servidor WebSocket para comunicação com dispositivos
- Sistema de conquistas e personagens colecionáveis
- Dashboard de estatísticas avançadas
- Modo multiplayer em tempo real
- Sistema de amigos completo
- PWA com suporte offline completo
- Aplicativos nativos iOS e Android
- Notificações locais e nativas
- Sistema de roles (Professor, Aluno, Líder)

### 🔄 Modificado

- Melhorias significativas de performance (~40% redução de bundle)
- UI completamente redesenhada com glassmorphism
- Sistema de autenticação aprimorado
- Responsividade total para mobile, tablet e desktop
- Otimização do Service Worker (v2.0.0)
- Cache inteligente com múltiplas estratégias

### 🐛 Corrigido

- Problemas de sincronização em partidas multiplayer
- Correções de performance em dispositivos móveis
- Bugs de autenticação OAuth
- Problemas de cache offline
- Ajustes de responsividade em tablets

### 🔒 Segurança

- Implementação de Row Level Security (RLS) no Supabase
- Validação de entrada de dados
- Proteção contra CSRF
- Migração de credenciais para variáveis de ambiente

---

## [1.0.0] - 2024-12-15

### 🎉 Adicionado

- Lançamento inicial do Brain Bolt
- 3 modos de jogo: Normal, Veloz e Físico
- 400+ perguntas em 6 categorias
- Sistema de pontuação e streaks
- Autenticação com email/senha
- Perfis de usuário
- Estatísticas básicas
- Design responsivo inicial

---

## 📝 Notas de Versão

### Migração de 1.x para 2.0

⚠️ **Atenção**: A versão 2.0 introduz mudanças significativas:

1. **Variáveis de Ambiente**: Agora é necessário criar um arquivo `.env.local` com as credenciais do Supabase. Veja `.env.example` para referência.

2. **Banco de Dados**: Execute todas as migrações SQL da pasta `supabase/migrations/` em ordem cronológica.

3. **Dependências**: Execute `npm install` para atualizar todas as dependências.

### Versões Futuras

Planejado para v2.1.0:

- Sistema de XP e níveis
- Chat entre amigos
- Modo torneio
- Integração com Google Classroom

---

**Convenções de Commit:**

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `test:` Adição/modificação de testes
- `chore:` Tarefas de manutenção
