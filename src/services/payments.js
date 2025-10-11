import { supabase } from './supabase'
import { calculatePayment } from '../utils/helpers'

/**
 * Serviço de pagamentos e compliance legal
 */
export const paymentsService = {
  /**
   * Processa o pagamento de uma convocação concluída
   * @param {string} convocationId - ID da convocação
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processPayment(convocationId) {
    try {
      // Buscar dados da convocação
      const { data: convocation, error: convocationError } = await supabase
        .from('convocations')
        .select(`
          *,
          jobs(*),
          professionals:professional_id(profiles(*)),
          companies:company_id(profiles(*))
        `)
        .eq('id', convocationId)
        .eq('status', 'completed')
        .single()

      if (convocationError) {
        throw convocationError
      }

      if (!convocation) {
        throw new Error('Convocação não encontrada ou não está concluída')
      }

      // Calcular valores
      const startTime = new Date(convocation.start_time)
      const endTime = new Date(convocation.end_time)
      const hoursWorked = Math.ceil((endTime - startTime) / (1000 * 60 * 60))
      const payment = calculatePayment(convocation.jobs.hourly_rate, hoursWorked)

      // Gerar documentos legais
      const legalDocs = await this.generateLegalDocuments(convocation, payment, hoursWorked)

      // Simular integração com eSocial
      const esocialResult = await this.submitToESocial(convocation, payment, hoursWorked)

      // Simular processamento do pagamento via PIX
      const pixResult = await this.processPixPayment(convocation, payment.totalPayment)

      // Atualizar status da convocação
      const { data: updatedConvocation, error: updateError } = await supabase
        .from('convocations')
        .update({
          status: 'paid',
          total_payment: payment.totalPayment
        })
        .eq('id', convocationId)
        .select()

      if (updateError) {
        throw updateError
      }

      // Salvar documentos legais
      await this.saveLegalDocuments(convocationId, legalDocs)

      return {
        success: true,
        convocation: updatedConvocation[0],
        payment,
        legalDocuments: legalDocs,
        esocialSubmission: esocialResult,
        pixTransaction: pixResult
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Gera documentos legais necessários
   * @param {Object} convocation - Dados da convocação
   * @param {Object} payment - Cálculo do pagamento
   * @param {number} hoursWorked - Horas trabalhadas
   * @returns {Promise<Object>} Documentos gerados
   */
  async generateLegalDocuments(convocation, payment, hoursWorked) {
    // Em produção, isso geraria PDFs reais
    const documents = {
      contract: {
        type: 'contract',
        title: 'Contrato de Trabalho Intermitente',
        content: this.generateContractContent(convocation),
        generated_at: new Date().toISOString()
      },
      termOfConvocation: {
        type: 'term_of_convocation',
        title: 'Termo de Convocação',
        content: this.generateTermContent(convocation, hoursWorked),
        generated_at: new Date().toISOString()
      },
      paymentReceipt: {
        type: 'payment_receipt',
        title: 'Comprovante de Pagamento',
        content: this.generateReceiptContent(convocation, payment),
        generated_at: new Date().toISOString()
      }
    }

    return documents
  },

  /**
   * Gera conteúdo do contrato de trabalho intermitente
   * @param {Object} convocation - Dados da convocação
   * @returns {string} Conteúdo do contrato
   */
  generateContractContent(convocation) {
    return `
CONTRATO DE TRABALHO INTERMITENTE

CONTRATANTE: ${convocation.companies.profiles.full_name}
CONTRATADO: ${convocation.professionals.profiles.full_name}

FUNÇÃO: ${convocation.jobs.required_skill}
VALOR HORA: R$ ${convocation.jobs.hourly_rate.toFixed(2)}
LOCAL: ${convocation.jobs.location_address}

Este contrato é regido pela CLT, artigos 443 e seguintes, 
garantindo todos os direitos trabalhistas ao profissional.

Data: ${new Date().toLocaleDateString('pt-BR')}
    `.trim()
  },

  /**
   * Gera conteúdo do termo de convocação
   * @param {Object} convocation - Dados da convocação
   * @param {number} hoursWorked - Horas trabalhadas
   * @returns {string} Conteúdo do termo
   */
  generateTermContent(convocation, hoursWorked) {
    return `
TERMO DE CONVOCAÇÃO

O profissional ${convocation.professionals.profiles.full_name} 
foi convocado para exercer a função de ${convocation.jobs.required_skill}
no período de ${new Date(convocation.start_time).toLocaleString('pt-BR')} 
até ${new Date(convocation.end_time).toLocaleString('pt-BR')}.

HORAS TRABALHADAS: ${hoursWorked}h
LOCAL: ${convocation.jobs.location_address}

Convocação aceita em: ${new Date(convocation.convocation_time).toLocaleString('pt-BR')}
    `.trim()
  },

  /**
   * Gera conteúdo do comprovante de pagamento
   * @param {Object} convocation - Dados da convocação
   * @param {Object} payment - Cálculo do pagamento
   * @returns {string} Conteúdo do comprovante
   */
  generateReceiptContent(convocation, payment) {
    return `
COMPROVANTE DE PAGAMENTO

EMPRESA: ${convocation.companies.profiles.full_name}
PROFISSIONAL: ${convocation.professionals.profiles.full_name}

DISCRIMINAÇÃO:
- Salário base: R$ ${payment.baseSalary.toFixed(2)}
- Férias proporcionais: R$ ${payment.vacationPay.toFixed(2)}
- 13º proporcional: R$ ${payment.thirteenthSalary.toFixed(2)}
- DSR: R$ ${payment.dsr.toFixed(2)}

TOTAL LÍQUIDO: R$ ${payment.totalPayment.toFixed(2)}

Data do pagamento: ${new Date().toLocaleString('pt-BR')}
    `.trim()
  },

  /**
   * Simula submissão para o eSocial
   * @param {Object} convocation - Dados da convocação
   * @param {Object} payment - Cálculo do pagamento
   * @param {number} hoursWorked - Horas trabalhadas
   * @returns {Promise<Object>} Resultado da submissão
   */
  async submitToESocial(convocation, payment, hoursWorked) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Em produção, isso faria a integração real com o eSocial
    return {
      success: true,
      protocol: `ESC${Date.now()}`,
      submitted_at: new Date().toISOString(),
      inss_calculated: payment.baseSalary * 0.08, // 8% INSS (simplificado)
      fgts_calculated: payment.baseSalary * 0.08, // 8% FGTS
      status: 'submitted'
    }
  },

  /**
   * Simula processamento de pagamento via PIX
   * @param {Object} convocation - Dados da convocação
   * @param {number} amount - Valor a ser pago
   * @returns {Promise<Object>} Resultado da transação
   */
  async processPixPayment(convocation, amount) {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Em produção, isso integraria com um gateway de pagamento real
    return {
      success: true,
      transaction_id: `PIX${Date.now()}`,
      amount: amount,
      recipient: convocation.professionals.profiles.full_name,
      processed_at: new Date().toISOString(),
      status: 'completed'
    }
  },

  /**
   * Salva documentos legais no banco de dados
   * @param {string} convocationId - ID da convocação
   * @param {Object} documents - Documentos gerados
   * @returns {Promise<void>}
   */
  async saveLegalDocuments(convocationId, documents) {
    const documentsToSave = Object.values(documents).map(doc => ({
      convocation_id: convocationId,
      document_type: doc.type,
      document_url: `documents/${convocationId}/${doc.type}.pdf`, // URL simulada
      created_at: doc.generated_at
    }))

    const { error } = await supabase
      .from('legal_documents')
      .insert(documentsToSave)

    if (error) {
      console.error('Erro ao salvar documentos:', error)
    }
  },

  /**
   * Busca histórico de pagamentos de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} userType - Tipo do usuário ('professional' ou 'company')
   * @returns {Promise<Array>} Lista de pagamentos
   */
  async getPaymentHistory(userId, userType) {
    try {
      let query = supabase
        .from('convocations')
        .select(`
          *,
          jobs(*),
          professionals:professional_id(profiles(*)),
          companies:company_id(profiles(*))
        `)
        .eq('status', 'paid')
        .order('end_time', { ascending: false })

      if (userType === 'professional') {
        query = query.eq('professional_id', userId)
      } else {
        query = query.eq('company_id', userId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error)
      return []
    }
  },

  /**
   * Calcula estatísticas de pagamentos
   * @param {string} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   * @returns {Promise<Object>} Estatísticas
   */
  async getPaymentStats(userId, userType) {
    try {
      const payments = await this.getPaymentHistory(userId, userType)

      const totalEarnings = payments.reduce((sum, payment) => sum + (payment.total_payment || 0), 0)
      const totalHours = payments.reduce((sum, payment) => {
        if (payment.start_time && payment.end_time) {
          const hours = Math.ceil((new Date(payment.end_time) - new Date(payment.start_time)) / (1000 * 60 * 60))
          return sum + hours
        }
        return sum
      }, 0)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const monthlyEarnings = payments
        .filter(payment => {
          const paymentDate = new Date(payment.end_time)
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
        })
        .reduce((sum, payment) => sum + (payment.total_payment || 0), 0)

      return {
        totalEarnings,
        totalHours,
        monthlyEarnings,
        totalJobs: payments.length,
        averageHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      return {
        totalEarnings: 0,
        totalHours: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageHourlyRate: 0
      }
    }
  }
}
