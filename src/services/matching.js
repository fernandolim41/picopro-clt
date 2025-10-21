import { supabase } from './supabase'
import { calculateDistance, filterByProximity } from '../utils/geolocation'

/**
 * Serviço de matching entre empresas e profissionais
 */
export const matchingService = {
  /**
   * Encontra profissionais próximos para uma vaga específica
   * @param {Object} job - Dados da vaga
   * @param {number} radiusKm - Raio de busca em km
   * @returns {Promise<Array>} Lista de profissionais compatíveis
   */
  async findMatchingProfessionals(job, radiusKm = 10) {
    try {
      // Buscar profissionais disponíveis com a habilidade requerida
      const { data: professionals, error } = await supabase
        .from('professionals')
        .select(`
          *,
          profiles (*)
        `)
        .eq('is_available', true)
        .contains('skills', [job.required_skill])
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(50)

      if (error) {
        throw error
      }

      // Filtrar por proximidade
      const nearbyProfessionals = filterByProximity(
        professionals,
        job.location_latitude,
        job.location_longitude,
        radiusKm
      )

      // Adicionar score de compatibilidade
      const scoredProfessionals = nearbyProfessionals.map((professional) => ({
        ...professional,
        matchScore: this.calculateMatchScore(professional, job),
      }))

      // Ordenar por score de compatibilidade
      return scoredProfessionals.sort((a, b) => b.matchScore - a.matchScore)
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
      throw error
    }
  },

  /**
   * Calcula score de compatibilidade entre profissional e vaga
   * @param {Object} professional - Dados do profissional
   * @param {Object} job - Dados da vaga
   * @returns {number} Score de 0 a 100
   */
  calculateMatchScore(professional, job) {
    let score = 0

    // Score base por ter a habilidade requerida
    if (professional.skills?.includes(job.required_skill)) {
      score += 40
    }

    // Bônus por proximidade (quanto mais próximo, maior o score)
    const maxDistance = 20 // km
    const distanceScore = Math.max(
      0,
      ((maxDistance - professional.distance) / maxDistance) * 30
    )
    score += distanceScore

    // Bônus por habilidades adicionais relacionadas
    const relatedSkills = this.getRelatedSkills(job.required_skill)
    const additionalSkills =
      professional.skills?.filter(
        (skill) => relatedSkills.includes(skill) && skill !== job.required_skill
      ) || []
    score += Math.min(additionalSkills.length * 5, 20)

    // Bônus por certificações
    if (professional.certifications?.length > 0) {
      score += Math.min(professional.certifications.length * 3, 10)
    }

    return Math.round(score)
  },

  /**
   * Retorna habilidades relacionadas a uma habilidade específica
   * @param {string} skill - Habilidade principal
   * @returns {Array} Lista de habilidades relacionadas
   */
  getRelatedSkills(skill) {
    const skillGroups = {
      Cozinheiro: ['Auxiliar de Cozinha', 'Chef', 'Confeiteiro', 'Pizzaiolo'],
      Garçom: ['Atendimento', 'Barista', 'Sommelier', 'Recepcionista'],
      Limpeza: ['Auxiliar de Limpeza', 'Faxineiro', 'Zelador'],
      Logística: ['Estoquista', 'Conferente', 'Operador de Empilhadeira'],
      Atendimento: ['Vendedor', 'Recepcionista', 'Telemarketing', 'Garçom'],
      Segurança: ['Porteiro', 'Vigilante', 'Controlador de Acesso'],
    }

    return skillGroups[skill] || []
  },

  /**
   * Cria convocações para os melhores profissionais
   * @param {string} jobId - ID da vaga
   * @param {Array} professionals - Lista de profissionais
   * @param {number} maxConvocations - Número máximo de convocações
   * @returns {Promise<Array>} Lista de convocações criadas
   */
  async createConvocations(jobId, professionals, maxConvocations = 5) {
    try {
      // Pegar os melhores profissionais
      const selectedProfessionals = professionals.slice(0, maxConvocations)

      // Buscar dados da vaga
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) {
        throw jobError
      }

      // Criar convocações
      const convocations = selectedProfessionals.map((professional) => ({
        job_id: jobId,
        professional_id: professional.profile_id,
        company_id: job.company_id,
        status: 'pending',
        acceptance_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
      }))

      const { data, error } = await supabase
        .from('convocations')
        .insert(convocations)
        .select()

      if (error) {
        throw error
      }

      // Atualizar status da vaga para 'matching'
      await supabase.from('jobs').update({ status: 'matching' }).eq('id', jobId)

      return data
    } catch (error) {
      console.error('Erro ao criar convocações:', error)
      throw error
    }
  },

  /**
   * Busca vagas próximas para um profissional
   * @param {string} professionalId - ID do profissional
   * @param {number} radiusKm - Raio de busca em km
   * @returns {Promise<Array>} Lista de vagas compatíveis
   */
  async findMatchingJobs(professionalId, radiusKm = 10) {
    try {
      // Buscar dados do profissional
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('*')
        .eq('profile_id', professionalId)
        .single()

      if (profError) {
        throw profError
      }

      if (!professional.latitude || !professional.longitude) {
        throw new Error('Localização do profissional não definida')
      }

      // Buscar vagas abertas
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .in('required_skill', professional.skills || [])
        .limit(50)

      if (jobsError) {
        throw jobsError
      }

      // Filtrar por proximidade
      const nearbyJobs = filterByProximity(
        jobs,
        professional.latitude,
        professional.longitude,
        radiusKm
      )

      // Adicionar score de compatibilidade
      const scoredJobs = nearbyJobs.map((job) => ({
        ...job,
        matchScore: this.calculateJobMatchScore(job, professional),
      }))

      // Ordenar por score
      return scoredJobs.sort((a, b) => b.matchScore - a.matchScore)
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
      throw error
    }
  },

  /**
   * Calcula score de compatibilidade entre vaga e profissional
   * @param {Object} job - Dados da vaga
   * @param {Object} professional - Dados do profissional
   * @returns {number} Score de 0 a 100
   */
  calculateJobMatchScore(job, professional) {
    let score = 0

    if (professional.skills?.includes(job.required_skill)) {
      score += 50
    }

    const maxDistance = 20 // km
    const distanceScore = Math.max(
      0,
      ((maxDistance - job.distance) / maxDistance) * 30
    )
    score += distanceScore

    if (job.hourly_rate >= 20) score += 10
    if (job.hourly_rate >= 30) score += 5
    if (job.duration_hours >= 6) score += 5

    return Math.round(score)
  },

  /**
   * Executa o processo completo de matching para uma vaga
   * @param {string} jobId - ID da vaga
   * @param {Object} options - Opções de matching
   * @returns {Promise<Object>} Resultado do matching
   */
  async executeMatching(jobId, options = {}) {
    const { radiusKm = 10, maxConvocations = 5, minScore = 30 } = options

    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) {
        throw jobError
      }

      const professionals = await this.findMatchingProfessionals(job, radiusKm)

      const qualifiedProfessionals = professionals.filter(
        (p) => p.matchScore >= minScore
      )

      if (qualifiedProfessionals.length === 0) {
        return {
          success: false,
          message: 'Nenhum profissional qualificado encontrado',
          professionals: [],
          convocations: [],
        }
      }

      const convocations = await this.createConvocations(
        jobId,
        qualifiedProfessionals,
        maxConvocations
      )

      return {
        success: true,
        message: `${convocations.length} convocações criadas`,
        professionals: qualifiedProfessionals,
        convocations,
      }
    } catch (error) {
      console.error('Erro no processo de matching:', error)
      return {
        success: false,
        message: error.message,
        professionals: [],
        convocations: [],
      }
    }
  },
}
