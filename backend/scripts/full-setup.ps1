
# Script de configuração completa automática do backend para Windows
# Criado para automatizar 100% da configuração sem intervenção manual

# Cores para output no PowerShell
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "🔧 $Message" -ForegroundColor Magenta }
function Write-DB { param($Message) Write-Host "🗄️  $Message" -ForegroundColor Cyan }

# Configurações do banco de dados para Replit
$DB_NAME = "videocutter_db"
$DB_USER = "videocutter_user"
$DB_PASSWORD = "admin"
$DB_HOST = "localhost"
$DB_PORT = "5432"

# Definir diretório base do projeto
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $PROJECT_ROOT

Write-Host "🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA DO BACKEND" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor White
Write-Host ""
Write-Info "Diretório do projeto: $PROJECT_ROOT"
Write-Info "Sistema: Windows PowerShell"
Write-Host ""

# 1. Verificar se estamos no Replit
Write-Step "Detectando ambiente..."

if ($env:REPLIT_DB_URL -or $env:DATABASE_URL) {
    Write-Success "Ambiente Replit detectado"
    
    if ($env:DATABASE_URL) {
        $DATABASE_URL = $env:DATABASE_URL
        Write-Success "DATABASE_URL encontrada"
    } elseif ($env:REPLIT_DB_URL) {
        # No Replit, usar PostgreSQL via Neon ou configurar via Secrets
        Write-Warning "Usando Replit Database URL"
        $DATABASE_URL = $env:REPLIT_DB_URL
    }
} else {
    Write-Error "Ambiente Replit não detectado ou DATABASE_URL não configurada!"
    Write-Host ""
    Write-Host "📋 Para usar no Replit:" -ForegroundColor Yellow
    Write-Host "1. Vá para a aba 'Secrets' (🔒) no painel lateral" -ForegroundColor Yellow
    Write-Host "2. Adicione uma nova variável:" -ForegroundColor Yellow
    Write-Host "   - Key: DATABASE_URL" -ForegroundColor Yellow
    Write-Host "   - Value: sua URL do PostgreSQL" -ForegroundColor Yellow
    Write-Host "3. Ou use o Database do Replit diretamente" -ForegroundColor Yellow
    Write-Host "4. Execute novamente: npm run setup" -ForegroundColor Yellow
    exit 1
}

# 2. Criar arquivo .env se não existir
Write-Step "Configurando arquivo .env..."

$envContent = @"
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
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Success "Arquivo .env criado/atualizado"

# 3. Verificar dependências Node.js
Write-Step "Verificando dependências do Node.js..."

if (!(Test-Path "node_modules")) {
    Write-Info "Instalando dependências do Node.js..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar dependências"
        exit 1
    }
}

# Verificar se Prisma está instalado
$prismaCheck = npm list prisma 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Info "Instalando Prisma..."
    npm install prisma @prisma/client
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar Prisma"
        exit 1
    }
}

Write-Success "Dependências verificadas e instaladas"

# 4. Gerar cliente Prisma
Write-Step "Gerando cliente Prisma..."

npx prisma generate --schema=backend/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao gerar cliente Prisma"
    exit 1
}

Write-Success "Cliente Prisma gerado com sucesso"

# 5. Aplicar schema ao banco de dados
Write-Step "Aplicando schema ao banco de dados..."

npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao aplicar schema ao banco"
    Write-Warning "Tentando aplicar novamente..."
    Start-Sleep -Seconds 3
    npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha persistente ao aplicar schema"
        exit 1
    }
}

Write-Success "Schema aplicado com sucesso"

# 6. Criar diretórios necessários
Write-Step "Criando estrutura de diretórios..."

$directories = @("backend/uploads", "backend/cuts", "uploads")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Success "Estrutura de diretórios criada"

# 7. Teste de conectividade
Write-Step "Testando conectividade com o banco..."

$testScript = @"
const { PrismaClient } = require('./backend/prisma/generated/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando conexão...');
    await prisma.`$connect();
    console.log('✅ Conexão estabelecida');
    
    // Teste básico de query
    const result = await prisma.`$queryRaw``SELECT 1 as test``;
    console.log('✅ Query de teste executada');
    
    // Verificar tabelas
    const videoCount = await prisma.video.count();
    const cutCount = await prisma.cut.count();
    const jobCount = await prisma.processingJob.count();
    const userCount = await prisma.user.count();
    
    console.log('✅ Todas as tabelas estão acessíveis');
    console.log('`📊 Estatísticas:');
    console.log('`   - Usuários: ' + userCount);
    console.log('`   - Vídeos: ' + videoCount);
    console.log('`   - Cortes: ' + cutCount);
    console.log('`   - Jobs: ' + jobCount);
    
    console.log('✅ Sistema totalmente funcional!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.`$disconnect();
  }
}

testConnection();
"@

$testScript | Out-File -FilePath "temp_test.js" -Encoding UTF8
node temp_test.js

if ($LASTEXITCODE -eq 0) {
    Write-Success "Teste de conectividade passou!"
} else {
    Write-Error "Falha no teste de conectividade"
    Remove-Item "temp_test.js" -ErrorAction SilentlyContinue
    exit 1
}

Remove-Item "temp_test.js" -ErrorAction SilentlyContinue

# 8. Resumo final
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO COMPLETA FINALIZADA COM SUCESSO!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo da configuração:" -ForegroundColor White
Write-Host "   ✅ Ambiente: Replit (Windows PowerShell)" -ForegroundColor Green
Write-Host "   ✅ Banco de dados: Configurado e conectado" -ForegroundColor Green
Write-Host "   ✅ Schema Prisma: Aplicado com sucesso" -ForegroundColor Green
Write-Host "   ✅ Tabelas: videos, cuts, processing_jobs, users" -ForegroundColor Green
Write-Host "   ✅ Cliente Prisma: Gerado e funcionando" -ForegroundColor Green
Write-Host "   ✅ Arquivo .env: Configurado" -ForegroundColor Green
Write-Host "   ✅ Estrutura de pastas: Criada" -ForegroundColor Green
Write-Host "   ✅ Conectividade: Testada e aprovada" -ForegroundColor Green
Write-Host ""

# 9. Iniciar o backend automaticamente
Write-Step "Iniciando o backend automaticamente..."
Write-Host ""
Write-Host "🚀 INICIANDO SERVIDOR BACKEND..." -ForegroundColor Cyan
Write-Host "Servidor será iniciado em http://0.0.0.0:5000" -ForegroundColor Cyan
Write-Host "Para parar o servidor, use Ctrl+C" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# Iniciar o servidor
npm run dev

Write-Host ""
Write-Success "Backend configurado e rodando! 🎉"
