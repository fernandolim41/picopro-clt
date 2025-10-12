# Picopro - A Uberização Legal do Trabalho

O Picopro é uma plataforma de tecnologia que promove o match imediato e legal entre empresas com picos de demanda (varejo, alimentação, hotelaria) e profissionais qualificados, utilizando o regime da CLT Intermitente para garantir conformidade legal e agilidade operacional.

## 🚀 Funcionalidades Principais

### 1. Match e Alocação Just-in-Time (A "Uberização")
- **Necessidade de Pico**: Empresas lançam demandas especificando função, duração e localização
- **Match Imediato**: Sistema de IA cruza vagas com qualificação, disponibilidade e proximidade
- **Convocação e Aceite**: Notificações instantâneas com janela de tempo para aceite

### 2. Segurança e Qualificação (O "Pro")
- **Verificação de Credenciais**: Comprovação de certificações obrigatórias
- **Background Check**: Consulta de antecedentes e verificação cadastral
- **Controle de Jornada Legal**: Biometria facial para check-in/out preciso

### 3. Compliance e Pagamento (O "Legal")
- **Geração Automática de Contrato**: Contratos CLT Intermitente com validade jurídica
- **Cálculo e Pagamento Proporcional**: Cálculo automático de salário + proporcionais
- **Integração eSocial**: Registro automático e recolhimento de encargos
- **Liquidação Instantânea**: Pagamento imediato via PIX

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **React Router DOM** - Roteamento
- **React Leaflet** - Mapas interativos

### Backend/Infraestrutura
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Realtime - Notificações em tempo real
  - Edge Functions - Lógica serverless
  - Storage - Armazenamento de arquivos

### APIs e Integrações
- **Nominatim (OpenStreetMap)** - Geocoding
- **Geolocation API** - Localização do usuário
- **Simulação de APIs**:
  - eSocial (compliance trabalhista)
  - PIX (pagamentos)
  - Biometria facial

## 📁 Estrutura do Projeto

```
picopro/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── ConvocationCard.jsx
│   │   ├── CreateJobModal.jsx
│   │   ├── LocationSearch.jsx
│   │   ├── MapComponent.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotificationCenter.jsx
│   │   ├── PaymentSummary.jsx
│   │   └── TimeTracker.jsx
│   ├── contexts/          # Contextos React
│   │   └── AuthContext.jsx
│   ├── hooks/             # Hooks customizados
│   │   ├── useConvocations.js
│   │   ├── useGeolocation.js
│   │   └── useRealtime.js
│   ├── pages/             # Páginas da aplicação
│   │   ├── ConvocationsPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── JobsPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/          # Serviços e APIs
│   │   ├── matching.js
│   │   ├── payments.js
│   │   └── supabase.js
│   ├── utils/             # Utilitários
│   │   ├── geolocation.js
│   │   └── helpers.js
│   ├── App.jsx            # Componente principal
│   └── main.jsx           # Ponto de entrada
├── supabase_schema.sql    # Schema do banco de dados
├── package.json
└── README.md
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários (empresas e profissionais)
2. **companies** - Dados específicos de empresas
3. **professionals** - Dados específicos de profissionais
4. **jobs** - Vagas criadas pelas empresas
5. **convocations** - Convocações enviadas aos profissionais
6. **legal_documents** - Documentos legais gerados

### Relacionamentos
- Um perfil pode ser empresa OU profissional
- Empresas criam múltiplas vagas
- Vagas geram múltiplas convocações
- Convocações geram documentos legais

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd picopro
```

2. **Instale as dependências**:
```bash
pnpm install
```

3. **Configure o Supabase**:
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute o script `supabase_schema.sql` no SQL Editor
   - Configure as variáveis de ambiente:

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Execute o projeto**:
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 👥 Tipos de Usuário

### Empresas
- Criar vagas com localização e requisitos
- Visualizar profissionais encontrados pelo matching
- Acompanhar status das convocações
- Processar pagamentos

### Profissionais
- Receber convocações em tempo real
- Aceitar/rejeitar oportunidades
- Fazer check-in/out com biometria
- Acompanhar ganhos e histórico

## 🔐 Credenciais de Demonstração

### Empresa
- **Email**: empresa@demo.com
- **Senha**: demo123

### Profissional
- **Email**: profissional@demo.com
- **Senha**: demo123

## 🎯 Funcionalidades Implementadas

### ✅ Concluído
- [x] Landing page responsiva
- [x] Sistema de autenticação
- [x] Dashboard para empresas e profissionais
- [x] Criação de vagas com geolocalização
- [x] Sistema de matching por proximidade e habilidades
- [x] Convocações em tempo real
- [x] Controle de jornada com simulação de biometria
- [x] Cálculo automático de pagamentos
- [x] Geração de documentos legais
- [x] Notificações em tempo real
- [x] Interface responsiva e moderna

### 🚧 Em Desenvolvimento
- [ ] Integração real com eSocial
- [ ] Gateway de pagamento PIX real
- [ ] Biometria facial real
- [ ] Sistema de avaliações
- [ ] Chat entre empresa e profissional
- [ ] Relatórios avançados

## 🏗️ Arquitetura

### Frontend (React)
- **SPA** com roteamento client-side
- **Estado global** gerenciado via Context API
- **Componentes reutilizáveis** com shadcn/ui
- **Hooks customizados** para lógica de negócio

### Backend (Supabase)
- **PostgreSQL** para dados relacionais
- **Row Level Security** para segurança
- **Realtime subscriptions** para atualizações live
- **Edge Functions** para lógica serverless

### Integrações
- **Geolocalização** via browser APIs
- **Mapas** com React Leaflet
- **Geocoding** via Nominatim
- **Notificações** via Supabase Realtime

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔒 Segurança

- **Autenticação** via Supabase Auth
- **Autorização** com Row Level Security
- **Validação** de dados no frontend e backend
- **Sanitização** de inputs
- **HTTPS** obrigatório em produção

## 🚀 Deploy

### Opções de Deploy

1. **Vercel** (Recomendado)
```bash
pnpm build
vercel --prod
```

2. **Netlify**
```bash
pnpm build
netlify deploy --prod --dir=dist
```

3. **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📊 Métricas e Analytics

### KPIs Principais
- Tempo médio de matching
- Taxa de aceite de convocações
- Satisfação de empresas e profissionais
- Volume de transações
- Compliance rate

### Monitoramento
- Performance via Lighthouse
- Erros via Sentry (futuro)
- Analytics via Google Analytics (futuro)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.🤝

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@picopro.com
- 💬 Discord: [Picopro Community](https://discord.gg/picopro)
- 📱 WhatsApp: +55 11 99999-9999

---

**Picopro** - Transformando a economia gig em trabalho legal e seguro! 
