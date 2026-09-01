# 🚀 Guia de Deployment - Curso AI Assistant

## 1. Deploy para Produção Local

### Build
```bash
npm run build
npm run preview
```

---

## 2. Deploy para Vercel (Recomendado) ⭐

### Pré-requisitos
- Conta no Vercel (grátis)
- Repositório no GitHub

### Passos

1. **Push o repositório para GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-user/AppUtil.git
git push -u origin main
```

2. **Ir para Vercel**
   - Acesse https://vercel.com
   - Clique "New Project"
   - Conecte seu GitHub
   - Selecione o repositório

3. **Configurar**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Clique "Deploy"

### URL Resultante
```
https://seu-projeto.vercel.app
```

---

## 3. Deploy para Netlify

### Passos

1. **Conectar GitHub**
   - Acesse https://netlify.com
   - Clique "New site from Git"
   - Conecte GitHub

2. **Configurar Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy**
   - Clique "Deploy site"

---

## 4. Deploy para GitHub Pages

1. **Configurar vite.config.js**
```javascript
export default {
  base: '/AppUtil/',
  // ... resto da config
}
```

2. **Build**
```bash
npm run build
```

3. **Deploy com gh-pages**
```bash
npm install --save-dev gh-pages
```

4. **Adicionar ao package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

5. **Deploy**
```bash
npm run deploy
```

---

## 5. Deploy em Servidor Próprio (Node.js)

### Opção A: Nginx

1. **Build**
```bash
npm run build
```

2. **Copiar arquivos**
```bash
cp -r dist/* /var/www/html/
```

3. **Configurar Nginx**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Opção B: Apache

1. **Build e copiar**
```bash
npm run build
cp -r dist/* /var/www/html/
```

2. **Criar .htaccess**
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 6. Configurações de Produção

### Variáveis de Ambiente (.env)
```env
# Se você quiser armazenar a API key na nuvem (não recomendado)
VITE_CLAUDE_API_KEY=sk-ant-xxxxx
```

### HTTPS (Muito Importante!)
- Sempre use HTTPS em produção
- Obtenha certificado SSL grátis com Let's Encrypt
- A câmera requer HTTPS (exceto localhost)

---

## 7. Otimizações para Mobile

### Manifest.json
- ✅ Já está configurado
- ✅ PWA pronta para instalar

### Performance
```bash
# Analisar bundle
npm run build -- --analyze
```

### Compressão
- Vercel/Netlify fazem automaticamente
- Para servidor próprio, use gzip

---

## 8. Monitoramento

### Ferramentas Recomendadas
- **Vercel Analytics** - Automático
- **Sentry** - Para erro tracking
- **Google Analytics** - Para usar que acessa

---

## 9. Backup de Dados

Os dados são armazenados localmente no IndexedDB do usuário.

Para backup automático na nuvem:

```javascript
// Adicionar depois se necessário
async function backupToCloud() {
  const projects = await storage.getProjects()
  await fetch('/api/backup', {
    method: 'POST',
    body: JSON.stringify(projects)
  })
}
```

---

## 10. Checklist de Deploy

- [ ] Build funciona sem erros
- [ ] Teste no mobile (Android/iOS)
- [ ] Teste câmera e permissões
- [ ] Teste offline mode
- [ ] SSL/HTTPS ativado
- [ ] Service Worker registrado
- [ ] Manifest.json correto
- [ ] Imagens otimizadas
- [ ] Cache headers configurados
- [ ] Analytics ativado (opcional)

---

## 🎯 Recomendação

Para começar rápido e gratuito: **Vercel** ✅

```bash
# Setup rápido
npm install -g vercel
vercel
```

---

Pronto para produção! 🚀
