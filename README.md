# Agent Webhook

Uma aplicação completa para capturar, armazenar e inspecionar requisições webhook em tempo real.

## 📋 Sobre o Projeto

**Agent Webhook** é uma plataforma que permite você monitorar e analisar requisições webhook. Possui uma API robusta para capturar webhooks e uma interface web intuitiva para visualizá-los.

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **Node.js** com **TypeScript**
- **Fastify** - framework web de alta performance
- **PostgreSQL** - banco de dados
- **Drizzle ORM** - ORM type-safe
- **Zod** - validação de dados
- **Scalar API Reference** - documentação interativa

### Frontend (Web)
- **React 19** - biblioteca UI
- **Vite** - build tool rápido
- **TypeScript** - type safety
- **React DOM** - renderização

### Ferramentas
- **pnpm** - gerenciador de pacotes
- **Docker** - containerização
- **Biome** - linter e formatter

## 📦 Instalação

### Pré-requisitos
- **Node.js** (versão 18+)
- **pnpm** (versão 11.0.9+)
- **Docker** (para executar PostgreSQL)

### Passo 1: Clonar o Repositório

```bash
git clone <https://github.com/lednew2004/fullstack-webhook-inspector.git>
cd agent-webhook
```

### Passo 2: Instalar Dependências

```bash
pnpm install
```

### Passo 3: Iniciar o Banco de Dados

```bash
docker-compose up -d
```

Isso inicia um container PostgreSQL na porta `5445` com as credenciais:
- **Usuário:** docker
- **Senha:** docker
- **Banco:** webhooks

### Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `api`:

```bash
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5445/webhooks
```

### Passo 5: Executar Migrações do Banco de Dados

```bash
cd api
pnpm db:migrate
```

## 🚀 Uso

### Iniciar em Desenvolvimento

Execute ambas as aplicações simultaneamente:

**Terminal 1 - API:**
```bash
cd api
pnpm dev
```

A API estará disponível em `http://localhost:3333`
Documentação interativa em `http://localhost:3333/docs`

**Terminal 2 - Web:**
```bash
cd web
pnpm dev
```

A interface web estará disponível em `http://localhost:5173` (ou outra porta que o Vite indicar)

### Comandos Disponíveis

#### API
```bash
pnpm dev              # Desenvolvimento com hot-reload
pnpm start            # Produção
pnpm db:generate      # Gerar migrações Drizzle
pnpm db:migrate       # Aplicar migrações
pnpm db:studio        # Abrir Drizzle Studio (UI visual do BD)
pnpm format           # Formatar código com Biome
```

#### Web
```bash
pnpm dev              # Desenvolvimento com hot-reload
pnpm build            # Build para produção
pnpm preview          # Visualizar build de produção
```

## 📚 Estrutura do Projeto

```
agent-webhook/
├── api/                    # Backend (Fastify + PostgreSQL)
│   ├── src/
│   │   ├── server.ts      # Configuração do servidor
│   │   ├── routes/        # Rotas da API
│   │   └── db/            # Schema e migrations
│   └── package.json
│
├── web/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx        # Componente principal
│   │   └── main.tsx       # Entrada da aplicação
│   └── package.json
│
├── docker-compose.yml      # Configuração Docker
├── package.json           # Configuração do monorepo
└── README.md
```

## 🔌 API Endpoints

- `GET /api/webhooks` - Listar webhooks capturados
- `GET /docs` - Documentação interativa da API

## 📝 Exemplo de Uso

1. Acesse a API em `http://localhost:3333/docs`
2. Configure seu webhook para enviar requisições para qualquer endpoint da API
3. Visualize os webhooks capturados na interface web

## 🐛 Troubleshooting

### Porta já em uso
Se a porta 3333 (API) ou 5445 (PostgreSQL) já estiver em uso, modifique no `.env` ou `docker-compose.yml`

### Erro de conexão com banco de dados
Verifique se o container Docker está rodando:
```bash
docker ps
```

Reinicie se necessário:
```bash
docker-compose restart
```

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ em TypeScript**
