import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Briefcase, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const DashboardPage = () => {
  const { user, profile, isCompany, isProfessional } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      try {
        // Aqui você faria as chamadas reais para a API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (isCompany) {
          setStats({
            totalJobs: 12,
            activeJobs: 3,
            totalHires: 45,
            avgResponseTime: '15 min'
          })
          
          setRecentActivity([
            {
              id: 1,
              type: 'job_created',
              title: 'Nova vaga criada',
              description: 'Cozinheiro - Restaurante Centro',
              time: '2 horas atrás',
              status: 'active'
            },
            {
              id: 2,
              type: 'convocation_accepted',
              title: 'Convocação aceita',
              description: 'João Silva aceitou a vaga de Garçom',
              time: '4 horas atrás',
              status: 'success'
            },
            {
              id: 3,
              type: 'job_completed',
              title: 'Trabalho concluído',
              description: 'Maria Santos - Auxiliar de Limpeza',
              time: '1 dia atrás',
              status: 'completed'
            }
          ])
        } else {
          setStats({
            totalConvocations: 8,
            acceptedConvocations: 6,
            totalEarnings: 1250.00,
            avgRating: 4.8
          })
          
          setRecentActivity([
            {
              id: 1,
              type: 'new_convocation',
              title: 'Nova convocação',
              description: 'Cozinheiro - Restaurante Italiano',
              time: '30 min atrás',
              status: 'pending'
            },
            {
              id: 2,
              type: 'payment_received',
              title: 'Pagamento recebido',
              description: 'R$ 180,00 - Trabalho de 6h',
              time: '2 horas atrás',
              status: 'success'
            },
            {
              id: 3,
              type: 'work_completed',
              title: 'Trabalho concluído',
              description: 'Garçom - Evento Corporativo',
              time: '1 dia atrás',
              status: 'completed'
            }
          ])
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [isCompany])

  if (loading) {
    return <LoadingSpinner text="Carregando dashboard..." />
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'job_created':
      case 'new_convocation':
        return <Plus className="h-4 w-4" />
      case 'convocation_accepted':
      case 'payment_received':
        return <CheckCircle className="h-4 w-4" />
      case 'job_completed':
      case 'work_completed':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getActivityColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Olá, {profile?.full_name || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground">
          {isCompany 
            ? 'Gerencie suas vagas e acompanhe suas contratações'
            : 'Veja suas oportunidades e acompanhe seus ganhos'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isCompany ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde o mês passado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando profissionais
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Contratações</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHires}</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde o mês passado
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">
                  -5 min desde a semana passada
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Convocações Recebidas</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalConvocations}</div>
                <p className="text-xs text-muted-foreground">
                  +3 esta semana
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aceitação</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.acceptedConvocations / stats.totalConvocations) * 100)}%
                </div>
                <Progress 
                  value={(stats.acceptedConvocations / stats.totalConvocations) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  +R$ 320 esta semana
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating}</div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-sm ${i < Math.floor(stats.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas atividades na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              {isCompany ? 'Gerencie suas vagas' : 'Acompanhe suas oportunidades'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCompany ? (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Vaga
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Todas as Vagas
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Convocações
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="mr-2 h-4 w-4" />
                  Buscar Oportunidades
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Minhas Convocações
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Histórico de Pagamentos
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
