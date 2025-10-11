import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Clock, 
  Play, 
  Square, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Timer,
  MapPin,
  Loader2,
  User
} from 'lucide-react'
import { formatDate, formatCurrency, calculatePayment } from '../utils/helpers'
import { useGeolocation } from '../hooks/useGeolocation'
import { calculateDistance } from '../utils/geolocation'

const TimeTracker = ({ convocation, onCheckIn, onCheckOut, disabled = false }) => {
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showBiometricModal, setShowBiometricModal] = useState(false)
  const [biometricAction, setBiometricAction] = useState(null)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricSuccess, setBiometricSuccess] = useState(false)
  const [locationError, setLocationError] = useState('')
  
  const { location, getLocation } = useGeolocation()

  // Atualizar timer a cada segundo quando está rastreando
  useEffect(() => {
    let interval = null
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isTracking, startTime])

  // Verificar se já está trabalhando (convocação com status 'started')
  useEffect(() => {
    if (convocation?.status === 'started' && convocation.start_time) {
      setIsTracking(true)
      setStartTime(new Date(convocation.start_time).getTime())
    }
  }, [convocation])

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const validateLocation = async () => {
    try {
      await getLocation()
      
      if (!location) {
        throw new Error('Não foi possível obter sua localização')
      }

      // Verificar se está próximo ao local de trabalho (raio de 100m)
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        convocation.jobs.location_latitude,
        convocation.jobs.location_longitude
      )

      if (distance > 0.1) { // 100 metros
        throw new Error(`Você deve estar no local de trabalho para fazer o check-in/out. Distância atual: ${(distance * 1000).toFixed(0)}m`)
      }

      return true
    } catch (error) {
      setLocationError(error.message)
      return false
    }
  }

  const simulateBiometricScan = async () => {
    setBiometricLoading(true)
    setBiometricSuccess(false)
    
    // Simular processo de reconhecimento facial
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simular sucesso (em produção seria integração real com biometria)
    setBiometricLoading(false)
    setBiometricSuccess(true)
    
    // Aguardar um pouco para mostrar sucesso
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return true
  }

  const handleCheckIn = async () => {
    try {
      setLocationError('')
      
      // Validar localização
      const locationValid = await validateLocation()
      if (!locationValid) {
        return
      }

      // Mostrar modal de biometria
      setBiometricAction('checkin')
      setShowBiometricModal(true)
      
      // Simular biometria
      const biometricValid = await simulateBiometricScan()
      
      if (biometricValid) {
        const now = Date.now()
        setIsTracking(true)
        setStartTime(now)
        setElapsedTime(0)
        
        // Chamar callback
        if (onCheckIn) {
          await onCheckIn({
            timestamp: new Date(now).toISOString(),
            location: location
          })
        }
      }
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setShowBiometricModal(false)
      setBiometricAction(null)
      setBiometricSuccess(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setLocationError('')
      
      // Validar localização
      const locationValid = await validateLocation()
      if (!locationValid) {
        return
      }

      // Mostrar modal de biometria
      setBiometricAction('checkout')
      setShowBiometricModal(true)
      
      // Simular biometria
      const biometricValid = await simulateBiometricScan()
      
      if (biometricValid) {
        const now = Date.now()
        const totalTime = now - startTime
        
        setIsTracking(false)
        
        // Calcular pagamento
        const hoursWorked = Math.ceil(totalTime / (1000 * 60 * 60))
        const payment = calculatePayment(convocation.jobs.hourly_rate, hoursWorked)
        
        // Chamar callback
        if (onCheckOut) {
          await onCheckOut({
            timestamp: new Date(now).toISOString(),
            location: location,
            totalTime: totalTime,
            hoursWorked: hoursWorked,
            payment: payment
          })
        }
      }
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setShowBiometricModal(false)
      setBiometricAction(null)
      setBiometricSuccess(false)
    }
  }

  const getProgressPercentage = () => {
    if (!convocation?.jobs?.duration_hours || !isTracking) return 0
    
    const expectedDuration = convocation.jobs.duration_hours * 60 * 60 * 1000 // em ms
    return Math.min((elapsedTime / expectedDuration) * 100, 100)
  }

  const getEstimatedPayment = () => {
    if (!isTracking || !convocation?.jobs?.hourly_rate) return 0
    
    const hoursWorked = elapsedTime / (1000 * 60 * 60)
    return hoursWorked * convocation.jobs.hourly_rate
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Controle de Jornada</span>
            {isTracking && (
              <Badge variant="default" className="animate-pulse">
                Em Andamento
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {convocation?.jobs?.title} - {convocation?.jobs?.location_address}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-primary mb-2">
              {formatElapsedTime(elapsedTime)}
            </div>
            <p className="text-sm text-muted-foreground">
              {isTracking ? 'Tempo trabalhado' : 'Pronto para iniciar'}
            </p>
          </div>

          {/* Progress Bar */}
          {isTracking && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da jornada</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Duração prevista: {convocation?.jobs?.duration_hours || 0} horas
              </p>
            </div>
          )}

          {/* Estimated Payment */}
          {isTracking && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  Ganho estimado:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(getEstimatedPayment())}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Valor por hora: {formatCurrency(convocation?.jobs?.hourly_rate || 0)}
              </p>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isTracking ? (
              <Button 
                onClick={handleCheckIn} 
                disabled={disabled || convocation?.status !== 'accepted'}
                className="w-full"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Fazer Check-in
              </Button>
            ) : (
              <Button 
                onClick={handleCheckOut} 
                disabled={disabled}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Fazer Check-out
              </Button>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Verificação de localização obrigatória</span>
            </div>
          </div>

          {/* Work Info */}
          {convocation && (
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Empresa:</span>
                <span>{convocation.companies?.profiles?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Função:</span>
                <span>{convocation.jobs?.required_skill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duração prevista:</span>
                <span>{convocation.jobs?.duration_hours}h</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biometric Modal */}
      <Dialog open={showBiometricModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {biometricAction === 'checkin' ? 'Check-in' : 'Check-out'} Biométrico
            </DialogTitle>
            <DialogDescription className="text-center">
              Posicione seu rosto na câmera para verificação
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                biometricLoading 
                  ? 'border-blue-500 bg-blue-50 animate-pulse' 
                  : biometricSuccess 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
              }`}>
                {biometricLoading ? (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                ) : biometricSuccess ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <Camera className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              {biometricLoading && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              )}
            </div>
            
            <div className="text-center">
              {biometricLoading && (
                <p className="text-sm text-muted-foreground">
                  Processando reconhecimento facial...
                </p>
              )}
              {biometricSuccess && (
                <p className="text-sm text-green-600 font-medium">
                  Verificação concluída com sucesso!
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TimeTracker
