# 🚀 Como Executar o Picopro no VS Code

Este guia te ajudará a executar o projeto Picopro no seu VS Code local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **VS Code** - [Download aqui](https://code.visualstudio.com/)
- **Git** - [Download aqui](https://git-scm.com/)
- **pnpm** (recomendado) ou npm

### Instalando o pnpm
```bash
npm install -g pnpm
```

## 📁 Obtendo o Projeto

### Opção 1: Download Direto
1. Baixe todos os arquivos do projeto
2. Extraia em uma pasta de sua escolha
3. Abra a pasta no VS Code

### Opção 2: Via Git (se disponível)
```bash
git clone <repository-url>
cd picopro
code .
```

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

Abra o terminal no VS Code (`Ctrl+`` ` ou `View > Terminal`) e execute:

```bash
pnpm install
```

Ou se preferir usar npm:
```bash
npm install
```

### 2. Configurar Supabase (Opcional)

Para funcionalidades completas, você precisará configurar o Supabase:

1. **Crie uma conta gratuita** em [supabase.com](https://supabase.com)
2. **Crie um novo projeto**
3. **Configure o banco de dados**:
   - Vá para SQL Editor
   - Execute o conteúdo do arquivo `supabase_schema.sql`
4. **Obtenha as credenciais**:
   - Vá para Settings > API
   - Copie a URL e a chave anônima

5. **Crie o arquivo de ambiente**:
```bash
# Crie o arquivo .env.local na raiz do projeto
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

> **Nota**: O projeto funcionará em modo demonstração mesmo sem o Supabase configurado!

## 🏃‍♂️ Executando o Projeto

### 1. Iniciar o Servidor de Desenvolvimento

No terminal do VS Code, execute:

```bash
pnpm dev
```

Ou com npm:
```bash
npm run dev
```

### 2. Acessar a Aplicação

O projeto estará disponível em:
- **URL Local**: http://localhost:5173
- **URL da Rede**: http://[seu-ip]:5173 (para testar em outros dispositivos)

### 3. Credenciais de Teste

Use estas credenciais para testar:

**Empresa:**
- Email: `empresa@demo.com`
- Senha: `demo123`

**Profissional:**
- Email: `profissional@demo.com`
- Senha: `demo123`

## 🔧 Extensões Recomendadas do VS Code

Para uma melhor experiência de desenvolvimento, instale estas extensões:

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **Auto Rename Tag**
4. **Bracket Pair Colorizer**
5. **GitLens**
6. **Prettier - Code formatter**
7. **Thunder Client** (para testar APIs)

### Instalação Rápida das Extensões

Pressione `Ctrl+Shift+P` e digite "Extensions: Install Extensions", então procure por cada uma.

## 📂 Estrutura de Pastas no VS Code

```
picopro/
├── 📁 public/              # Arquivos estáticos
├── 📁 src/
│   ├── 📁 components/      # Componentes React
│   │   ├── 📁 ui/         # Componentes de interface
│   │   ├── 📄 ConvocationCard.jsx
│   │   ├── 📄 CreateJobModal.jsx
│   │   ├── 📄 MapComponent.jsx
│   │   └── ...
│   ├── 📁 pages/          # Páginas da aplicação
│   ├── 📁 services/       # Serviços e APIs
│   ├── 📁 hooks/          # Hooks customizados
│   ├── 📁 utils/          # Utilitários
│   └── 📄 App.jsx         # Componente principal
├── 📄 package.json        # Dependências
├── 📄 README.md           # Documentação
└── 📄 supabase_schema.sql # Schema do banco
```

## 🎯 Funcionalidades para Testar

### Como Empresa:
1. **Login** com credenciais de empresa
2. **Criar nova vaga** no dashboard
3. **Ver matching** de profissionais
4. **Acompanhar convocações** enviadas

### Como Profissional:
1. **Login** com credenciais de profissional
2. **Receber convocações** (simuladas)
3. **Aceitar/rejeitar** oportunidades
4. **Simular check-in/out** com biometria
5. **Ver resumo de pagamentos**

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
pnpm install
```

### Erro: "Port 5173 is already in use"
```bash
# Use uma porta diferente
pnpm dev --port 3000
```

### Erro: Componentes não carregam
```bash
# Verifique se todas as dependências estão instaladas
pnpm install @radix-ui/react-toast class-variance-authority
```

### Problemas com Geolocalização
- Certifique-se de que o navegador tem permissão para acessar localização
- Use HTTPS em produção (geolocalização não funciona em HTTP)

## 📱 Testando Responsividade

1. **Abra as DevTools** (`F12`)
2. **Clique no ícone de dispositivo** (📱)
3. **Teste diferentes tamanhos**:
   - Mobile: 375x667 (iPhone)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1920x1080

## 🚀 Build para Produção

Quando estiver pronto para fazer deploy:

```bash
# Gerar build de produção
pnpm build

# Testar build localmente
pnpm preview
```

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor de desenvolvimento

# Build
pnpm build        # Gera build de produção
pnpm preview      # Testa build localmente

# Linting (se configurado)
pnpm lint         # Verifica código
pnpm lint:fix     # Corrige problemas automaticamente
```

## 💡 Dicas de Desenvolvimento

### 1. Hot Reload
O Vite oferece hot reload automático. Suas mudanças aparecerão instantaneamente no navegador.

### 2. Debugging
- Use `console.log()` para debug básico
- Use as DevTools do navegador para debugging avançado
- Instale React Developer Tools para inspecionar componentes

### 3. Organização de Código
- Mantenha componentes pequenos e focados
- Use hooks customizados para lógica reutilizável
- Organize imports de forma consistente

### 4. Performance
- Use React.memo() para componentes que não mudam frequentemente
- Implemente lazy loading para rotas
- Otimize imagens e assets

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique o console** do navegador para erros
2. **Consulte a documentação** no README.md
3. **Verifique as issues** conhecidas
4. **Entre em contato** com a equipe de desenvolvimento

## 🎉 Pronto!

Agora você tem o Picopro rodando no seu VS Code! Explore as funcionalidades, teste diferentes cenários e veja como a "uberização legal do trabalho" funciona na prática.

**Boa codificação!** 🚀
