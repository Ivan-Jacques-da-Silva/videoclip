
#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
log_error "⚠️  RESET COMPLETO DO BANCO DE DADOS"
echo ""
echo "🗑️  Esta operação irá:"
echo "   - APAGAR TODOS OS DADOS do banco"
echo "   - REMOVER todas as tabelas"
echo "   - RECRIAR o schema do zero"
echo "   - LIMPAR arquivos de vídeos e cortes locais"
echo ""
read -p "❓ Tem certeza que deseja continuar? (digite 'RESET' para confirmar): " confirm

if [ "$confirm" != "RESET" ]; then
    log_info "Operação cancelada pelo usuário"
    exit 0
fi

echo ""
log_warning "Iniciando reset do banco de dados..."

# 1. Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL não encontrada!"
    exit 1
fi

log_info "DATABASE_URL encontrada: ${DATABASE_URL:0:40}..."

# 2. Backup de segurança (listar dados antes de apagar)
log_info "Fazendo backup das informações atuais..."

cat > temp_backup_info.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function backupInfo() {
  const prisma = new PrismaClient();
  
  try {
    const videoCount = await prisma.video.count();
    const cutCount = await prisma.cut.count();
    const jobCount = await prisma.processingJob.count();
    
    console.log(`📊 Dados que serão perdidos:`);
    console.log(`   - Vídeos: ${videoCount}`);
    console.log(`   - Cortes: ${cutCount}`);
    console.log(`   - Jobs de processamento: ${jobCount}`);
    
    if (videoCount > 0 || cutCount > 0 || jobCount > 0) {
      console.log('\n⚠️  Você tem dados que serão perdidos!');
    } else {
      console.log('\n✅ Banco está vazio, reset seguro');
    }
    
  } catch (error) {
    console.log('❌ Não foi possível acessar o banco atual');
  } finally {
    await prisma.$disconnect();
  }
}

backupInfo();
EOF

node temp_backup_info.js
rm -f temp_backup_info.js

echo ""
read -p "❓ Continuar com o reset? (digite 'SIM' para prosseguir): " final_confirm

if [ "$final_confirm" != "SIM" ]; then
    log_info "Reset cancelado"
    exit 0
fi

# 3. Limpar arquivos locais
log_info "Limpando arquivos locais..."

# Remover arquivos de uploads (mantendo a pasta)
if [ -d "uploads" ]; then
    find uploads -type f -name "*.mp4" -delete 2>/dev/null || true
    find uploads -type f -name "*.mov" -delete 2>/dev/null || true
    find uploads -type f -name "*.avi" -delete 2>/dev/null || true
    log_success "Arquivos de upload limpos"
fi

# Remover arquivos de cortes (mantendo a pasta)
if [ -d "cuts" ]; then
    find cuts -type f -name "*.mp4" -delete 2>/dev/null || true
    find cuts -type f -name "*.mov" -delete 2>/dev/null || true
    find cuts -type f -name "*.avi" -delete 2>/dev/null || true
    log_success "Arquivos de cortes limpos"
fi

# 4. Reset do banco usando Prisma
log_info "Executando reset do banco PostgreSQL..."

# Forçar reset sem confirmação interativa
if ! npx prisma migrate reset --force --skip-generate; then
    log_warning "Reset com migrate falhou, tentando db push..."
    
    # Alternativa: apagar e recriar manualmente
    if ! npx prisma db push --force-reset --accept-data-loss; then
        log_error "Falha no reset do banco"
        exit 1
    fi
fi

log_success "Banco resetado"

# 5. Gerar cliente Prisma novamente
log_info "Gerando cliente Prisma..."
if ! npx prisma generate; then
    log_error "Falha ao gerar cliente Prisma"
    exit 1
fi

log_success "Cliente Prisma gerado"

# 6. Aplicar schema novamente
log_info "Aplicando schema ao banco limpo..."
if ! npx prisma db push --accept-data-loss; then
    log_error "Falha ao aplicar schema"
    exit 1
fi

log_success "Schema aplicado"

# 7. Verificar se tudo está funcionando
log_info "Verificando se o reset foi bem-sucedido..."

cat > temp_verify_reset.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function verifyReset() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar se as tabelas estão vazias
    const videoCount = await prisma.video.count();
    const cutCount = await prisma.cut.count();
    const jobCount = await prisma.processingJob.count();
    
    if (videoCount === 0 && cutCount === 0 && jobCount === 0) {
      console.log('✅ Reset confirmado - todas as tabelas estão vazias');
      console.log('✅ Banco pronto para uso');
    } else {
      console.log('⚠️  Reset pode não ter sido completo');
      console.log(`   - Vídeos restantes: ${videoCount}`);
      console.log(`   - Cortes restantes: ${cutCount}`);
      console.log(`   - Jobs restantes: ${jobCount}`);
    }
    
    // Teste de inserção básica
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conectividade confirmada');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyReset();
EOF

if node temp_verify_reset.js; then
    log_success "Verificação passou"
else
    log_error "Falha na verificação pós-reset"
    rm -f temp_verify_reset.js
    exit 1
fi

rm -f temp_verify_reset.js

# 8. Recriar estrutura de pastas
log_info "Recriando estrutura de pastas..."
mkdir -p uploads cuts

# Recriar gitkeep files
touch uploads/.gitkeep
touch cuts/.gitkeep

log_success "Estrutura de pastas recriada"

# 9. Resumo final
echo ""
echo "🎉 RESET CONCLUÍDO COM SUCESSO!"
echo ""
echo "📋 O que foi feito:"
echo "   ✅ Banco PostgreSQL: Completamente resetado"
echo "   ✅ Tabelas: Recriadas vazias"
echo "   ✅ Arquivos locais: Limpos"
echo "   ✅ Cliente Prisma: Regenerado"
echo "   ✅ Schema: Reaplicado"
echo "   ✅ Estrutura: Verificada e funcional"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Execute: npm run dev"
echo "   2. Acesse: http://localhost:5000"
echo "   3. Seu banco está limpo e pronto para novos dados"
echo ""
echo "💡 Dica: Use 'npm run db:studio' para visualizar o banco vazio"
echo ""
log_success "Sistema resetado e pronto para uso!"
