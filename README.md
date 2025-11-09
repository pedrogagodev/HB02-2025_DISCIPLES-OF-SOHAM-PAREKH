# Travel Plan Generator

A complete system for generating **vacation itineraries** and **international relocation guides**, based on destination, budget, and trip duration. Uses Clerk authentication, Zod validation, Prisma ORM, and AI API via Google Gemini.

##  Technologies Used

```txt
- Node.js + Express
- React (Frontend)
- Prisma ORM
- PostgreSQL
- Zod (Validation)
- Clerk (Authentication)
- Google Gemini API (AI)
- Docker + Docker Compose

```

## Features

- Generate personalized **vacation itineraries** based on destination, budget, and trip duration.
- Create detailed **international relocation guides** with information on cost of living, taxes, climate, and job market.
- User authentication and management using **Clerk**.
- Integration with **Google Gemini AI API** to automatically generate travel plans and relocation guides.
- Responsive and interactive frontend built with **React**, **Tailwind CSS**, and **Framer Motion** for smooth animations.
- Fully containerized setup using **Docker** and **Docker Compose** for easy deployment.


## Archicheture 
- Controller: handles HTTP requests
- Service: applies business logic and calls the repository
- Repository: communicates with the database via Prisma
- Input validation with Zod
- Authentication using Clerk (clerkUserId in every plan)
- Gemini API integration for automatic plan generation
- Database: PostgreSQL in Docker container
- Frontend: React + Tailwind + Framer Motion

## How to run the project

### Development

#### 1. Run the backend
```bash
cd backend/
npm install
npm run db:up
npm run db:migrate
npm run dev
```

#### 2. Run the frontend
```bash
cd frontend/
npm install
npm run dev
```

### Production Deploy

#### Backend no Fly.io (Recomendado)

O projeto está configurado para deploy no Fly.io com Docker.

1. **Instalar Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

2. **Criar app e banco de dados:**
```bash
cd backend/
fly launch
```
Escolha "Yes" quando perguntar sobre PostgreSQL.

3. **Configurar variáveis de ambiente:**
```bash
fly secrets set CLERK_SECRET_KEY=sk_live_xxx
fly secrets set CLERK_PUBLISHABLE_KEY=pk_live_xxx
fly secrets set GOOGLE_API_KEY=your_api_key
fly secrets set FRONTEND_URL=https://your-frontend-domain.com
fly secrets set CORS_ORIGIN=https://your-frontend-domain.com  # Opcional
```

4. **Deploy:**
```bash
fly deploy
```

As migrações do Prisma serão executadas automaticamente antes de cada deploy.

**Ver documentação completa:** `backend/FLY_IO_DEPLOY.md`

#### Backend (Deploy Genérico)

1. Configure as variáveis de ambiente:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com  # Opcional
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
GOOGLE_API_KEY=your_google_api_key
```

2. Execute o deploy:
```bash
cd backend/
npm install
npm run deploy
```

O script `deploy` executa:
- `prisma generate` - Gera o Prisma Client
- `prisma migrate deploy` - Aplica migrações em produção
- `npm run build` - Compila TypeScript

#### Frontend

1. Configure as variáveis de ambiente:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_API_URL=https://your-backend-domain.com/api
```

2. Build e deploy:
```bash
cd frontend/
npm install
npm run build
# Deploy dos arquivos em dist/ para seu servidor
```

### Variáveis de Ambiente

Ver `DEPLOY_CHECKLIST.md` para detalhes completos sobre variáveis de ambiente e checklist de deploy.

### Deploy no Fly.io

Para instruções detalhadas de deploy no Fly.io, consulte `backend/FLY_IO_DEPLOY.md`.
