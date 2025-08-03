
#!/bin/bash

echo "⚠️  RESET DO BANCO DE DADOS"
echo "Isso irá APAGAR TODOS OS DADOS!"
read -p "Tem certeza? (digite 'RESET' para confirmar): " confirm

if [ "$confirm" != "RESET" ]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo "🗑️  Removendo todas as tabelas..."

# Conectar ao banco e dropar todas as tabelas
npx drizzle-kit drop

echo "🔄 Recriando estrutura do banco..."

# Recriar as tabelas
npx drizzle-kit push

echo "✅ Banco resetado com sucesso!"
echo "🎯 Execute: npm run dev para iniciar a aplicação"
