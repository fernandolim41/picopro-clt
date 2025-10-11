import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, MapPin, Clock, DollarSign, Users, Zap } from 'lucide-react'
import LocationSearch from './LocationSearch'
import MapComponent from './MapComponent'
import { jobs } from '../services/supabase'
import { matchingService } from '../services/matching'
import { geocodeAddress } from '../utils/geolocation'

const CreateJobModal = ({ onJobCreated, trigger }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matchingResults, setMatchingResults] = useState(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Criar vaga, 2: Resultados do matching

  // Dados da vaga
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skill: '',
    duration_hours: '',
    hourly_rate: '',
    location_address: '',
    location_latitude: null,
    location_longitude: null
  })

  const skillOptions = [
    'Cozinheiro',
    'Garçom',
    'Auxiliar de Limpeza',
    'Recepcionista',
    'Segurança',
    'Estoquista',
    'Vendedor',
    'Atendimento',
    'Logística',
    'Barista'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location_address: location.address,
      location_latitude: location.latitude,
      location_longitude: location.longitude
    }))
  }

  const validateForm = () => {
    const required = ['title', 'required_skill', 'duration_hours', 'hourly_rate', 'location_address']
    const missing = required.filter(field => !formData[field])
    
    if (missing.length > 0) {
      return `Campos obrigatórios: ${missing.join(', ')}`
    }
    
    if (!formData.location_latitude || !formData.location_longitude) {
      return 'Por favor, selecione uma localização válida'
    }
    
    if (formData.duration_hours < 1 || formData.duration_hours > 12) {
      return 'Duração deve ser entre 1 e 12 horas'
    }
    
    if (formData.hourly_rate < 10 || formData.hourly_rate > 100) {
      return 'Valor por hora deve ser entre R$ 10 e R$ 100'
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

      // Criar a vaga
      const jobData = {
        ...formData,
        company_id: user.id,
        duration_hours: parseInt(formData.duration_hours),
        hourly_rate: parseFloat(formData.hourly_rate),
        status: 'open'
      }

      const { data: newJob, error: jobError } = await jobs.createJob(jobData)
      
      if (jobError) {
        throw jobError
      }

      // Executar matching
      const matchingResult = await matchingService.executeMatching(newJob[0].id, {
        radiusKm: 15,
        maxConvocations: 5,
        minScore: 30
      })

      setMatchingResults({
        job: newJob[0],
        ...matchingResult
      })
      
      setStep(2)
      
      if (onJobCreated) {
        onJobCreated(newJob[0])
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar vaga')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setStep(1)
    setMatchingResults(null)
    setFormData({
      title: '',
      description: '',
      required_skill: '',
      duration_hours: '',
      hourly_rate: '',
      location_address: '',
      location_latitude: null,
      location_longitude: null
    })
    setError('')
  }

  const renderStep1 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Vaga *</Label>
          <Input
            id="title"
            placeholder="Ex: Cozinheiro para evento"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="required_skill">Habilidade Requerida *</Label>
          <Select 
            value={formData.required_skill} 
            onValueChange={(value) => handleInputChange('required_skill', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma habilidade" />
            </SelectTrigger>
            <SelectContent>
              {skillOptions.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_hours">Duração (horas) *</Label>
          <Input
            id="duration_hours"
            type="number"
            min="1"
            max="12"
            placeholder="Ex: 6"
            value={formData.duration_hours}
            onChange={(e) => handleInputChange('duration_hours', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Valor por Hora (R$) *</Label>
          <Input
            id="hourly_rate"
            type="number"
            min="10"
            max="100"
            step="0.01"
            placeholder="Ex: 25.00"
            value={formData.hourly_rate}
            onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva os detalhes da vaga..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <LocationSearch
        onLocationSelect={handleLocationSelect}
        placeholder="Digite o endereço do local de trabalho..."
      />

      {formData.location_latitude && formData.location_longitude && (
        <div className="space-y-2">
          <Label>Localização no Mapa</Label>
          <MapComponent
            center={[formData.location_latitude, formData.location_longitude]}
            jobs={[{
              id: 'preview',
              title: formData.title || 'Nova Vaga',
              location_latitude: formData.location_latitude,
              location_longitude: formData.location_longitude,
              location_address: formData.location_address,
              description: formData.description,
              duration_hours: formData.duration_hours,
              hourly_rate: formData.hourly_rate,
              required_skill: formData.required_skill
            }]}
            height="300px"
            zoom={15}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando vaga...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Criar e Buscar Profissionais
            </>
          )}
        </Button>
      </div>
    </form>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Vaga Criada com Sucesso!</h3>
        <p className="text-muted-foreground">
          {matchingResults?.success 
            ? `Encontramos ${matchingResults.professionals?.length || 0} profissionais compatíveis`
            : 'Vaga criada, mas nenhum profissional foi encontrado no momento'
          }
        </p>
      </div>

      {/* Resumo da vaga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{matchingResults?.job?.title}</span>
            <Badge variant="default">Ativa</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {matchingResults?.job?.location_address}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {matchingResults?.job?.duration_hours}h
            </span>
            <span className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              R$ {matchingResults?.job?.hourly_rate}/hora
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Resultados do matching */}
      {matchingResults?.success && matchingResults.professionals?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Profissionais Encontrados</span>
            </CardTitle>
            <CardDescription>
              {matchingResults.convocations?.length || 0} convocações foram enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchingResults.professionals.slice(0, 3).map((professional, index) => (
                <div key={professional.profile_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{professional.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {professional.distance}km • Score: {professional.matchScore}%
                    </p>
                  </div>
                  <Badge variant="outline">
                    Convocado
                  </Badge>
                </div>
              ))}
              
              {matchingResults.professionals.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{matchingResults.professionals.length - 3} outros profissionais
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClose}>
          Fechar
        </Button>
        <Button onClick={() => window.location.href = '/jobs'}>
          Ver Todas as Vagas
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Criar Nova Vaga' : 'Resultado do Matching'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Preencha os dados da vaga e encontraremos profissionais qualificados automaticamente'
              : 'Veja os resultados da busca por profissionais'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
    </Dialog>
  )
}

export default CreateJobModal
