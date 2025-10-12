import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://vrzuglvkukziojtsosnd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyenVnbHZrdWt6aW9qdHNvc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjA3NzcsImV4cCI6MjA3NTY5Njc3N30.88ow0mQByXHdsd9Zfrj_cpDRnmOzXsv87X7jrZTf3zo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...')
  
  try {
    // Teste 1: Verificar se as tabelas existem
    console.log('\n📋 Verificando tabelas...')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Tabela profiles não encontrada:', profilesError.message)
    } else {
      console.log('✅ Tabela profiles encontrada')
    }
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    if (companiesError) {
      console.log('❌ Tabela companies não encontrada:', companiesError.message)
    } else {
      console.log('✅ Tabela companies encontrada')
    }
    
    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('count')
      .limit(1)
    
    if (professionalsError) {
      console.log('❌ Tabela professionals não encontrada:', professionalsError.message)
    } else {
      console.log('✅ Tabela professionals encontrada')
    }
    
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1)
    
    if (jobsError) {
      console.log('❌ Tabela jobs não encontrada:', jobsError.message)
    } else {
      console.log('✅ Tabela jobs encontrada')
    }
    
    const { data: convocations, error: convocationsError } = await supabase
      .from('convocations')
      .select('count')
      .limit(1)
    
    if (convocationsError) {
      console.log('❌ Tabela convocations não encontrada:', convocationsError.message)
    } else {
      console.log('✅ Tabela convocations encontrada')
    }
    
    // Teste 2: Verificar autenticação
    console.log('\n🔐 Testando autenticação...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ Nenhum usuário logado (normal para teste):', authError.message)
    } else if (user) {
      console.log('✅ Usuário logado:', user.email)
    } else {
      console.log('ℹ️ Nenhum usuário logado (normal para teste)')
    }
    
    // Teste 3: Verificar se consegue inserir dados de teste
    console.log('\n📝 Testando inserção de dados...')
    
    // Tentar criar um perfil de teste
    const { data: testProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Teste Conexão',
        email: 'teste@conexao.com',
        user_type: 'company'
      })
      .select()
    
    if (insertError) {
      if (insertError.code === '23505') {
        console.log('ℹ️ Dados de teste já existem (normal)')
      } else {
        console.log('❌ Erro ao inserir dados de teste:', insertError.message)
      }
    } else {
      console.log('✅ Inserção de dados funcionando')
      
      // Limpar dados de teste
      await supabase
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000001')
    }
    
    console.log('\n🎉 Teste de conexão concluído!')
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

// Executar teste
testConnection()
