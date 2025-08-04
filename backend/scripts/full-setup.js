
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no console
const colors = {
  info: '\x1b[34m',
  success: '\x1b[32m',
  warning: '\x1b[33m',
  error: '\x1b[31m',
  step: '\x1b[35m',
  db: '\x1b[36m',
  reset: '\x1b[0m'
};

function writeInfo(message) {
  console.log(`${colors.info}ℹ️  ${message}${colors.reset}`);
}

function writeSuccess(message) {
  console.log(`${colors.success}✅ ${message}${colors.reset}`);
}

function writeWarning(message) {
  console.log(`${colors.warning}⚠️  ${message}${colors.reset}`);
}

function writeError(message) {
  console.log(`${colors.error}❌ ${message}${colors.reset}`);
}

function writeStep(message) {
  console.log(`${colors.step}🔧 ${message}${colors.reset}`);
}

function writeDB(message) {
  console.log(`${colors.db}🗄️  ${message}${colors.reset}`);
}

// Configurações do banco de dados
const DB_NAME = "videocutter_db";
const DB_USER = "videocutter_user";
const DB_PASSWORD = "admin";
const DB_HOST = "localhost";
const DB_PORT = "5432";

// Definir diretório base do projeto
const PROJECT_ROOT = path.resolve(__dirname, '../../');
process.chdir(PROJECT_ROOT);

console.log('\x1b[37m🚀 CONFIGURAÇÃO AUTOMÁTICA COMPLETA DO BACKEND\x1b[0m');
console.log('\x1b[37m==============================================\x1b[0m');
console.log('');
writeInfo(`Diretório do projeto: ${PROJECT_ROOT}`);
writeInfo('Sistema: Node.js');
console.log('');

function runCommand(command, description, ignoreError = false) {
  try {
    writeInfo(`Executando: ${description}`);
    execSync(command, { stdio: 'pipe' });
    writeSuccess(`${description} - Concluído`);
    return true;
  } catch (error) {
    if (ignoreError) {
      writeWarning(`${description} - Aviso: ${error.message}`);
      return false;
    } else {
      writeError(`${description} - Erro: ${error.message}`);
      throw error;
    }
  }
}

