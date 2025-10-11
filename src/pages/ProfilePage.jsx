import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, Mail, Phone, MapPin, Edit } from 'lucide-react'

const ProfilePage = () => {
  const { profile, isCompany } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Suas informações básicas de perfil
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {isCompany ? (
                    <Building className="h-8 w-8 text-primary" />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name || 'Nome não informado'}</h3>
                  <Badge variant={isCompany ? 'default' : 'secondary'}>
                    {isCompany ? 'Empresa' : 'Profissional'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.email || 'Não informado'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {isCompany ? 'CNPJ' : 'CPF'}
                  </label>
                  <span className="text-sm">{profile?.cpf_cnpj || 'Não informado'}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Localização</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">São Paulo, SP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isCompany ? 'Informações da Empresa' : 'Habilidades'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCompany ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Setor</label>
                    <p className="text-sm mt-1">Alimentação</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Funcionários</label>
                    <p className="text-sm mt-1">50-100</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vagas Ativas</label>
                    <p className="text-sm mt-1">3</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Principais Habilidades</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">Cozinheiro</Badge>
                      <Badge variant="outline">Garçom</Badge>
                      <Badge variant="outline">Atendimento</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Certificações</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Manipulação de Alimentos</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Disponibilidade</label>
                    <Badge variant="default" className="mt-2">Disponível</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
