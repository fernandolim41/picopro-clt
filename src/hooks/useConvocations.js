import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { convocations, realtime } from '../services/supabase'

/**
 * Hook para gerenciar convocações com atualizações em tempo real
 * @returns {Object} Estado e funções das convocações
 */
export const useConvocations = () => {
  const { user, isCompany } = useAuth()
  const [convocationsList, setConvocationsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar convocações iniciais
  useEffect(() => {
    if (!user) return

    const loadConvocations = async () => {
      try {
        setLoading(true)
        setError(null)

        const userType = isCompany ? 'company' : 'professional'
        const { data, error: convocationsError } = await convocations.getConvocations(user.id, userType)

        if (convocationsError) {
          throw convocationsError
        }

        setConvocationsList(data || [])
      } catch (err) {
        setError(err.message)
        console.error('Erro ao carregar convocações:', err)
      } finally {
        setLoading(false)
      }
    }

    loadConvocations()
  }, [user, isCompany])

  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    if (!user) return

    let subscription

    if (isCompany) {
      // Empresas recebem atualizações sobre suas convocações
      subscription = realtime.subscribeToJobUpdates(user.id, handleRealtimeUpdate)
    } else {
      // Profissionais recebem atualizações sobre convocações direcionadas a eles
      subscription = realtime.subscribeToConvocations(user.id, handleRealtimeUpdate)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [user, isCompany])

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        // Nova convocação criada
        setConvocationsList(prev => [newRecord, ...prev])
        break

      case 'UPDATE':
        // Convocação atualizada
        setConvocationsList(prev =>
          prev.map(convocation =>
            convocation.id === newRecord.id ? { ...convocation, ...newRecord } : convocation
          )
        )
        break

      case 'DELETE':
        // Convocação removida
        setConvocationsList(prev =>
          prev.filter(convocation => convocation.id !== oldRecord.id)
        )
        break

      default:
        break
    }
  }

  // Função para atualizar uma convocação específica
  const updateConvocation = (updatedConvocation) => {
    setConvocationsList(prev =>
      prev.map(convocation =>
        convocation.id === updatedConvocation.id ? updatedConvocation : convocation
      )
    )
  }

  // Função para aceitar uma convocação
  const acceptConvocation = async (convocationId) => {
    try {
      const { data, error } = await convocations.updateConvocationStatus(
        convocationId,
        'accepted'
      )

      if (error) {
        throw error
      }

      updateConvocation(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Função para rejeitar uma convocação
  const rejectConvocation = async (convocationId) => {
    try {
      const { data, error } = await convocations.updateConvocationStatus(
        convocationId,
        'rejected'
      )

      if (error) {
        throw error
      }

      updateConvocation(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Função para iniciar trabalho
  const startWork = async (convocationId) => {
    try {
      const { data, error } = await convocations.updateConvocationStatus(
        convocationId,
        'started',
        { start_time: new Date().toISOString() }
      )

      if (error) {
        throw error
      }

      updateConvocation(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Função para finalizar trabalho
  const completeWork = async (convocationId) => {
    try {
      const convocation = convocationsList.find(c => c.id === convocationId)
      if (!convocation) {
        throw new Error('Convocação não encontrada')
      }

      // Calcular horas trabalhadas e pagamento
      const startTime = new Date(convocation.start_time)
      const endTime = new Date()
      const hoursWorked = Math.ceil((endTime - startTime) / (1000 * 60 * 60))
      
      // Cálculo simplificado do pagamento (seria mais complexo em produção)
      const hourlyRate = convocation.jobs?.hourly_rate || 0
      const basePay = hourlyRate * hoursWorked
      const totalPayment = basePay * 1.3 // Incluindo proporcionais (simplificado)

      const { data, error } = await convocations.updateConvocationStatus(
        convocationId,
        'completed',
        { 
          end_time: endTime.toISOString(),
          total_payment: totalPayment
        }
      )

      if (error) {
        throw error
      }

      updateConvocation(data[0])
      return { success: true, data: data[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Filtros e estatísticas
  const getConvocationsByStatus = (status) => {
    return convocationsList.filter(convocation => convocation.status === status)
  }

  const getPendingConvocations = () => getConvocationsByStatus('pending')
  const getActiveConvocations = () => {
    return convocationsList.filter(c => ['accepted', 'started'].includes(c.status))
  }
  const getCompletedConvocations = () => {
    return convocationsList.filter(c => ['completed', 'paid'].includes(c.status))
  }

  const getStats = () => {
    const total = convocationsList.length
    const pending = getPendingConvocations().length
    const active = getActiveConvocations().length
    const completed = getCompletedConvocations().length
    const totalEarnings = getCompletedConvocations()
      .reduce((sum, c) => sum + (c.total_payment || 0), 0)

    return {
      total,
      pending,
      active,
      completed,
      totalEarnings
    }
  }

  return {
    convocations: convocationsList,
    loading,
    error,
    updateConvocation,
    acceptConvocation,
    rejectConvocation,
    startWork,
    completeWork,
    getConvocationsByStatus,
    getPendingConvocations,
    getActiveConvocations,
    getCompletedConvocations,
    getStats
  }
}
