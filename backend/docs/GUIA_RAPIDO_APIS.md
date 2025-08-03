
# 🚀 Guia Rápido - Como Obter APIs das Redes Sociais

## 🎬 YouTube API

1. **Acesse:** https://console.cloud.google.com/
2. **Crie um projeto** ou selecione um existente
3. **Ative a API:**
   - Vá em "APIs e Serviços" → "Biblioteca"
   - Procure por "YouTube Data API v3" → Ativar
4. **Crie credenciais:**
   - "APIs e Serviços" → "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"
   - Tipo: Aplicativo da Web
   - URIs de redirecionamento: `http://localhost:5000/auth/youtube/callback`
5. **Copie:**
   - Client ID → `YOUTUBE_CLIENT_ID`
   - Client Secret → `YOUTUBE_CLIENT_SECRET`

---

## 📘 Facebook + Instagram API

1. **Acesse:** https://developers.facebook.com/
2. **Crie um app** → Tipo: "Empresa"
3. **Adicione produtos:**
   - "Facebook Login" → Configurar
   - "Instagram Basic Display" → Configurar
4. **Configure URLs de redirecionamento:**
   - `http://localhost:5000/auth/facebook/callback`
   - `http://localhost:5000/auth/instagram/callback`
5. **Copie do painel:**
   - ID do App → `FACEBOOK_APP_ID` e `INSTAGRAM_APP_ID`
   - Chave Secreta → `FACEBOOK_APP_SECRET` e `INSTAGRAM_APP_SECRET`

---

## 🎵 TikTok API

1. **Acesse:** https://developers.tiktok.com/
2. **Crie um app** → Tipo: "Website"
3. **Configure:**
   - Redirect URI: `http://localhost:5000/auth/tiktok/callback`
   - Solicite permissões: `user.info.basic`, `video.upload`
4. **Copie:**
   - Client Key → `TIKTOK_CLIENT_KEY`
   - Client Secret → `TIKTOK_CLIENT_SECRET`

---

## 🔧 Configure seu .env

Copie o arquivo `.env.example` para `.env` e preencha:

```env
# Database
DATABASE_URL="postgresql://videocuts_user:senha123@localhost:5432/videocuts_db"

# YouTube
YOUTUBE_CLIENT_ID="seu_client_id_aqui"
YOUTUBE_CLIENT_SECRET="seu_client_secret_aqui"

# Facebook
FACEBOOK_APP_ID="seu_app_id_aqui"
FACEBOOK_APP_SECRET="seu_app_secret_aqui"

# Instagram (mesmo do Facebook)
INSTAGRAM_APP_ID="mesmo_do_facebook"
INSTAGRAM_APP_SECRET="mesmo_do_facebook"

# TikTok
TIKTOK_CLIENT_KEY="seu_client_key_aqui"
TIKTOK_CLIENT_SECRET="seu_client_secret_aqui"

# App
PORT=5000
NODE_ENV=development
SESSION_SECRET="gere_uma_string_aleatoria_aqui"
```

---

## ⚡ Dicas Importantes

- **YouTube:** Precisa verificação se for público (processo longo)
- **Facebook/Instagram:** App em desenvolvimento permite 100 usuários
- **TikTok:** Aprovação manual necessária para video.upload
- **Para testes:** Use contas de desenvolvedor próprias

## 🔐 Para Produção

- Configure domínios reais nos redirecionamentos
- Solicite revisão das apps para uso público
- Use HTTPS obrigatoriamente
