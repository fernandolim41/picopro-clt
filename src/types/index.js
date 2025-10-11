/**
 * @typedef {Object} Profile
 * @property {string} id - ID único do perfil
 * @property {boolean} is_company - Se é uma empresa ou profissional
 * @property {string} full_name - Nome completo
 * @property {string} cpf_cnpj - CPF ou CNPJ
 * @property {string} phone - Telefone
 * @property {string} avatar_url - URL do avatar
 * @property {string} created_at - Data de criação
 */

/**
 * @typedef {Object} Company
 * @property {string} profile_id - ID do perfil associado
 * @property {string} company_name - Nome da empresa
 * @property {string} address - Endereço
 * @property {string} contact_email - Email de contato
 */

/**
 * @typedef {Object} Professional
 * @property {string} profile_id - ID do perfil associado
 * @property {string} bio - Biografia
 * @property {string[]} skills - Lista de habilidades
 * @property {string[]} certifications - Lista de certificações
 * @property {boolean} is_available - Se está disponível
 * @property {number} latitude - Latitude da localização
 * @property {number} longitude - Longitude da localização
 */

/**
 * @typedef {Object} Job
 * @property {string} id - ID único da vaga
 * @property {string} company_id - ID da empresa
 * @property {string} title - Título da vaga
 * @property {string} description - Descrição
 * @property {string} required_skill - Habilidade requerida
 * @property {number} duration_hours - Duração em horas
 * @property {string} location_address - Endereço do local
 * @property {number} location_latitude - Latitude do local
 * @property {number} location_longitude - Longitude do local
 * @property {number} hourly_rate - Valor por hora
 * @property {string} status - Status da vaga ('open', 'matching', 'closed')
 */

/**
 * @typedef {Object} Convocation
 * @property {string} id - ID único da convocação
 * @property {string} job_id - ID da vaga
 * @property {string} professional_id - ID do profissional
 * @property {string} company_id - ID da empresa
 * @property {string} status - Status ('pending', 'accepted', 'rejected', 'started', 'completed', 'paid')
 * @property {string} convocation_time - Hora da convocação
 * @property {string} acceptance_deadline - Prazo para aceitar
 * @property {string} start_time - Hora de início (check-in)
 * @property {string} end_time - Hora de fim (check-out)
 * @property {number} total_payment - Valor total do pagamento
 */

/**
 * @typedef {Object} LegalDocument
 * @property {string} id - ID único do documento
 * @property {string} convocation_id - ID da convocação
 * @property {string} document_type - Tipo ('contract', 'term_of_convocation')
 * @property {string} document_url - URL do documento
 * @property {string} created_at - Data de criação
 */

/**
 * @typedef {Object} Location
 * @property {number} latitude - Latitude
 * @property {number} longitude - Longitude
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id - ID do usuário
 * @property {string} email - Email
 * @property {Object} user_metadata - Metadados do usuário
 */

/**
 * @typedef {Object} AuthResponse
 * @property {AuthUser|null} data - Dados do usuário
 * @property {Error|null} error - Erro, se houver
 */

export {}
