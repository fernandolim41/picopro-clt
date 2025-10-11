import { useState, useEffect, useRef } from 'react'
import { realtime } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook para gerenciar notificações em tempo real
 * @returns {Object} Estado das notificações
 */
export const useRealtime = () => {
  const { user, profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const subscriptionRef = useRef(null)

  useEffect(() => {
    if (!user || !profile) return

    // Configurar subscription baseado no tipo de usuário
    if (profile.is_company) {
      // Empresas recebem notificações sobre atualizações de vagas
      subscriptionRef.current = realtime.subscribeToJobUpdates(
        user.id,
        handleRealtimeUpdate
      )
    } else {
      // Profissionais recebem notificações sobre convocações
      subscriptionRef.current = realtime.subscribeToConvocations(
        user.id,
        handleRealtimeUpdate
      )
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [user, profile])

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    let notificationMessage = ''
    let notificationType = 'info'

    if (profile.is_company) {
      // Notificações para empresas
      switch (eventType) {
        case 'UPDATE':
          if (newRecord.status !== oldRecord.status) {
            notificationMessage = `Vaga "${newRecord.title}" foi atualizada`
            notificationType = 'info'
          }
          break
        default:
          return
      }
    } else {
      // Notificações para profissionais
      switch (eventType) {
        case 'INSERT':
          notificationMessage = 'Nova convocação recebida!'
          notificationType = 'success'
          break
        case 'UPDATE':
          if (newRecord.status !== oldRecord.status) {
            switch (newRecord.status) {
              case 'accepted':
                notificationMessage = 'Convocação aceita com sucesso'
                notificationType = 'success'
                break
              case 'started':
                notificationMessage = 'Trabalho iniciado'
                notificationType = 'info'
                break
              case 'completed':
                notificationMessage = 'Trabalho concluído'
                notificationType = 'success'
                break
              case 'paid':
                notificationMessage = 'Pagamento processado'
                notificationType = 'success'
                break
              default:
                return
            }
          }
          break
        default:
          return
      }
    }

    if (notificationMessage) {
      addNotification({
        id: Date.now(),
        message: notificationMessage,
        type: notificationType,
        timestamp: new Date(),
        read: false
      })
    }
  }

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Auto-remover notificação após 5 segundos
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}
