import { useState } from 'react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Play,
  Square,
  User,
  Building,
  Timer,
  Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { convocations } from '../services/supabase'
import { formatCurrency, formatDate, getTimeRemaining, getStatusText, getStatusColor, calculatePayment } from '../utils/helpers'
import { toast } from '@/components/ui/use-toast'

const ConvocationCard = ({ convocation, onUpdate }) => {
  const { isCompany } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isExpired = convocation.status === 'pending' && 
    new Date(convocation.acceptance_deadline) < new Date()

  const timeRemaining = convocation.status === 'pending' ? 
    getTimeRemaining(convocation.acceptance_deadline) : null

  const handleAction = async (action, additionalData = {}) => {
    try {
      setLoading(true)
      
      let newStatus = action
      let updateData = { ...additionalData }
      
      // Adicionar timestamps específicos
      if (action === 'accepted') {
        // Nada adicional necessário
      } else if (action === 'started') {
        updateData.start_time = new Date().toISOString()
      } else if (action === 'completed') {
        updateData.end_time = new Date().toISOString()
        
        // Calcular pagamento
        const startTime = new Date(convocation.start_time)
        const endTime = new Date()
        const hoursWorked = Math.ceil((endTime - startTime) / (1000 * 60 * 60))
        const payment = calculatePayment(convocation.jobs?.hourly_rate || 0, hoursWorked)
        
        updateData.total_payment = payment.totalPayment
      }
      
      const { data, error } = await convocations.updateConvocationStatus(
        convocation.id,
        newStatus,
        updateData
      )
      
      if (error) {
        throw error
      }
      
      // Mostrar toast de sucesso
      const messages = {
        accepted: 'Convocação aceita com sucesso!',
        rejected: 'Convocação rejeitada',
        started: 'Trabalho iniciado. Boa sorte!',
        completed: 'Trabalho concluído. Pagamento será processado.'
      }
      
      toast({
        title: messages[action] || 'Ação realizada',
        description: formatDate(new Date()),
        variant: action === 'rejected' ? 'destructive' : 'default'
      })
      
      // Notificar componente pai
      if (onUpdate) {
        onUpdate(data[0])
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao realizar ação',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionButtons = () => {
    if (isCompany) {
      return null // Empresas apenas visualizam
    }

    switch (convocation.status) {
      case 'pending':
        if (isExpired) {
          return (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tempo para aceitar expirado
              </AlertDescription>
            </Alert>
          )
        }
        
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => handleAction('accepted')}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aceitar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAction('rejected')}
              disabled={loading}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        )
      
      case 'accepted':
        return (
          <Button 
            size="sm"
            onClick={() => handleAction('started')}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Iniciar Trabalho
          </Button>
        )
      
      case 'started':
        return (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleAction('completed')}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            Finalizar Trabalho
          </Button>
        )
      
      default:
        return null
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'started':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <Square className="h-4 w-4" />
      case 'paid':
        return <DollarSign className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getProgressValue = () => {
    const statusOrder = ['pending', 'accepted', 'started', 'completed', 'paid']
    const currentIndex = statusOrder.indexOf(convocation.status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  return (
    <Card className={`transition-all duration-200 ${convocation.status === 'pending' && !isExpired ? 'ring-2 ring-blue-200' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <span>{convocation.jobs?.title || 'Vaga'}</span>
              <Badge className={getStatusColor(convocation.status)}>
                {getStatusIcon(convocation.status)}
                <span className="ml-1">{getStatusText(convocation.status)}</span>
              </Badge>
            </CardTitle>
            
            <CardDescription className="flex items-center space-x-4 mt-2">
              {isCompany ? (
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {convocation.professionals?.profiles?.full_name || 'Profissional'}
                </span>
              ) : (
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {convocation.companies?.profiles?.full_name || 'Empresa'}
                </span>
              )}
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {convocation.jobs?.location_address}
              </span>
            </CardDescription>
          </div>
          
          {convocation.status === 'pending' && !isCompany && !isExpired && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tempo restante:</p>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-orange-600">
                  {timeRemaining}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{Math.round(getProgressValue())}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{convocation.jobs?.duration_hours || 0} horas</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(convocation.jobs?.hourly_rate || 0)}/hora</span>
          </div>
          
          {convocation.total_payment && (
            <div className="col-span-2 flex items-center space-x-2 font-medium">
              <span>Total: {formatCurrency(convocation.total_payment)}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Convocado: {formatDate(convocation.convocation_time)}</div>
          {convocation.start_time && (
            <div>Iniciado: {formatDate(convocation.start_time)}</div>
          )}
          {convocation.end_time && (
            <div>Finalizado: {formatDate(convocation.end_time)}</div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {getActionButtons()}
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{convocation.jobs?.title}</DialogTitle>
                <DialogDescription>
                  Detalhes completos da convocação
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição da Vaga</h4>
                  <p className="text-sm text-muted-foreground">
                    {convocation.jobs?.description || 'Sem descrição disponível'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Informações do Trabalho</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Habilidade: {convocation.jobs?.required_skill}</div>
                    <div>Duração: {convocation.jobs?.duration_hours}h</div>
                    <div>Valor/hora: {formatCurrency(convocation.jobs?.hourly_rate || 0)}</div>
                    <div>Status: {getStatusText(convocation.status)}</div>
                  </div>
                </div>
                
                {convocation.total_payment && (
                  <div>
                    <h4 className="font-medium mb-2">Pagamento</h4>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(convocation.total_payment)}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConvocationCard
