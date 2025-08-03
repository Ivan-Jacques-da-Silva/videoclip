
# 🗄️ Configuração do Banco de Dados

## 📋 Passos para configurar o PostgreSQL no Replit:

### 1. Criar o Banco de Dados
1. **Abra uma nova aba** no Replit
2. **Digite "Database"** na barra de pesquisa
3. **Clique em "Create a database"**
4. **Aguarde a criação** - A variável `DATABASE_URL` será criada automaticamente

### 2. Configurar o Schema
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

### Verificar tabelas criadas:
O script criará automaticamente estas tabelas:
- ✅ `users` - Usuários do sistema
- ✅ `videos` - Vídeos enviados
- ✅ `cuts` - Cortes gerados
- ✅ `processing_jobs` - Jobs de processamento

## ⚠️ Problemas Comuns

### Erro: "DATABASE_URL not found"
- Certifique-se de ter criado o banco no Replit
- Reinicie o workspace se necessário

### Erro: "Connection refused"
- O banco pode estar "dormindo" - Execute uma query para acordá-lo
- Aguarde alguns segundos e tente novamente

### Erro: "Permission denied"
- Execute: `chmod +x scripts/*.sh`
- Ou use: `bash scripts/setup-database.sh`

## 🎯 Próximos Passos

1. ✅ Configurar banco de dados (este passo)
2. 📝 Configurar APIs sociais (veja `API_SETUP.md`)
3. 🚀 Executar aplicação: `npm run dev`
4. 🌐 Acessar: `http://localhost:5000`
