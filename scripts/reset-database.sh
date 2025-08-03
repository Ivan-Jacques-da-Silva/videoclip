
#!/bin/bash

echo "⚠️  RESET DO BANCO DE DADOS"
echo "Isso irá APAGAR TODOS OS DADOS!"
read -p "Tem certeza? (digite 'RESET' para confirmar): " confirm

if [ "$confirm" != "RESET" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo "🗑️  Resetando banco de dados..."

# Reset completo do banco usando Prisma
npx prisma migrate reset --force

echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo "✅ Banco resetado com sucesso!"
echo "🎯 Execute: npm run dev para iniciar a aplicação"
