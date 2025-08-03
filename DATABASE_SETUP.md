
# 🗄️ Configuração do Banco de Dados com Prisma

## 📋 Passos para configurar o PostgreSQL + Prisma no Replit:

### 1. Criar o Banco de Dados
1. **Abra uma nova aba** no Replit
2. **Digite "Database"** na barra de pesquisa
3. **Clique em "Create a database"**
4. **Aguarde a criação** - A variável `DATABASE_URL` será criada automaticamente

### 2. Configurar o Schema com Prisma
Execute o script de configuração:
```bash
npm run db:setup
```

### 3. Resetar Banco (se necessário)
Para apagar todos os dados e recriar as tabelas:
```bash
npm run db:reset
```

## 🔍 Verificar Configuração

### Verificar se o banco está funcionando:
```bash
npm run dev
```

### Abrir Prisma Studio (Interface Visual):
```bash
npm run db:studio
```

### Verificar tabelas criadas:
O Prisma criará automaticamente estas tabelas:
- ✅ `users` - Usuários do sistema
- ✅ `videos` - Vídeos enviados
- ✅ `cuts` - Cortes gerados
- ✅ `processing_jobs` - Jobs de processamento

## 🛠️ Comandos Prisma Úteis

### Gerar cliente após mudanças no schema:
```bash
npm run db:generate
```

### Aplicar mudanças no schema:
```bash
npm run db:push
```

### Criar migração:
```bash
npm run db:migrate
```

### Abrir Prisma Studio:
```bash
npm run db:studio
```

## ⚠️ Problemas Comuns

### Erro: "DATABASE_URL not found"
- Certifique-se de ter criado o banco no Replit
- Reinicie o workspace se necessário

### Erro: "Connection refused"
- O banco pode estar "dormindo" - Execute uma query para acordá-lo
- Aguarde alguns segundos e tente novamente

### Erro: "Prisma Client not generated"
- Execute: `npm run db:generate`
- Reinicie o servidor: `npm run dev`

## 🎯 Próximos Passos

1. ✅ Configurar banco de dados com Prisma (este passo)
2. 📝 Configurar APIs sociais (veja `API_SETUP.md`)
3. 🚀 Executar aplicação: `npm run dev`
4. 🌐 Acessar: `http://localhost:5000`
5. 🔍 Explorar dados: `npm run db:studio`

## 🆚 Prisma vs Drizzle

**Vantagens do Prisma:**
- ✅ Interface visual (Prisma Studio)
- ✅ Migrações automáticas
- ✅ Type-safety completo
- ✅ Introspection de banco existente
- ✅ Documentação extensiva
- ✅ Relacionamentos simples
