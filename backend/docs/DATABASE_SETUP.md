
# 🗄️ Configuração do Banco PostgreSQL com Prisma

Este guia mostra como configurar o banco de dados PostgreSQL usando Prisma ORM no Replit.

## 🚀 Setup Rápido

Execute este comando para configurar tudo automaticamente:

```bash
npm run db:setup
```

Ou execute o script manualmente:

```bash
bash backend/scripts/setup-database.sh
```

## 📋 Passos Manuais

### 1. Criar Banco no Replit

1. No Replit, abra uma nova aba
2. Digite "Database" na barra de pesquisa
3. Clique em "Create a database"
4. Aguarde a criação - A variável `DATABASE_URL` será criada automaticamente
5. Reinicie o workspace se necessário

### 2. Instalar Dependências

```bash
npm install prisma @prisma/client
```

### 3. Configurar Schema

O schema está localizado em `backend/prisma/schema.prisma` e já está configurado com:

- **User**: Sistema de usuários
- **Video**: Armazenamento de vídeos enviados
- **Cut**: Cortes gerados dos vídeos
- **ProcessingJob**: Fila de processamento

### 4. Aplicar Schema

```bash
npx prisma generate --schema=backend/prisma/schema.prisma
npx prisma db push --schema=backend/prisma/schema.prisma
```

### 5. Verificar Conexão

```bash
npx prisma studio --schema=backend/prisma/schema.prisma
```

## 🔧 Comandos Úteis

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar mudanças do schema
npm run db:push

# Criar nova migração
npm run db:migrate

# Resetar banco completamente
npm run db:reset

# Abrir interface visual
npm run db:studio

# Configurar banco do zero
npm run db:setup
```

## 🗂️ Estrutura do Banco

### Tabela: users
- `id`: Identificador único
- `username`: Nome de usuário único
- `password`: Senha hasheada

### Tabela: videos
- `id`: Identificador único
- `filename`: Nome do arquivo
- `originalName`: Nome original do upload
- `duration`: Duração em segundos
- `filePath`: Caminho no sistema de arquivos
- `fileSize`: Tamanho em bytes
- `uploadedAt`: Data/hora do upload
- `userId`: Referência ao usuário (opcional)

### Tabela: cuts
- `id`: Identificador único
- `videoId`: Referência ao vídeo
- `title`: Título do corte
- `description`: Descrição (opcional)
- `hashtags`: Hashtags (opcional)
- `startTime`: Tempo inicial em segundos
- `endTime`: Tempo final em segundos
- `duration`: Duração do corte
- `filePath`: Caminho do arquivo processado
- `status`: Status do processamento
- `platforms`: Plataformas selecionadas (JSON)
- `obfuscation`: Configurações de ofuscação (JSON)
- `createdAt`: Data/hora de criação
- `processedAt`: Data/hora de processamento

### Tabela: processing_jobs
- `id`: Identificador único
- `videoId`: Referência ao vídeo
- `cutPoints`: Pontos de corte formatados
- `status`: Status da fila (queued, processing, completed, failed)
- `progress`: Progresso percentual
- `error`: Mensagem de erro (se houver)
- `createdAt`: Data/hora de criação
- `startedAt`: Data/hora de início
- `completedAt`: Data/hora de conclusão

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- Sessões são gerenciadas com express-session
- Validação de tipos com Prisma

## 🌐 Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="postgresql://..."

# Aplicação
PORT=5000
NODE_ENV=development
SESSION_SECRET="sua_chave_secreta_aqui"
```

## 🛠️ Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o banco foi criado no Replit
- Reinicie o workspace
- Aguarde alguns segundos e tente novamente

### Erro: "Prisma Client not generated"
- Execute: `npm run db:generate`
- Reinicie o servidor: `npm run dev`

## 🎯 Próximos Passos

1. ✅ Configurar banco de dados com Prisma (este passo)
2. 📝 Configurar APIs sociais (veja `backend/docs/API_SETUP.md`)
3. 🚀 Executar aplicação: `npm run dev`
4. 🌐 Acessar: `http://localhost:5000`
5. 🔍 Explorar dados: `npm run db:studio`

## 🆚 Prisma vs Drizzle

**Vantagens do Prisma:**
- ✅ Interface visual (Prisma Studio)
- ✅ Migrações automáticas
- ✅ Type-safety completo
- ✅ Introspection automática
- ✅ Geração de cliente automática
- ✅ Suporte completo ao PostgreSQL
- ✅ Relacionamentos complexos simples
- ✅ Documentação extensa
