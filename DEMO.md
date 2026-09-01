# 🎓 Curso AI Assistant - Demonstração

## ✨ O Que Foi Criado

Um aplicativo mobile inteligente que:
- ✅ Gerencia projetos e cursos
- ✅ Monitora continuamente a câmera para capturar conteúdo
- ✅ Detecta automaticamente instruções e quizzes
- ✅ Responde quizzes usando IA (Claude)
- ✅ Funciona offline com sincronização
- ✅ Trabalha como PWA em iOS e Android

---

## 🚀 Como Usar

### 1. **Instalar e Rodar**

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### 2. **Configurar a Chave Claude** (Importante!)

1. Vá para **Configurações** (aba 4️⃣)
2. Cole sua chave da API Claude (obtenha em https://console.anthropic.com)
3. Clique "Salvar Chave"

### 3. **Criar um Projeto**

1. Na aba **Projetos** (aba 1️⃣)
2. Digite o nome do projeto
3. Clique "Criar"

### 4. **Adicionar Instruções**

Na aba **Instruções** (aba 2️⃣), você tem 3 opções:

#### 📝 Opção 1: Digitar Manualmente
- Clique "Novo"
- Cole/digite o conteúdo da aula
- Clique "Adicionar"

#### 📷 Opção 2: Fotografar com Câmera
- Clique "Câmera"
- Fotografe a tela/documento
- Claude extrai o texto automaticamente
- *Requer API key configurada*

#### 📄 Opção 3: Carregar Arquivo
- Clique "Arquivo"
- Selecione .txt, .pdf, etc.
- Conteúdo é adicionado automaticamente

### 5. **Monitoramento Contínuo** ⭐

Essa é a feature mais inovadora!

1. Clique no botão "📷 Monitorar" no canto inferior direito
2. Permita acesso à câmera
3. A câmera fica **continuamente monitorando**
4. Quando detectar um quiz ou instrução, **adiciona automaticamente**
5. Você recebe notificação quando novo conteúdo é detectado

### 6. **Responder Quizzes com IA**

1. Aba **Quizzes** (aba 3️⃣)
2. Encontre um quiz
3. Clique "Responder com IA"
4. Claude analisa as instruções e responde automaticamente

---

## 📱 Usar no Celular

### Android
1. Abra em Chrome
2. Clique no menu (⋮)
3. Selecione "Instalar app"
4. A app ficará no seu home screen

### iOS
1. Abra em Safari
2. Toque em Compartilhar (↗️)
3. Selecione "Adicionar à Tela Inicial"
4. A app ficará no seu home screen

---

## 🏗️ Arquitetura

### Estrutura
```
Frontend (React)
    ↓
Zustand Store (Estado)
    ↓
IndexedDB (Armazenamento Local)
    ↓
Claude API (Análise & Respostas)
```

### Componentes Principais
- **ProjectsTab** - Gerenciar projetos
- **DocumentsTab** - Adicionar instruções
- **QuizzesTab** - Responder quizzes
- **SettingsTab** - Configurar API key
- **CameraMonitor** - Monitoramento contínuo em background

---

## 🔐 Segurança

✅ Chave da API salva **apenas localmente**
✅ Nunca enviada para terceiros
✅ Dados armazenados no IndexedDB do dispositivo
✅ Funciona offline sem perder dados
✅ Service Worker para cache inteligente

---

## 🎯 Exemplos de Uso

### Cenário 1: Aluno em Aula Online
1. Abre o app e ativa o monitoramento
2. Enquanto assiste a aula, o app automaticamente captura:
   - Slides com instruções
   - Quizzes que aparecem na tela
3. Ao final da aula, tudo está catalogado no app
4. Quizzes são respondidos automaticamente pela IA

### Cenário 2: Estudando com Livros/PDFs
1. Tira foto de um capítulo (opção Câmera)
2. Claude extrai o texto
3. Quando chega um quiz, clica "Responder com IA"
4. Recebe as respostas baseadas no conteúdo

### Cenário 3: Revisão de Cursos
1. Tudo está organizado por projeto
2. Pode revisar instruções antigas
3. Pode refazer quizzes
4. Histórico completo de aprendizado

---

## 📊 Tecnologias Usadas

| Tecnologia | Uso |
|---|---|
| **React** | Interface do usuário |
| **Tailwind CSS** | Estilização responsiva |
| **Zustand** | Gerenciamento de estado |
| **IndexedDB** | Armazenamento offline |
| **Claude API** | IA para análise e respostas |
| **Vite** | Build tool rápido |
| **Service Worker** | PWA e cache |

---

## 🐛 Troubleshooting

### Câmera não funciona
- Verifique permissões do navegador
- Use HTTPS (alguns navegadores exigem)
- Tente outra câmera (frontal/traseira)

### Claude API retorna erro
- Confirme se a chave está correta
- Verifique créditos em console.anthropic.com
- Tente reconectar

### Dados não aparecem
- Recarregue a página (F5)
- Limpe o cache do navegador
- Tente outro navegador

---

## 🎓 Casos de Uso

✅ **Estudantes** - Capturar e organizar conteúdo de aulas
✅ **Professores** - Criar quizzes e aulas interativas
✅ **Autoaprendizado** - Estudar com livros/PDFs
✅ **Revisão** - Revisar conteúdo aprendido
✅ **Prática** - Fazer quizzes automaticamente

---

## 🚀 Próximas Melhorias (Roadmap)

- [ ] Exportar dados em PDF/Excel
- [ ] Compartilhar projetos entre usuários
- [ ] Análise de progresso
- [ ] Lembretes de revisão
- [ ] Integração com Google Drive/OneDrive
- [ ] Suporte a múltiplos idiomas
- [ ] Modo escuro nativo

---

## 💡 Dicas Pro

1. **Monitoramento em Background** - Deixa o app rodando enquanto assiste videoaula
2. **API Key Segura** - Guarde sua chave Claude em segurança
3. **Projetos Organizados** - Crie um projeto por disciplina/curso
4. **Revisão Periódica** - Use os quizzes para revisar periodicamente

---

Desenvolvido com ❤️ usando React, Claude API e Tecnologia de PWA
