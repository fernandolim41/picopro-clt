import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Filter,
  Eye,
  Briefcase
} from 'lucide-react'
import CreateJobModal from '../components/CreateJobModal'

const JobsPage = () => {
  const { isCompany } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  // Dados mockados para demonstração
  const mockJobs = [
    {
      id: 1,
      title: 'Cozinheiro',
      company: 'Restaurante Italiano',
      location: 'Centro, São Paulo',
      duration: 6,
      hourlyRate: 25.00,
      status: 'open',
      distance: 2.5,
      description: 'Procuramos cozinheiro experiente para evento especial',
      requiredSkill: 'Cozinheiro'
    },
    {
      id: 2,
      title: 'Garçom',
      company: 'Café da Esquina',
      location: 'Vila Madalena, São Paulo',
      duration: 4,
      hourlyRate: 20.00,
      status: 'matching',
      distance: 1.2,
      description: 'Atendimento em café durante horário de pico',
      requiredSkill: 'Garçom'
    },
    {
      id: 3,
      title: 'Auxiliar de Limpeza',
      company: 'Hotel Premium',
      location: 'Paulista, São Paulo',
      duration: 8,
      hourlyRate: 18.00,
      status: 'open',
      distance: 3.8,
      description: 'Limpeza de quartos e áreas comuns',
      requiredSkill: 'Limpeza'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'matching':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Aberta'
      case 'matching':
        return 'Em Match'
      case 'closed':
        return 'Fechada'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isCompany ? 'Minhas Vagas' : 'Oportunidades'}
          </h1>
          <p className="text-muted-foreground">
            {isCompany 
              ? 'Gerencie suas vagas e acompanhe candidatos'
              : 'Encontre oportunidades próximas a você'
            }
          </p>
        </div>
        
        {isCompany && (
          <CreateJobModal onJobCreated={(job) => console.log('Nova vaga criada:', job)} />
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isCompany ? "Buscar por título ou habilidade..." : "Buscar oportunidades..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {getStatusText(job.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {job.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                  {!isCompany && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {job.distance}km
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  {job.duration} horas
                </div>
                
                <div className="flex items-center text-sm font-medium text-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  R$ {job.hourlyRate.toFixed(2)}/hora
                </div>
              </div>
              
              <div className="pt-4 border-t">
                {isCompany ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Candidatos
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Candidatar-se
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockJobs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isCompany ? 'Nenhuma vaga criada' : 'Nenhuma oportunidade encontrada'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isCompany 
                ? 'Comece criando sua primeira vaga para encontrar profissionais qualificados.'
                : 'Ajuste seus filtros ou tente novamente mais tarde.'
              }
            </p>
            {isCompany && (
              <CreateJobModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Vaga
                  </Button>
                }
                onJobCreated={(job) => console.log('Primeira vaga criada:', job)} 
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default JobsPage
