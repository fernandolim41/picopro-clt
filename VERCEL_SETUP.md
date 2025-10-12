# 🚀 Configuração do Picopro no Vercel

Este guia te ajudará a configurar as variáveis de ambiente no Vercel para que sua aplicação funcione completamente.

## 📋 Pré-requisitos

1. ✅ Projeto já está no GitHub: `https://github.com/fernandolim41/picopro-clt`
2. ✅ Aplicação já está no Vercel: `https://picopro.vercel.app/`
3. ✅ Supabase configurado com as credenciais fornecidas

## 🔧 Configuração das Variáveis de Ambiente no Vercel

### Passo 1: Acessar o Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Encontre o projeto **picopro** na sua lista de projetos
3. Clique no projeto para abrir o dashboard

### Passo 2: Configurar as Variáveis de Ambiente

1. **Clique na aba "Settings"** (Configurações)
2. **No menu lateral, clique em "Environment Variables"**
3. **Adicione as seguintes variáveis:**

#### Variável 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://vrzuglvkukziojtsosnd.supabase.co`
- **Environment:** Selecione `Production`, `Preview` e `Development`

#### Variável 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyenVnbHZrdWt6aW9qdHNvc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjA3NzcsImV4cCI6MjA3NTY5Njc3N30.88ow0mQByXHdsd9Zfrj_cpDRnmOzXsv87X7jrZTf3zo`
- **Environment:** Selecione `Production`, `Preview` e `Development`

### Passo 3: Salvar e Fazer Redeploy

1. **Clique em "Save"** para cada variável
2. **Vá para a aba "Deployments"**
3. **Clique nos três pontos** do deployment mais recente
4. **Selecione "Redeploy"** para aplicar as novas variáveis

## 🗄️ Configuração do Banco de Dados Supabase

### Passo 1: Executar o Script SQL Corrigido

1. **Acesse seu projeto Supabase:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Vá para "SQL Editor"**
3. **Copie e cole o conteúdo do arquivo `supabase_schema_fixed.sql`**
4. **Clique em "RUN"** para executar

> ⚠️ **Importante:** Use o arquivo `supabase_schema_fixed.sql` que corrige problemas de schema identificados.

### Passo 2: Verificar se as Tabelas foram Criadas

Após executar o script, verifique se as seguintes tabelas foram criadas:

- ✅ `profiles` (com coluna `email`)
- ✅ `companies`
- ✅ `professionals`
- ✅ `jobs`
- ✅ `convocations`
- ✅ `legal_documents`

### Passo 3: Verificar Dados de Demonstração

O script também insere dados de demonstração:

**Empresa Demo:**
- Email: `empresa@demo.com`
- Senha: `demo123` (você precisará criar este usuário no Supabase Auth)

**Profissional Demo:**
- Email: `profissional@demo.com`
- Senha: `demo123` (você precisará criar este usuário no Supabase Auth)

## 👥 Criação de Usuários de Demonstração

### No Supabase Dashboard:

1. **Vá para "Authentication" > "Users"**
2. **Clique em "Add user"**
3. **Crie os usuários:**

#### Usuário Empresa:
- **Email:** `empresa@demo.com`
- **Password:** `demo123`
- **User ID:** `11111111-1111-1111-1111-111111111111`
- **Email Confirm:** ✅ Marque como confirmado

#### Usuário Profissional:
- **Email:** `profissional@demo.com`
- **Password:** `demo123`
- **User ID:** `22222222-2222-2222-2222-222222222222`
- **Email Confirm:** ✅ Marque como confirmado

## 🧪 Testando a Aplicação

Após configurar tudo:

1. **Acesse:** `https://picopro.vercel.app/`
2. **Teste o login** com as credenciais de demonstração
3. **Verifique se as funcionalidades funcionam:**
   - ✅ Login/Logout
   - ✅ Dashboard diferenciado por tipo de usuário
   - ✅ Criação de vagas (como empresa)
   - ✅ Visualização de convocações
   - ✅ Sistema de matching

## 🔍 Verificação de Problemas

### Se a aplicação não carregar:

1. **Verifique as variáveis de ambiente** no Vercel
2. **Confirme que o redeploy foi feito** após adicionar as variáveis
3. **Verifique os logs** na aba "Functions" do Vercel

### Se o login não funcionar:

1. **Confirme que os usuários foram criados** no Supabase Auth
2. **Verifique se as políticas RLS** estão ativas
3. **Teste a conexão** com o banco de dados

### Se as tabelas não aparecerem:

1. **Execute novamente o script** `supabase_schema_fixed.sql`
2. **Verifique as permissões** das tabelas
3. **Confirme que o RLS** está configurado corretamente

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs do Vercel** na aba "Functions"
2. **Teste localmente** primeiro com `npm run dev`
3. **Confirme que todas as variáveis** estão configuradas corretamente

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Redeploy realizado no Vercel
- [ ] Script SQL executado no Supabase
- [ ] Usuários de demonstração criados
- [ ] Aplicação testada e funcionando
- [ ] Login funcionando para ambos os tipos de usuário
- [ ] Funcionalidades principais testadas

---

**🎉 Parabéns!** Sua aplicação Picopro está agora totalmente funcional no Vercel com integração completa ao Supabase!
