
# Scripts de Configuração do Backend

## 🚀 Configuração Automática Completa

### `full-setup.sh` - Setup Completo Automático

Este script faz **TUDO automaticamente** sem nenhuma intervenção manual:

#### O que ele faz:
1. **Instala PostgreSQL** (se não estiver instalado)
2. **Inicia o serviço** PostgreSQL
3. **Configura senha 'admin'** para o usuário postgres
4. **Cria banco de dados** `videocutter_db`
5. **Cria usuário** `videocutter_user` com senha `admin`
6. **Concede todas as permissões** ao usuário
7. **Cria arquivo .env** com DATABASE_URL configurada
8. **Instala dependências** Node.js/Prisma
9. **Gera cliente Prisma**
10. **Aplica schema** ao banco
11. **Cria todas as tabelas** (videos, cuts, processing_jobs, users)
12. **Testa conectividade** completa
13. **Inicia o backend** automaticamente

#### Como usar:

```bash
# Opção 1: Comando direto
npm run setup

# Opção 2: Executar script diretamente
chmod +x backend/scripts/full-setup.sh
./backend/scripts/full-setup.sh
```

#### Configurações criadas automaticamente:

- **Banco**: `videocutter_db`  
- **Usuário**: `videocutter_user`
- **Senha**: `admin`
- **Host**: `localhost:5432`
- **DATABASE_URL**: `postgresql://videocutter_user:admin@localhost:5432/videocutter_db?schema=public`

#### Após a execução:
- ✅ Backend rodando em `http://localhost:5000`
- ✅ Frontend acessível em `http://localhost:5000`
- ✅ Banco PostgreSQL configurado e funcional
- ✅ Todas as tabelas criadas
- ✅ Sistema pronto para uso

---

## 📊 Outros Scripts Disponíveis

### `setup-database.sh` - Configuração apenas do banco
- Configura banco usando Replit Database
- Para uso no ambiente Replit

### `reset-database.sh` - Reset completo do banco
- Apaga todos os dados
- Recria todas as tabelas
- Mantém estrutura

---

## 🔧 Comandos NPM Disponíveis

```bash
npm run setup        # Configuração completa automática
npm run dev          # Iniciar em modo desenvolvimento  
npm run db:setup     # Configurar banco (Replit)
npm run db:reset     # Resetar banco de dados
npm run db:studio    # Abrir Prisma Studio
npm run db:migrate   # Criar nova migração
npm run db:push      # Aplicar mudanças do schema
npm run db:generate  # Gerar cliente Prisma
```

---

## 🎯 Casos de Uso

### Para desenvolvimento local:
```bash
npm run setup
```

### Para ambiente Replit:
```bash
npm run db:setup
npm run dev
```

### Para reset completo:
```bash
npm run db:reset
npm run dev
```

---

## ⚠️ Requisitos

- **Node.js** 18+ instalado
- **Sistema Linux/macOS** (o script detecta e instala PostgreSQL automaticamente)
- **Permissões sudo** (para instalar PostgreSQL se necessário)

---

## 🆘 Resolução de Problemas

### PostgreSQL não inicia:
```bash
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

### Erro de permissão:
```bash
chmod +x backend/scripts/full-setup.sh
```

### Erro de conexão:
- Verifique se PostgreSQL está rodando
- Confirme que a senha do postgres é 'admin'
- Execute: `psql -h localhost -U postgres -c "SELECT version();"`

---

**🎉 Com o script `full-setup.sh`, você terá um ambiente completo funcionando em poucos minutos!**
