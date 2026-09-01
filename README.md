# Curso AI Assistant 📚🤖

Um aplicativo mobile inteligente que gerencia cursos, instruções e quizzes usando IA com Claude.

## 🎯 Principais Funcionalidades

✅ **Gerenciamento de Projetos** - Organize seus cursos em projetos separados
✅ **Detecção Automática** - Identifica automaticamente instruções e quizzes
✅ **Câmera Contínua** - Monitora a tela continuamente e extrai conteúdo
✅ **Respostas Automáticas** - Claude responde quizzes baseado nas instruções
✅ **Offline-First** - Funciona offline com sincronização de dados
✅ **PWA** - Funciona como app nativo em iOS e Android

## 🚀 Começar

### Pré-requisitos
- Node.js 16+ instalado
- Uma chave da API Claude (obtenha em https://console.anthropic.com)

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd AppUtil

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Construir para Produção

```bash
npm run build
npm run preview
```

## 📱 Usar no Celular

### Via Web (Recomendado)
1. Deploy o app em um servidor (Vercel, Netlify, etc.)
2. Acesse via navegador do celular
3. Clique "Instalar App" ou adicione à tela inicial

### Via Android
- Abra em Chrome e selecione "Instalar"

### Via iOS
- Abra em Safari
- Toque em Compartilhar
- Selecione "Adicionar à Tela Inicial"

## ⚙️ Configuração

### 1. Configure a Chave da API Claude

1. Vá para a aba **Configurações**
2. Cole sua chave da API Claude
3. Clique em "Salvar Chave"

### 2. Ative o Monitoramento de Câmera

1. Na aba **Configurações**
2. Ative "Monitoramento de Câmera"
3. Permita acesso à câmera quando solicitado

## 💡 Como Usar

### Criar um Projeto
1. Na aba **Projetos**, clique em "Criar"
2. Digite o nome do projeto
3. O projeto está pronto para usar

### Adicionar Instruções

**Opção 1: Texto Manual**
- Aba "Instruções" → "Novo"
- Cole o conteúdo do curso
- Clique "Adicionar"

**Opção 2: Câmera**
- Aba "Instruções" → "Câmera"
- Fotografe a tela ou documento
- Claude extrai o texto automaticamente

**Opção 3: Arquivo**
- Aba "Instruções" → "Arquivo"
- Selecione um arquivo .txt, .pdf, etc.

### Monitoramento Contínuo ⭐

Quando o monitoramento de câmera está ativo:
1. A câmera fica continuamente monitorando
2. Detecta automaticamente quizzes e instruções
3. Adiciona ao projeto sem necessidade de cliques
4. Notifica quando novo conteúdo é detectado

### Responder Quizzes com IA

1. Na aba **Quizzes**, encontre um quiz não respondido
2. Clique no quiz para expandir
3. Clique "Responder com IA"
4. Claude analisa as instruções e responde automaticamente

## 🔐 Segurança

- ✅ Sua chave da API é salva **localmente** no dispositivo
- ✅ Nunca é enviada para terceiros
- ✅ Os dados são armazenados usando IndexedDB
- ✅ Funciona offline sem perder dados

## 📊 Tecnologia

- **Frontend**: React + Tailwind CSS
- **Estado**: Zustand
- **IA**: Claude API (Anthropic)
- **Storage**: IndexedDB + LocalStorage
- **PWA**: Service Worker + Manifest

## 🎮 Estrutura do Projeto

```
AppUtil/
├── public/
│   ├── manifest.json       # Configuração PWA
│   └── sw.js              # Service Worker
├── src/
│   ├── components/         # Componentes React
│   │   ├── ProjectsTab.jsx
│   │   ├── DocumentsTab.jsx
│   │   ├── QuizzesTab.jsx
│   │   ├── SettingsTab.jsx
│   │   └── CameraMonitor.jsx
│   ├── services/          # Serviços
│   │   ├── claude.js      # Integração Claude API
│   │   └── storage.js     # IndexedDB Storage
│   ├── App.jsx
│   ├── store.js           # Zustand Store
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🐛 Troubleshooting

### Câmera não funciona
- Verifique permissões do navegador
- Tente habilitar em Configurações > Privacidade
- Use HTTPS (alguns navegadores exigem)

### Claude API retorna erro
- Verifique se a chave está correta
- Confira se tem créditos disponíveis
- Teste em https://console.anthropic.com

### Dados não sincronizam
- Verifique conexão com internet
- Limpe o cache do navegador
- Tente atualizar a página

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## 📞 Suporte

Para problemas, abra uma issue no repositório ou entre em contato.

---

Desenvolvido com ❤️ usando Claude, React e TypeScript
