import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// NOTA: Para uso em produção, essas variáveis devem estar em um arquivo .env
const supabaseUrl = 'https://vrzuglvkukziojtsosnd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyenVnbHZrdWt6aW9qdHNvc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjA3NzcsImV4cCI6MjA3NTY5Njc3N30.88ow0mQByXHdsd9Zfrj_cpDRnmOzXsv87X7jrZTf3zo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções auxiliares para autenticação
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funções para gerenciar perfis
export const profiles = {
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  createCompanyProfile: async (profileId, companyData) => {
    const { data, error } = await supabase
      .from('companies')
      .insert({ profile_id: profileId, ...companyData })
      .select()
    return { data, error }
  },

  createProfessionalProfile: async (profileId, professionalData) => {
    const { data, error } = await supabase
      .from('professionals')
      .insert({ profile_id: profileId, ...professionalData })
      .select()
    return { data, error }
  }
}

// Funções para gerenciar vagas
export const jobs = {
  createJob: async (jobData) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
    return { data, error }
  },

  getJobs: async (filters = {}) => {
    let query = supabase.from('jobs').select('*')
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId)
    }

    const { data, error } = await query
    return { data, error }
  },

  updateJob: async (jobId, updates) => {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
    return { data, error }
  }
}

// Funções para gerenciar convocações
export const convocations = {
  createConvocation: async (convocationData) => {
    const { data, error } = await supabase
      .from('convocations')
      .insert(convocationData)
      .select()
    return { data, error }
  },

  getConvocations: async (userId, userType) => {
    let query = supabase.from('convocations').select(`
      *,
      jobs(*),
      professionals:professional_id(profiles(*)),
      companies:company_id(profiles(*))
    `)
    
    if (userType === 'professional') {
      query = query.eq('professional_id', userId)
    } else if (userType === 'company') {
      query = query.eq('company_id', userId)
    }

    const { data, error } = await query
    return { data, error }
  },

  updateConvocationStatus: async (convocationId, status, additionalData = {}) => {
    const { data, error } = await supabase
      .from('convocations')
      .update({ status, ...additionalData })
      .eq('id', convocationId)
      .select()
    return { data, error }
  }
}

// Funções para geolocalização e match
export const matching = {
  findNearbyProfessionals: async (latitude, longitude, skill, radiusKm = 10) => {
    // Esta função seria implementada como uma Edge Function no Supabase
    // Por enquanto, vamos simular com uma query básica
    const { data, error } = await supabase
      .from('professionals')
      .select('*, profiles(*)')
      .eq('is_available', true)
      .contains('skills', [skill])
    
    // Filtro de distância seria implementado no backend/Edge Function
    return { data, error }
  }
}

// Funções para notificações em tempo real
export const realtime = {
  subscribeToConvocations: (userId, callback) => {
    return supabase
      .channel('convocations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'convocations',
        filter: `professional_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToJobUpdates: (companyId, callback) => {
    return supabase
      .channel('jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `company_id=eq.${companyId}`
      }, callback)
      .subscribe()
  }
}
