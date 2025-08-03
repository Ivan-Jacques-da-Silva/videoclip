
# 🔧 Configuração das APIs de Redes Sociais

Este guia mostra como configurar as APIs das principais redes sociais para permitir publicação automática de conteúdo.

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
DATABASE_URL="file:./backend/database.db"
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
