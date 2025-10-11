import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para ícones do Leaflet no React
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Ícones customizados
const createCustomIcon = (color) => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const userIcon = createCustomIcon('blue')
const jobIcon = createCustomIcon('red')
const professionalIcon = createCustomIcon('green')

const MapComponent = ({ 
  center = [-23.5505, -46.6333], // São Paulo como padrão
  zoom = 13,
  userLocation = null,
  jobs = [],
  professionals = [],
  showRadius = false,
  radiusKm = 10,
  onLocationSelect = null,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef()

  useEffect(() => {
    // Ajustar o mapa quando os dados mudarem
    if (mapRef.current) {
      const map = mapRef.current
      
      // Se há localização do usuário, centralizar nela
      if (userLocation) {
        map.setView([userLocation.latitude, userLocation.longitude], zoom)
      }
    }
  }, [userLocation, zoom])

  const handleMapClick = (e) => {
    if (onLocationSelect) {
      const { lat, lng } = e.latlng
      onLocationSelect({ latitude: lat, longitude: lng })
    }
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Localização do usuário */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.latitude, userLocation.longitude]} 
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Sua Localização</strong>
                </div>
              </Popup>
            </Marker>
            
            {/* Raio de busca */}
            {showRadius && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={radiusKm * 1000} // Converter km para metros
                pathOptions={{
                  color: 'blue',
                  fillColor: 'blue',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            )}
          </>
        )}
        
        {/* Vagas */}
        {jobs.map((job) => (
          <Marker
            key={`job-${job.id}`}
            position={[job.location_latitude, job.location_longitude]}
            icon={jobIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Duração:</strong> {job.duration_hours}h</p>
                  <p><strong>Valor:</strong> R$ {job.hourly_rate}/hora</p>
                  <p><strong>Habilidade:</strong> {job.required_skill}</p>
                  <p><strong>Endereço:</strong> {job.location_address}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Profissionais */}
        {professionals.map((professional) => (
          <Marker
            key={`professional-${professional.profile_id}`}
            position={[professional.latitude, professional.longitude]}
            icon={professionalIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-lg mb-2">
                  {professional.profiles?.full_name || 'Profissional'}
                </h3>
                {professional.bio && (
                  <p className="text-sm text-gray-600 mb-2">{professional.bio}</p>
                )}
                <div className="space-y-1 text-sm">
                  <p><strong>Habilidades:</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {professional.skills?.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {professional.distance && (
                    <p className="mt-2">
                      <strong>Distância:</strong> {professional.distance}km
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapComponent
