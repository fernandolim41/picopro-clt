import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Download, 
  CheckCircle,
  Calendar,
  Building,
  User,
  Receipt
} from 'lucide-react'
import { formatCurrency, formatDate, calculatePayment } from '../utils/helpers'

const PaymentSummary = ({ convocation, onProcessPayment, showProcessButton = false }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [processing, setProcessing] = useState(false)

  if (!convocation || convocation.status !== 'completed') {
    return null
  }

  const startTime = new Date(convocation.start_time)
  const endTime = new Date(convocation.end_time)
  const hoursWorked = Math.ceil((endTime - startTime) / (1000 * 60 * 60))
  const hourlyRate = convocation.jobs?.hourly_rate || 0
  
  const payment = calculatePayment(hourlyRate, hoursWorked)

  const handleProcessPayment = async () => {
    try {
      setProcessing(true)
      
      if (onProcessPayment) {
        await onProcessPayment(convocation.id, payment)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
    } finally {
      setProcessing(false)
    }
  }

  const generateReceipt = () => {
    // Em uma implementação real, isso geraria um PDF ou redirecionaria para uma página de recibo
    const receiptData = {
      convocation,
      payment,
      hoursWorked,
      startTime,
      endTime
    }
    
    console.log('Gerando recibo:', receiptData)
    // Aqui você implementaria a geração do recibo
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Resumo do Pagamento</span>
            <Badge variant="default">
              {convocation.status === 'paid' ? 'Pago' : 'Processando'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Trabalho concluído em {formatDate(endTime)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Valor Total */}
          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(payment.totalPayment)}
            </div>
            <p className="text-sm text-green-700">
              Valor total a receber
            </p>
          </div>

          {/* Breakdown Rápido */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Horas trabalhadas</p>
              <p className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {hoursWorked}h
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Valor por hora</p>
              <p className="font-medium">
                {formatCurrency(hourlyRate)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Salário base</p>
              <p className="font-medium">
                {formatCurrency(payment.baseSalary)}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-muted-foreground">Proporcionais</p>
              <p className="font-medium text-green-600">
                +{formatCurrency(payment.totalPayment - payment.baseSalary)}
              </p>
            </div>
          </div>

          {/* Informações do Trabalho */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Empresa:</span>
              <span>{convocation.companies?.profiles?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Função:</span>
              <span>{convocation.jobs?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Local:</span>
              <span className="text-right max-w-[200px] truncate">
                {convocation.jobs?.location_address}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Detalhes Completos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes do Pagamento</DialogTitle>
                  <DialogDescription>
                    Breakdown completo dos valores e cálculos
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Informações Gerais */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Empresa
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{convocation.companies?.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{convocation.jobs?.title}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Período
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          <strong>Início:</strong> {formatDate(startTime)}
                        </p>
                        <p className="text-sm">
                          <strong>Fim:</strong> {formatDate(endTime)}
                        </p>
                        <p className="text-sm">
                          <strong>Duração:</strong> {hoursWorked}h
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Breakdown Detalhado */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cálculo do Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Salário base ({hoursWorked}h × {formatCurrency(hourlyRate)})</span>
                          <span className="font-medium">{formatCurrency(payment.baseSalary)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Férias proporcionais (11,11%)</span>
                            <span>{formatCurrency(payment.vacationPay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">13º salário proporcional (8,33%)</span>
                            <span>{formatCurrency(payment.thirteenthSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">DSR - Descanso Semanal (16,67%)</span>
                            <span>{formatCurrency(payment.dsr)}</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total a receber</span>
                          <span className="text-green-600">{formatCurrency(payment.totalPayment)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações Legais */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Informações Legais</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Contrato de trabalho intermitente conforme CLT</li>
                      <li>• Recolhimento de INSS e FGTS já processado</li>
                      <li>• Registro no eSocial efetuado automaticamente</li>
                      <li>• Todos os direitos trabalhistas garantidos</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={generateReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Comprovante
            </Button>
            
            {showProcessButton && convocation.status === 'completed' && (
              <Button 
                className="w-full"
                onClick={handleProcessPayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Processar Pagamento
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Status do Pagamento */}
          {convocation.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Pagamento Processado</p>
                  <p className="text-sm text-green-600">
                    O valor foi transferido via PIX para sua conta
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default PaymentSummary
