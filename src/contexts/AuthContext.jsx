import { createContext, useContext, useEffect, useState } from 'react'
import { auth, profiles } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário logado
    const getInitialSession = async () => {
      const { data: { user } } = await auth.getCurrentUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await profiles.getProfile(userId)
      if (error) {
        console.error('Erro ao carregar perfil:', error)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signOut()
      
      if (error) {
        throw error
      }

      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await profiles.updateProfile(user.id, updates)
      
      if (error) {
        throw error
      }

      setProfile(data[0])
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const createCompanyProfile = async (companyData) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await profiles.createCompanyProfile(user.id, companyData)
      
      if (error) {
        throw error
      }

      // Atualizar o perfil para indicar que é uma empresa
      await updateProfile({ is_company: true })
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const createProfessionalProfile = async (professionalData) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await profiles.createProfessionalProfile(user.id, professionalData)
      
      if (error) {
        throw error
      }

      // Atualizar o perfil para indicar que é um profissional
      await updateProfile({ is_company: false })
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createCompanyProfile,
    createProfessionalProfile,
    isCompany: profile?.is_company || false,
    isProfessional: profile?.is_company === false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
