# Checklist de Deploy

## ✅ Correções Aplicadas

### Backend
- [x] Script de deploy corrigido para usar `prisma migrate deploy` (produção)
- [x] Código refatorado para usar `env` validado em todos os lugares
- [x] Schema do Prisma corrigido (removido output customizado)
- [x] `.gitignore` criado na raiz do projeto

### Configurações
- [x] Validação de variáveis de ambiente com Zod
- [x] Uso consistente do módulo `env` validado

## 📋 Checklist Pré-Deploy

### Backend

#### Variáveis de Ambiente Necessárias
Certifique-se de configurar as seguintes variáveis no ambiente de produção:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com  # Opcional, usa FRONTEND_URL como fallback
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
GOOGLE_API_KEY=your_google_api_key
```

#### Scripts de Deploy
O script `npm run deploy` agora executa:
1. `prisma generate` - Gera o Prisma Client
2. `prisma migrate deploy` - Aplica migrações em produção
3. `npm run build` - Compila TypeScript
4. `npm run start` - Inicia o servidor

#### Banco de Dados
- [ ] PostgreSQL configurado e acessível
- [ ] `DATABASE_URL` configurada corretamente
- [ ] Migrações aplicadas (`prisma migrate deploy`)
- [ ] Prisma Client gerado (`prisma generate`)

#### Autenticação
- [ ] Chaves do Clerk configuradas (produção)
- [ ] `CLERK_SECRET_KEY` e `CLERK_PUBLISHABLE_KEY` definidas
- [ ] URLs de callback configuradas no Clerk Dashboard

#### API Externa
- [ ] Chave da Google Gemini API configurada
- [ ] `GOOGLE_API_KEY` definida e válida

#### CORS
- [ ] `FRONTEND_URL` configurada com a URL de produção do frontend
- [ ] `CORS_ORIGIN` configurada (opcional, usa `FRONTEND_URL` como fallback)

### Frontend

#### Variáveis de Ambiente Necessárias
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_API_URL=https://your-backend-domain.com/api
```

#### Build
- [ ] `npm run build` executa sem erros
- [ ] Arquivos gerados em `dist/` estão corretos
- [ ] Variáveis de ambiente prefixadas com `VITE_` estão configuradas

#### Autenticação
- [ ] Chave pública do Clerk configurada
- [ ] URLs de callback configuradas no Clerk Dashboard

#### API
- [ ] `VITE_API_URL` aponta para o backend de produção

## 🚨 Problemas Conhecidos

### Arquivos .env.example
Os arquivos `.env.example` não puderam ser criados automaticamente. 
Crie manualmente:

**backend/.env.example:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/travelwise-backend?schema=public
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com  # Opcional
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
GOOGLE_API_KEY=your_google_api_key
```

**frontend/.env.example:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
```

## 📝 Recomendações Adicionais

### Segurança
- [ ] Usar variáveis de ambiente seguras (não commitar `.env`)
- [ ] Usar chaves de produção do Clerk (não test keys)
- [ ] Configurar HTTPS em produção
- [ ] Configurar rate limiting no backend
- [ ] Configurar CORS corretamente para produção

### Performance
- [ ] Configurar cache para respostas da API
- [ ] Otimizar queries do Prisma
- [ ] Configurar connection pooling para PostgreSQL

### Monitoramento
- [ ] Configurar logging (Winston, Pino, etc.)
- [ ] Configurar error tracking (Sentry, etc.)
- [ ] Configurar health checks

### DevOps
- [ ] Configurar CI/CD pipeline
- [ ] Configurar testes automatizados
- [ ] Configurar backup automático do banco de dados

## ✅ Status Final

Após verificar todos os itens acima, o projeto estará pronto para deploy em produção.

