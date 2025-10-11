import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Loader2, Search, Navigation } from 'lucide-react'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress, reverseGeocode } from '../utils/geolocation'
import { debounce } from '../utils/helpers'

const LocationSearch = ({ 
  onLocationSelect, 
  initialLocation = null,
  placeholder = "Digite um endereço...",
  showCurrentLocation = true,
  className = ""
}) => {
  const [address, setAddress] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  
  const { location: currentLocation, loading: geoLoading, getLocation } = useGeolocation()

  // Debounced search function
  const debouncedSearch = debounce(async (searchTerm) => {
    if (searchTerm.length < 3) {
      setSuggestions([])
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Usar API de geocoding para buscar sugestões
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&countrycodes=br`
      )
      
      const data = await response.json()
      
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }))
      
      setSuggestions(formattedSuggestions)
    } catch (err) {
      setError('Erro ao buscar endereços')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, 500)

  useEffect(() => {
    if (address) {
      debouncedSearch(address)
    } else {
      setSuggestions([])
    }
  }, [address])

  useEffect(() => {
    // Se há uma localização inicial, converter para endereço
    if (initialLocation && !address) {
      reverseGeocode(initialLocation.latitude, initialLocation.longitude)
        .then(addressText => setAddress(addressText))
        .catch(() => setAddress('Localização selecionada'))
    }
  }, [initialLocation])

  const handleAddressChange = (value) => {
    setAddress(value)
    setError('')
  }

  const handleSuggestionSelect = (suggestion) => {
    setAddress(suggestion.address)
    setSuggestions([])
    setSelectedLocation({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    })
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.address
      })
    }
  }

  const handleCurrentLocation = async () => {
    try {
      setError('')
      await getLocation()
      
      if (currentLocation) {
        setSelectedLocation(currentLocation)
        
        // Converter coordenadas para endereço
        try {
          const addressText = await reverseGeocode(currentLocation.latitude, currentLocation.longitude)
          setAddress(addressText)
        } catch {
          setAddress('Localização atual')
        }
        
        if (onLocationSelect) {
          onLocationSelect({
            ...currentLocation,
            address: 'Localização atual'
          })
        }
      }
    } catch (err) {
      setError('Não foi possível obter sua localização')
    }
  }

  const handleManualSearch = async () => {
    if (!address.trim()) return

    try {
      setLoading(true)
      setError('')
      
      const location = await geocodeAddress(address)
      setSelectedLocation(location)
      setSuggestions([])
      
      if (onLocationSelect) {
        onLocationSelect({
          ...location,
          address
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="address">Localização</Label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                type="text"
                placeholder={placeholder}
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
                <CardContent className="p-0">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      className="w-full text-left px-4 py-3 hover:bg-accent border-b border-border last:border-b-0 transition-colors"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion.address}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleManualSearch}
            disabled={loading || !address.trim()}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {showCurrentLocation && (
            <Button 
              variant="outline" 
              onClick={handleCurrentLocation}
              disabled={geoLoading}
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedLocation && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Localização selecionada: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}

export default LocationSearch