async function main() {
  try {
    // 1. Detectar ambiente (Replit ou Local)
    writeStep('Detectando ambiente...');

    let DATABASE_URL;
    let isReplitEnv = !!(process.env.REPLIT_DB_URL || process.env.REPL_ID || process.env.REPL_SLUG);
    
    if (isReplitEnv) {
      writeSuccess('Ambiente Replit detectado');
      
      if (process.env.DATABASE_URL) {
        DATABASE_URL = process.env.DATABASE_URL;
        writeSuccess('DATABASE_URL encontrada');
      } else if (process.env.REPLIT_DB_URL) {
        writeWarning('Usando Replit Database URL');
        DATABASE_URL = process.env.REPLIT_DB_URL;
      } else {
        writeError('DATABASE_URL não configurada no Replit!');
        console.log('');
        console.log('\x1b[33m📋 Para configurar no Replit:\x1b[0m');
        console.log('\x1b[33m1. Vá para a aba "Secrets" (🔒) no painel lateral\x1b[0m');
        console.log('\x1b[33m2. Adicione uma nova variável:\x1b[0m');
        console.log('\x1b[33m   - Key: DATABASE_URL\x1b[0m');
        console.log('\x1b[33m   - Value: sua URL do PostgreSQL\x1b[0m');
        console.log('\x1b[33m3. Ou use o Database do Replit diretamente\x1b[0m');
        process.exit(1);
      }
    } else {
      writeSuccess('Ambiente local detectado');
      
      // Configurar PostgreSQL local
      writeDB('Configurando PostgreSQL local...');
      
      // Primeiro, tentar conectar como postgres (usuário padrão)
      try {
        // Testar se PostgreSQL está rodando
        execSync('psql --version', { stdio: 'pipe' });
        writeSuccess('PostgreSQL instalado');
      } catch {
        writeError('PostgreSQL não está instalado ou não está no PATH');
        writeInfo('Instale PostgreSQL e tente novamente');
        process.exit(1);
      }

      // Configurar banco e usuário usando o usuário postgres
      writeDB('Limpando e recriando banco de dados e usuário...');
      
      // 1. Primeiro, terminar todas as conexões ativas no banco
      writeDB('Terminando conexões ativas...');
      try {
        execSync(`psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"`, { 
          stdio: 'pipe',
          env: { ...process.env, PGPASSWORD: 'admin' }
        });
      } catch (error) {
        writeWarning('Nenhuma conexão ativa encontrada para terminar');
      }

      // 2. Dropar banco e usuário se existirem
      writeDB('Removendo banco e usuário existentes...');
      const cleanupCommands = [
        `psql -U postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"`,
        `psql -U postgres -c "DROP USER IF EXISTS ${DB_USER};"`
      ];

      for (const command of cleanupCommands) {
        try {
          execSync(command, { 
            stdio: 'pipe',
            env: { ...process.env, PGPASSWORD: 'admin' }
          });
          writeSuccess(`Comando executado: ${command}`);
        } catch (error) {
          writeWarning(`Falha esperada: ${command} - ${error.message}`);
        }
      }

      // 3. Criar banco e usuário do zero
      writeDB('Criando novo banco e usuário...');
      const setupCommands = [
        // Criar banco
        `psql -U postgres -c "CREATE DATABASE ${DB_NAME};"`,
        // Criar usuário
        `psql -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"`,
        // Conceder privilégios
        `psql -U postgres -c "ALTER USER ${DB_USER} CREATEDB;"`,
        `psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"`,
        // Conectar ao banco e conceder privilégios no schema
        `psql -U postgres -d ${DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"`,
        `psql -U postgres -d ${DB_NAME} -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};"`,
        `psql -U postgres -d ${DB_NAME} -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};"`,
        `psql -U postgres -d ${DB_NAME} -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};"`,
        `psql -U postgres -d ${DB_NAME} -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};"`
      ];

      for (const command of setupCommands) {
        try {
          execSync(command, { 
            stdio: 'pipe',
            env: { ...process.env, PGPASSWORD: 'admin' }
          });
          writeSuccess(`Executado: ${command.split('-c')[1]?.replace(/"/g, '').trim() || command}`);
        } catch (error) {
          writeError(`Falha ao executar: ${command}`);
          writeError(`Erro: ${error.message}`);
          process.exit(1);
        }
      }

      // Testar conexão com o novo usuário
      writeDB('Testando conexão com novo usuário...');
      try {
        execSync(`psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();" -h ${DB_HOST}`, { 
          stdio: 'pipe',
          env: { ...process.env, PGPASSWORD: DB_PASSWORD }
        });
        writeSuccess('Conexão com novo usuário testada com sucesso');
      } catch (error) {
        writeError(`Falha ao conectar com ${DB_USER}: ${error.message}`);
        writeError('Verificando se o PostgreSQL está rodando e se as credenciais estão corretas...');
        process.exit(1);
      }

      DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public`;
      writeInfo(`DATABASE_URL configurada: ${DATABASE_URL}`);
    }

    // 2. Criar arquivo .env
    writeStep('Configurando arquivo .env...');

    const envContent = `# Database Configuration
DATABASE_URL="${DATABASE_URL}"

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
`;

    fs.writeFileSync('.env', envContent, 'utf8');
    writeSuccess('Arquivo .env criado/atualizado');

    // 3. Verificar dependências Node.js
    writeStep('Verificando dependências do Node.js...');

    if (!fs.existsSync('node_modules')) {
      writeInfo('Instalando dependências do Node.js...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Verificar se Prisma está instalado
    try {
      execSync('npm list prisma', { stdio: 'pipe' });
    } catch {
      writeInfo('Instalando Prisma...');
      execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
    }

    writeSuccess('Dependências verificadas e instaladas');

    // 4. Gerar cliente Prisma
    writeStep('Gerando cliente Prisma...');
    execSync('npx prisma generate --schema=backend/prisma/schema.prisma', { stdio: 'inherit' });
    writeSuccess('Cliente Prisma gerado com sucesso');

    // 5. Aplicar schema ao banco de dados
    writeStep('Aplicando schema ao banco de dados...');
    try {
      execSync('npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL }
      });
    } catch (error) {
      writeError('Falha ao aplicar schema ao banco');
      writeWarning('Tentando aplicar novamente...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        execSync('npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL }
        });
      } catch {
        writeError('Falha persistente ao aplicar schema');
        process.exit(1);
      }
    }
    writeSuccess('Schema aplicado com sucesso');

    // 6. Limpar e recriar diretórios necessários
    writeStep('Limpando e recriando estrutura de diretórios...');
    const directories = ['backend/uploads', 'backend/cuts', 'uploads'];
    
    directories.forEach(dir => {
      // Remover diretório se existir
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          writeSuccess(`Diretório ${dir} limpo`);
        } catch (error) {
          writeWarning(`Não foi possível limpar ${dir}: ${error.message}`);
        }
      }
      
      // Recriar diretório
      fs.mkdirSync(dir, { recursive: true });
      
      // Criar arquivo .gitkeep se for um diretório do backend
      if (dir.startsWith('backend/')) {
        fs.writeFileSync(path.join(dir, '.gitkeep'), '', 'utf8');
      }
    });
    writeSuccess('Estrutura de diretórios limpa e recriada');

    // 7. Teste de conectividade
    writeStep('Testando conectividade com o banco...');

    const testScript = `
import { PrismaClient } from './backend/prisma/generated/client/index.js';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');
    
    // Teste básico de query
    const result = await prisma.$queryRaw\`SELECT 1 as test\`;
    console.log('✅ Query de teste executada');
    
    // Verificar tabelas
    const videoCount = await prisma.video.count();
    const cutCount = await prisma.cut.count();
    const jobCount = await prisma.processingJob.count();
    const userCount = await prisma.user.count();
    
    console.log('✅ Todas as tabelas estão acessíveis');
    console.log('📊 Estatísticas:');
    console.log('   - Usuários: ' + userCount);
    console.log('   - Vídeos: ' + videoCount);
    console.log('   - Cortes: ' + cutCount);
    console.log('   - Jobs: ' + jobCount);
    
    console.log('✅ Sistema totalmente funcional!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
`;

    fs.writeFileSync('temp_test.mjs', testScript);
    execSync('node temp_test.mjs', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL }
    });
    fs.unlinkSync('temp_test.mjs');
    writeSuccess('Teste de conectividade passou!');

    // 8. Resumo final
    console.log('');
    console.log('\x1b[32m🎉 CONFIGURAÇÃO COMPLETA FINALIZADA COM SUCESSO!\x1b[0m');
    console.log('\x1b[32m=================================================\x1b[0m');
    console.log('');
    console.log('\x1b[37m📋 Resumo da configuração:\x1b[0m');
    console.log('\x1b[32m   ✅ Ambiente: Local (Node.js)\x1b[0m');
    console.log('\x1b[32m   ✅ Banco de dados: Configurado e conectado\x1b[0m');
    console.log('\x1b[32m   ✅ Schema Prisma: Aplicado com sucesso\x1b[0m');
    console.log('\x1b[32m   ✅ Tabelas: videos, cuts, processing_jobs, users\x1b[0m');
    console.log('\x1b[32m   ✅ Cliente Prisma: Gerado e funcionando\x1b[0m');
    console.log('\x1b[32m   ✅ Arquivo .env: Configurado\x1b[0m');
    console.log('\x1b[32m   ✅ Estrutura de pastas: Criada\x1b[0m');
    console.log('\x1b[32m   ✅ Conectividade: Testada e aprovada\x1b[0m');
    console.log('');
    console.log('\x1b[37m🗄️  Credenciais do banco:\x1b[0m');
    console.log(`\x1b[32m   ✅ Banco: ${DB_NAME}\x1b[0m`);
    console.log(`\x1b[32m   ✅ Usuário: ${DB_USER}\x1b[0m`);
    console.log(`\x1b[32m   ✅ Senha: ${DB_PASSWORD}\x1b[0m`);
    console.log(`\x1b[32m   ✅ Host: ${DB_HOST}:${DB_PORT}\x1b[0m`);
    console.log('');

    writeSuccess('Backend configurado com sucesso! 🎉');
    console.log('');
    console.log('\x1b[36mPara iniciar o servidor, execute: npm run dev\x1b[0m');

  } catch (error) {
    writeError(`Erro durante a configuração: ${error.message}`);
    process.exit(1);
  }
}

main();
