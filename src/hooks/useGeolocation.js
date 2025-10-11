import { useState, useEffect } from 'react'
import { getCurrentLocation } from '../utils/geolocation'

/**
 * Hook para gerenciar geolocalização do usuário
 * @returns {Object} Estado da geolocalização
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = async () => {
    try {
      setLoading(true)
      setError(null)
      const coords = await getCurrentLocation()
      setLocation(coords)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Tentar obter localização automaticamente na primeira renderização
    getLocation()
  }, [])

  return {
    location,
    loading,
    error,
    getLocation,
    hasLocation: !!location
  }
}
