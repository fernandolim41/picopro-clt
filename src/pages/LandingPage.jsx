import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Clock, 
  Shield, 
  MapPin, 
  CheckCircle, 
  Briefcase,
  Star,
  ArrowRight,
  Zap,
  FileText,
  CreditCard
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Match Imediato',
      description: 'Conectamos empresas e profissionais em tempo real usando IA e geolocalização.'
    },
    {
      icon: Shield,
      title: 'Compliance Legal',
      description: 'Contratos CLT Intermitente automáticos com total conformidade legal.'
    },
    {
      icon: MapPin,
      title: 'Geolocalização',
      description: 'Encontre profissionais qualificados próximos ao local de trabalho.'
    },
    {
      icon: FileText,
      title: 'Documentação Automática',
      description: 'Geração automática de contratos e termos de convocação.'
    },
    {
      icon: Clock,
      title: 'Controle de Jornada',
      description: 'Check-in/out com biometria facial para registro preciso de ponto.'
    },
    {
      icon: CreditCard,
      title: 'Pagamento Instantâneo',
      description: 'Liquidação imediata via PIX com cálculo automático de proporcionais.'
    }
  ]

  const benefits = {
    companies: [
      'Redução de até 80% no tempo de contratação',
      'Zero risco de passivos trabalhistas',
      'Profissionais pré-qualificados e verificados',
      'Flexibilidade total para picos de demanda'
    ],
    professionals: [
      'Flexibilidade de horários',
      'Garantia de direitos trabalhistas',
      'Pagamento imediato após o trabalho',
      'Oportunidades próximas à sua localização'
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-foreground">Picopro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            A Uberização Legal do Trabalho
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Match imediato e legal entre{' '}
            <span className="text-primary">empresas</span> e{' '}
            <span className="text-primary">profissionais</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            O Picopro conecta empresas com picos de demanda a profissionais qualificados 
            usando o regime da CLT Intermitente, garantindo agilidade operacional e 
            conformidade legal total.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa que combina tecnologia avançada com compliance legal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Benefícios para Todos
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Para Empresas */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Para Empresas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.companies.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Para Profissionais */}
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">Para Profissionais</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.professionals.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Pronto para Revolucionar sua Operação?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Junte-se às empresas que já descobriram a flexibilidade da economia gig 
            com a segurança da CLT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Cadastrar Empresa
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Cadastrar como Profissional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-foreground">Picopro</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 Picopro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
