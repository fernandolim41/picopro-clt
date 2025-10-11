import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react'
import { useConvocations } from '../hooks/useConvocations'
import ConvocationCard from '../components/ConvocationCard'
import TimeTracker from '../components/TimeTracker'
import PaymentSummary from '../components/PaymentSummary'
import LoadingSpinner from '../components/LoadingSpinner'
import { paymentsService } from '../services/payments'
import { toast } from '@/components/ui/use-toast'

const ConvocationsPage = () => {
  const { isCompany } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [processingPayment, setProcessingPayment] = useState(false)
  
  const {
    convocations,
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
  } = useConvocations()

  const stats = getStats()

  const handleConvocationUpdate = (updatedConvocation) => {
    updateConvocation(updatedConvocation)
  }

  const handleCheckIn = async (convocationId, checkInData) => {
    try {
      const result = await startWork(convocationId)
      if (result.success) {
        toast({
          title: 'Check-in realizado',
          description: 'Trabalho iniciado com sucesso!'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Erro no check-in',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleCheckOut = async (convocationId, checkOutData) => {
    try {
      const result = await completeWork(convocationId)
      if (result.success) {
        toast({
          title: 'Check-out realizado',
          description: 'Trabalho concluído! Pagamento será processado.'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Erro no check-out',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleProcessPayment = async (convocationId, paymentData) => {
    try {
      setProcessingPayment(true)
      
      const result = await paymentsService.processPayment(convocationId)
      
      if (result.success) {
        updateConvocation(result.convocation)
        toast({
          title: 'Pagamento processado',
          description: 'O valor foi transferido via PIX'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Erro no pagamento',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const filteredConvocations = (() => {
    switch (activeTab) {
      case 'pending':
        return getPendingConvocations()
      case 'active':
        return getActiveConvocations()
      case 'completed':
        return getCompletedConvocations()
      default:
        return convocations
    }
  })()

  const getActiveConvocation = () => {
    return convocations.find(c => c.status === 'started')
  }

  const activeConvocation = getActiveConvocation()

  if (loading) {
    return <LoadingSpinner text="Carregando convocações..." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isCompany ? 'Convocações Enviadas' : 'Minhas Convocações'}
        </h1>
        <p className="text-muted-foreground">
          {isCompany 
            ? 'Acompanhe o status das convocações enviadas aos profissionais'
            : 'Gerencie suas convocações e controle sua jornada de trabalho'
          }
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isCompany ? 'Pagas' : 'Ganhos'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isCompany ? stats.completed : `R$ ${stats.totalEarnings.toFixed(0)}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracker para profissionais */}
      {!isCompany && activeConvocation && (
        <div className="mb-8">
          <TimeTracker
            convocation={activeConvocation}
            onCheckIn={(data) => handleCheckIn(activeConvocation.id, data)}
            onCheckOut={(data) => handleCheckOut(activeConvocation.id, data)}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({stats.pending})</TabsTrigger>
          <TabsTrigger value="active">Ativas ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-6">
            {filteredConvocations.map((convocation) => (
              <div key={convocation.id} className="space-y-4">
                <ConvocationCard
                  convocation={convocation}
                  onUpdate={handleConvocationUpdate}
                />
                
                {/* Payment Summary para convocações concluídas */}
                {convocation.status === 'completed' && !isCompany && (
                  <PaymentSummary
                    convocation={convocation}
                    onProcessPayment={handleProcessPayment}
                    showProcessButton={false} // Pagamento é automático
                  />
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredConvocations.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma convocação encontrada
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' && 'Não há convocações pendentes no momento.'}
                  {activeTab === 'active' && 'Não há convocações ativas no momento.'}
                  {activeTab === 'completed' && 'Não há convocações concluídas no momento.'}
                  {activeTab === 'all' && (
                    isCompany 
                      ? 'Você ainda não enviou convocações.' 
                      : 'Você ainda não recebeu convocações.'
                  )}
                </p>
                {activeTab === 'all' && !isCompany && (
                  <Button className="mt-4" onClick={() => window.location.href = '/jobs'}>
                    Buscar Oportunidades
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConvocationsPage
