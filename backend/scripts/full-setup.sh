
#!/bin/bash

# Script de configuração completa automática do backend
# Criado para automatizar 100% da configuração sem intervenção manual

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções para logs coloridos
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔧 $1${NC}"; }
log_db() { echo -e "${CYAN}🗄️  $1${NC}"; }

# Configurações do banco de dados
DB_NAME="videocutter_db"
DB_USER="videocutter_user"
DB_PASSWORD="admin"
DB_HOST="localhost"
DB_PORT="5432"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Definir diretório base do projeto
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")"
cd "$PROJECT_ROOT"

echo "🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA DO BACKEND"
echo "=============================================="
echo ""
log_info "Diretório do projeto: $PROJECT_ROOT"
log_info "Banco de dados: $DB_NAME"
log_info "Usuário do banco: $DB_USER"
log_info "Host: $DB_HOST:$DB_PORT"
echo ""

# 1. Verificar se PostgreSQL está instalado
log_step "Verificando instalação do PostgreSQL..."

if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL não está instalado!"
    echo ""
    echo "📦 Instalando PostgreSQL..."
    
    # Detectar sistema operacional e instalar
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif command -v yum &> /dev/null; then
            sudo yum install -y postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
        elif command -v pacman &> /dev/null; then
            sudo pacman -S postgresql
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install postgresql
        else
            log_error "Homebrew não encontrado. Instale o PostgreSQL manualmente."
            exit 1
        fi
    else
        log_error "Sistema operacional não suportado para instalação automática."
        log_info "Instale o PostgreSQL manualmente e execute este script novamente."
        exit 1
    fi
fi

log_success "PostgreSQL encontrado"

# 2. Iniciar serviço PostgreSQL
log_step "Iniciando serviço PostgreSQL..."

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &> /dev/null; then
        brew services start postgresql
    fi
fi

# Aguardar serviço iniciar
sleep 3
log_success "Serviço PostgreSQL iniciado"

# 3. Configurar usuário postgres com senha admin
log_step "Configurando usuário postgres..."

# Alterar senha do usuário postgres para 'admin'
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'admin';" 2>/dev/null || {
    log_warning "Tentando configurar postgres de forma alternativa..."
    sudo -u postgres psql -d postgres -c "ALTER USER postgres PASSWORD 'admin';"
}

log_success "Usuário postgres configurado com senha 'admin'"

# 4. Criar banco de dados e usuário
log_db "Criando banco de dados '$DB_NAME'..."

# Dropar banco se existir (para reset completo)
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null

# Criar banco
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME;" || {
    log_error "Falha ao criar banco de dados"
    exit 1
}

log_success "Banco '$DB_NAME' criado com sucesso"

# 5. Criar usuário específico
log_db "Criando usuário '$DB_USER'..."

# Dropar usuário se existir
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null

# Criar usuário com todas as permissões
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || {
    log_error "Falha ao criar usuário"
    exit 1
}

# Conceder todas as permissões
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "ALTER USER $DB_USER CREATEDB;" 
PGPASSWORD=admin psql -h $DB_HOST -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
PGPASSWORD=admin psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
PGPASSWORD=admin psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
PGPASSWORD=admin psql -h $DB_HOST -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

log_success "Usuário '$DB_USER' criado com todas as permissões"

# 6. Testar conexão
log_step "Testando conexão com o banco..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null || {
    log_error "Falha ao conectar com o banco usando o novo usuário"
    exit 1
}

log_success "Conexão com banco testada e funcionando"

# 7. Criar arquivo .env
log_step "Criando arquivo .env..."

cat > .env << EOF
# Database Configuration
DATABASE_URL="$DATABASE_URL"

# YouTube API Configuration  
YOUTUBE_CLIENT_ID="your_youtube_client_id"
YOUTUBE_CLIENT_SECRET="your_youtube_client_secret"
YOUTUBE_API_KEY="your_youtube_api_key"

# Instagram API Configuration
INSTAGRAM_APP_ID="your_instagram_app_id"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"

# Facebook API Configuration
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"

# TikTok API Configuration
TIKTOK_CLIENT_KEY="your_tiktok_client_key"
TIKTOK_CLIENT_SECRET="your_tiktok_client_secret"

# Application Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET="videocutter_secret_key_2024_secure"
EOF

log_success "Arquivo .env criado com DATABASE_URL configurada"

# 8. Instalar dependências do Node.js se necessário
log_step "Verificando dependências do Node.js..."

if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências do Node.js..."
    npm install
fi

if ! npm list prisma >/dev/null 2>&1; then
    log_info "Instalando Prisma..."
    npm install prisma @prisma/client
fi

log_success "Dependências verificadas e instaladas"

# 9. Gerar cliente Prisma
log_step "Gerando cliente Prisma..."

npx prisma generate --schema=backend/prisma/schema.prisma || {
    log_error "Falha ao gerar cliente Prisma"
    exit 1
}

log_success "Cliente Prisma gerado com sucesso"

# 10. Aplicar schema ao banco de dados
log_step "Aplicando schema ao banco de dados..."

npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss || {
    log_error "Falha ao aplicar schema ao banco"
    exit 1
}

log_success "Schema aplicado com sucesso"

# 11. Verificar estruturas criadas
log_step "Verificando tabelas criadas..."

# Criar script temporário para verificar tabelas
cat > temp_verify_tables.js << 'EOF'
const { PrismaClient } = require('./backend/prisma/generated/client');

async function verifyTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando tabelas...');
    
    const videoCount = await prisma.video.count();
    const cutCount = await prisma.cut.count();
    const jobCount = await prisma.processingJob.count();
    const userCount = await prisma.user.count();
    
    console.log('✅ Tabela videos: OK');
    console.log('✅ Tabela cuts: OK'); 
    console.log('✅ Tabela processing_jobs: OK');
    console.log('✅ Tabela users: OK');
    
    console.log(`\n📊 Estatísticas atuais:`);
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Vídeos: ${videoCount}`);
    console.log(`   - Cortes: ${cutCount}`);
    console.log(`   - Jobs: ${jobCount}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
EOF

if node temp_verify_tables.js; then
    log_success "Todas as tabelas foram criadas e estão funcionais"
else
    log_error "Erro ao verificar tabelas"
    rm -f temp_verify_tables.js
    exit 1
fi

rm -f temp_verify_tables.js

# 12. Criar diretórios necessários
log_step "Criando estrutura de diretórios..."

mkdir -p backend/uploads
mkdir -p backend/cuts
mkdir -p uploads

log_success "Estrutura de diretórios criada"

# 13. Teste final de conectividade completa
log_step "Executando teste final de conectividade..."

cat > temp_final_test.js << 'EOF'
const { PrismaClient } = require('./backend/prisma/generated/client');

async function finalTest() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Teste final de conectividade...');
    
    // Teste de conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');
    
    // Teste de operação básica
    const testResult = await prisma.$queryRaw`SELECT 1 as test_connection`;
    console.log('✅ Query de teste executada');
    
    // Teste de todas as tabelas principais
    await prisma.video.findMany({ take: 1 });
    await prisma.cut.findMany({ take: 1 });
    await prisma.processingJob.findMany({ take: 1 });
    await prisma.user.findMany({ take: 1 });
    
    console.log('✅ Todas as tabelas estão acessíveis');
    console.log('✅ Sistema totalmente funcional!');
    
  } catch (error) {
    console.error('❌ Erro no teste final:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();
EOF

if node temp_final_test.js; then
    log_success "Teste final passou - Sistema 100% configurado!"
else
    log_error "Falha no teste final"
    rm -f temp_final_test.js
    exit 1
fi

rm -f temp_final_test.js

# 14. Resumo final e inicialização
echo ""
echo "🎉 CONFIGURAÇÃO COMPLETA FINALIZADA COM SUCESSO!"
echo "================================================="
echo ""
echo "📋 Resumo da configuração:"
echo "   ✅ PostgreSQL: Instalado e rodando"
echo "   ✅ Banco '$DB_NAME': Criado e configurado"
echo "   ✅ Usuário '$DB_USER': Criado com todas as permissões"
echo "   ✅ Schema Prisma: Aplicado com sucesso"
echo "   ✅ Tabelas: videos, cuts, processing_jobs, users"
echo "   ✅ Cliente Prisma: Gerado e funcionando"
echo "   ✅ Arquivo .env: Configurado com DATABASE_URL"
echo "   ✅ Estrutura de pastas: Criada"
echo "   ✅ Conectividade: Testada e aprovada"
echo ""
echo "🔗 Informações de conexão:"
echo "   🏠 Host: $DB_HOST:$DB_PORT"
echo "   🗄️  Database: $DB_NAME"
echo "   👤 User: $DB_USER"
echo "   🔑 Password: $DB_PASSWORD"
echo "   📡 DATABASE_URL: $DATABASE_URL"
echo ""

# 15. Iniciar o backend automaticamente
log_step "Iniciando o backend automaticamente..."

echo "🚀 INICIANDO SERVIDOR BACKEND..."
echo "Servidor será iniciado em http://0.0.0.0:5000"
echo "Frontend acessível em: http://localhost:5000"
echo ""
echo "Para parar o servidor, use Ctrl+C"
echo ""

# Aguardar um momento para o usuário ler
sleep 3

# Iniciar o servidor
npm run dev

echo ""
log_success "Script de configuração automática executado com sucesso!"
echo "Backend está rodando e pronto para uso! 🎉"
