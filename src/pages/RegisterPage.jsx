import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Building, User } from 'lucide-react'
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ, formatPhone } from '../utils/helpers'

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Dados comuns
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  
  // Dados específicos do profissional
  const [cpf, setCpf] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  
  // Dados específicos da empresa
  const [cnpj, setCnpj] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  
  const { signUp, createCompanyProfile, createProfessionalProfile } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !fullName || !phone) {
      return 'Por favor, preencha todos os campos obrigatórios'
    }
    
    if (password !== confirmPassword) {
      return 'As senhas não coincidem'
    }
    
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres'
    }
    
    if (activeTab === 'professional') {
      if (!cpf || !skills) {
        return 'Por favor, preencha CPF e habilidades'
      }
      
      if (!validateCPF(cpf)) {
        return 'CPF inválido'
      }
    } else {
      if (!cnpj || !companyName || !address) {
        return 'Por favor, preencha todos os campos da empresa'
      }
      
      if (!validateCNPJ(cnpj)) {
        return 'CNPJ inválido'
      }
    }
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Criar conta de usuário
      const { data, error: signUpError } = await signUp(email, password, {
        full_name: fullName,
        is_company: activeTab === 'company'
      })
      
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      
      // Aguardar um pouco para o usuário ser criado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Criar perfil específico
      if (activeTab === 'company') {
        const { error: companyError } = await createCompanyProfile({
          company_name: companyName,
          address,
          contact_email: contactEmail || email
        })
        
        if (companyError) {
          setError(companyError.message)
          return
        }
      } else {
        const { error: professionalError } = await createProfessionalProfile({
          bio,
          skills: skills.split(',').map(s => s.trim()).filter(s => s),
          certifications: [],
          is_available: true,
          latitude: null,
          longitude: null
        })
        
        if (professionalError) {
          setError(professionalError.message)
          return
        }
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCpfChange = (value) => {
    const formatted = formatCPF(value)
    setCpf(formatted)
  }

  const handleCnpjChange = (value) => {
    const formatted = formatCNPJ(value)
    setCnpj(formatted)
  }

  const handlePhoneChange = (value) => {
    const formatted = formatPhone(value)
    setPhone(formatted)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground">
            Criar Conta
          </h2>
          <p className="mt-2 text-muted-foreground">
            Escolha o tipo de conta e preencha seus dados
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Crie sua conta para começar a usar o Picopro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="professional" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profissional</span>
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Empresa</span>
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Campos comuns */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Campos específicos do profissional */}
                <TabsContent value="professional" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Habilidades *</Label>
                    <Input
                      id="skills"
                      type="text"
                      placeholder="Ex: Cozinheiro, Garçom, Logística"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Separe as habilidades por vírgula
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      placeholder="Conte um pouco sobre sua experiência..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Campos específicos da empresa */}
                <TabsContent value="company" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Textarea
                      id="address"
                      placeholder="Endereço completo da empresa"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={loading}
                      required
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contato</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contato@empresa.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se não preenchido, será usado o email principal
                    </p>
                  </div>
                </TabsContent>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary hover:text-primary/80"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
