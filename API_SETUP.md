
# Configuração das APIs de Redes Sociais

Este documento explica como configurar as APIs das redes sociais para fazer o sistema funcionar completamente.

## 📋 Pré-requisitos

1. Contas de desenvolvedor nas plataformas:
   - YouTube (Google Cloud Console)
   - Facebook/Instagram (Meta Developers)
   - TikTok (TikTok Developers)

## 🔧 Configuração do Ambiente

1. **Copie o arquivo de exemplo de variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env` com suas credenciais**

## 🎥 YouTube API

### Passos para configurar:

1. **Acesse o Google Cloud Console:**
   - Vá para https://console.cloud.google.com/
   - Crie um novo projeto ou selecione um existente

2. **Habilite a YouTube Data API v3:**
   - No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
   - Procure por "YouTube Data API v3"
   - Clique em "Ativar"

3. **Crie credenciais OAuth 2.0:**
   - Vá em "APIs e Serviços" > "Credenciais"
   - Clique em "Criar credenciais" > "ID do cliente OAuth"
   - Escolha "Aplicativo da Web"
   - Adicione URLs de redirecionamento autorizadas:
     - `http://localhost:5000/auth/youtube/callback`
     - `https://seu-dominio.replit.app/auth/youtube/callback`

4. **Configure no .env:**
   ```env
   YOUTUBE_CLIENT_ID="seu_client_id_aqui"
   YOUTUBE_CLIENT_SECRET="seu_client_secret_aqui"
   YOUTUBE_API_KEY="sua_api_key_aqui"
   ```

### Escopos necessários:
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube`

## 📸 Instagram API

### Passos para configurar:

1. **Acesse o Meta Developers:**
   - Vá para https://developers.facebook.com/
   - Crie uma nova aplicação

2. **Configure Instagram Basic Display:**
   - No painel da aplicação, adicione o produto "Instagram Basic Display"
   - Configure URLs de redirecionamento:
     - `http://localhost:5000/auth/instagram/callback`
     - `https://seu-dominio.replit.app/auth/instagram/callback`

3. **Para publicação de conteúdo (Instagram Graph API):**
   - Adicione o produto "Instagram Graph API"
   - Solicite permissões para `instagram_content_publish`

4. **Configure no .env:**
   ```env
   INSTAGRAM_APP_ID="seu_app_id_aqui"
   INSTAGRAM_APP_SECRET="seu_app_secret_aqui"
   ```

### Permissões necessárias:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`

## 📘 Facebook API

### Passos para configurar:

1. **Use a mesma aplicação do Instagram:**
   - No Meta Developers, adicione o produto "Facebook Login"

2. **Configure permissões:**
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `publish_video`

3. **Configure URLs de redirecionamento:**
   - `http://localhost:5000/auth/facebook/callback`
   - `https://seu-dominio.replit.app/auth/facebook/callback`

4. **Configure no .env:**
   ```env
   FACEBOOK_APP_ID="seu_app_id_aqui"
   FACEBOOK_APP_SECRET="seu_app_secret_aqui"
   ```

## 🎵 TikTok API

### Passos para configurar:

1. **Acesse TikTok Developers:**
   - Vá para https://developers.tiktok.com/
   - Crie uma nova aplicação

2. **Configure TikTok Login Kit:**
   - Adicione o produto "Login Kit"
   - Configure URLs de redirecionamento:
     - `http://localhost:5000/auth/tiktok/callback`
     - `https://seu-dominio.replit.app/auth/tiktok/callback`

3. **Solicite permissões para Content Posting API:**
   - `video.upload`
   - `video.publish`

4. **Configure no .env:**
   ```env
   TIKTOK_CLIENT_KEY="seu_client_key_aqui"
   TIKTOK_CLIENT_SECRET="seu_client_secret_aqui"
   ```

### Permissões necessárias:
- `user.info.basic`
- `video.upload`
- `video.publish`

## 🗄️ Banco de Dados

### Para PostgreSQL (Neon):
1. **Crie uma conta no Neon:**
   - Vá para https://neon.tech/
   - Crie um novo projeto

2. **Configure no .env:**
   ```env
   DATABASE_URL="postgresql://usuario:senha@host/database?sslmode=require"
   ```

### Para SQLite (desenvolvimento local):
```env
DATABASE_URL="file:./database.db"
```

## 🚀 Instalação de Dependências

Instale as dependências necessárias para as APIs:

```bash
npm install dotenv googleapis facebook-sdk tiktok-api
```

## ⚙️ Configuração da Aplicação

1. **Configure variáveis de ambiente:**
   ```env
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET="gere_uma_chave_secreta_aqui"
   ```

2. **Execute as migrações do banco:**
   ```bash
   npm run db:push
   ```

3. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```

## 🔐 Segurança

### Importantes:
- ✅ Nunca commite o arquivo `.env`
- ✅ Use HTTPS em produção
- ✅ Regenere tokens periodicamente
- ✅ Configure CORS adequadamente
- ✅ Use variáveis de ambiente diferentes para produção

### URLs de produção:
Quando deploy for feito, atualize as URLs de callback em todas as plataformas para:
- `https://seu-projeto.replit.app/auth/[plataforma]/callback`

## 📝 Testando as Integrações

1. **Acesse o dashboard:** `http://localhost:5000`
2. **Vá para a seção "Social Media"`
3. **Clique em "Connect" para cada plataforma**
4. **Complete o fluxo de autorização OAuth**

## 🆘 Problemas Comuns

### YouTube:
- **Erro 403:** Verifique se a API está habilitada
- **Invalid redirect_uri:** Confirme URLs no Google Console

### Instagram/Facebook:
- **App not approved:** Apps em desenvolvimento funcionam apenas para administradores
- **Invalid scope:** Verifique permissões solicitadas

### TikTok:
- **Access denied:** TikTok API tem processo de aprovação rigoroso
- **Rate limiting:** Implemente cache para tokens

## 📞 Suporte

Para dúvidas específicas de cada API:
- [YouTube API Docs](https://developers.google.com/youtube/v3)
- [Instagram API Docs](https://developers.facebook.com/docs/instagram-api)
- [Facebook API Docs](https://developers.facebook.com/docs/graph-api)
- [TikTok API Docs](https://developers.tiktok.com/doc)
