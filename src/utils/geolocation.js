/**
 * Utilitários para geolocalização e cálculos de distância
 */

/**
 * Obtém a localização atual do usuário
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada pelo navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  })
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Arredondar para 2 casas decimais
}

/**
 * Converte graus para radianos
 * @param {number} degrees 
 * @returns {number}
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

/**
 * Filtra profissionais por proximidade
 * @param {Array} professionals - Lista de profissionais
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLon - Longitude do usuário
 * @param {number} maxDistance - Distância máxima em km
 * @returns {Array} Profissionais filtrados com distância calculada
 */
export const filterByProximity = (professionals, userLat, userLon, maxDistance = 10) => {
  return professionals
    .map(professional => ({
      ...professional,
      distance: calculateDistance(
        userLat,
        userLon,
        professional.latitude,
        professional.longitude
      )
    }))
    .filter(professional => professional.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Formata a distância para exibição
 * @param {number} distance - Distância em km
 * @returns {string} Distância formatada
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance}km`
}

/**
 * Converte endereço em coordenadas usando a API de geocoding
 * @param {string} address - Endereço para converter
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const geocodeAddress = async (address) => {
  try {
    // Para um MVP, podemos usar a API gratuita do OpenStreetMap
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    
    const data = await response.json()
    
    if (data.length === 0) {
      throw new Error('Endereço não encontrado')
    }
    
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    }
  } catch (error) {
    throw new Error(`Erro ao geocodificar endereço: ${error.message}`)
  }
}

/**
 * Converte coordenadas em endereço usando a API de geocoding reverso
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Endereço formatado
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )
    
    const data = await response.json()
    
    if (!data.display_name) {
      throw new Error('Endereço não encontrado')
    }
    
    return data.display_name
  } catch (error) {
    throw new Error(`Erro ao obter endereço: ${error.message}`)
  }
}
