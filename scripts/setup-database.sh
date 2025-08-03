
#!/bin/bash

echo "🚀 Configurando banco de dados PostgreSQL com Prisma..."

# Verificar se DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada!"
    echo "📋 Siga estes passos:"
    echo "1. Abra uma nova aba no Replit"
    echo "2. Digite 'Database'"
    echo "3. Clique em 'Create a database'"
    echo "4. A variável DATABASE_URL será criada automaticamente"
    echo "5. Execute este script novamente"
    exit 1
fi

echo "✅ DATABASE_URL encontrada: ${DATABASE_URL:0:30}..."

# Instalar dependências se necessário
echo "📦 Verificando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar schema ao banco
echo "🔄 Aplicando schema ao banco..."
npx prisma db push

echo "✅ Banco de dados configurado com sucesso!"

echo "🎯 Próximos passos:"
echo "1. Configure suas APIs no arquivo .env (veja API_SETUP.md)"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:5000"
echo ""
echo "🔍 Comandos úteis:"
echo "- npm run db:studio (Abrir Prisma Studio)"
echo "- npm run db:reset (Resetar banco)"
echo "- npm run db:migrate (Criar migração)"
