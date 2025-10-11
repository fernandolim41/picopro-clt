import { format, parseISO, addHours, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata valores monetários em Real brasileiro
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formata datas para exibição
 * @param {string|Date} date - Data a ser formatada
 * @param {string} formatString - Formato desejado
 * @returns {string} Data formatada
 */
export const formatDate = (date, formatString = 'dd/MM/yyyy HH:mm') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString, { locale: ptBR })
}

/**
 * Calcula o tempo restante para aceitar uma convocação
 * @param {string} deadline - Data limite para aceitar
 * @returns {string} Tempo restante formatado
 */
export const getTimeRemaining = (deadline) => {
  const now = new Date()
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline
  const diffInMinutes = Math.floor((deadlineDate - now) / (1000 * 60))
  
  if (diffInMinutes <= 0) {
    return 'Expirado'
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`
  }
  
  const hours = Math.floor(diffInMinutes / 60)
  const minutes = diffInMinutes % 60
  
  return `${hours}h ${minutes}min`
}

/**
 * Calcula o valor total do pagamento incluindo proporcionais
 * @param {number} hourlyRate - Valor por hora
 * @param {number} hoursWorked - Horas trabalhadas
 * @returns {Object} Breakdown do pagamento
 */
export const calculatePayment = (hourlyRate, hoursWorked) => {
  const baseSalary = hourlyRate * hoursWorked
  
  // Cálculos proporcionais (simplificados para o MVP)
  const vacationPay = baseSalary * 0.1111 // 1/9 das férias
  const thirteenthSalary = baseSalary * 0.0833 // 1/12 do 13º
  const dsr = baseSalary * 0.1667 // Descanso semanal remunerado (aproximado)
  
  const totalPayment = baseSalary + vacationPay + thirteenthSalary + dsr
  
  return {
    baseSalary,
    vacationPay,
    thirteenthSalary,
    dsr,
    totalPayment
  }
}

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} Se o CPF é válido
 */
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false
  
  return true
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} Se o CNPJ é válido
 */
export const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }
  
  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  let digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11
  if (result !== parseInt(digits.charAt(0))) return false
  
  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Formata CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado
 */
export const formatCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '')
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '')
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata telefone
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  phone = phone.replace(/[^\d]/g, '')
  
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Gera um ID único simples
 * @returns {string} ID único
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function para otimizar pesquisas
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Converte status para texto legível
 * @param {string} status - Status da convocação
 * @returns {string} Status formatado
 */
export const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendente',
    accepted: 'Aceita',
    rejected: 'Rejeitada',
    started: 'Em Andamento',
    completed: 'Concluída',
    paid: 'Paga'
  }
  
  return statusMap[status] || status
}

/**
 * Obtém a cor do status para exibição
 * @param {string} status - Status da convocação
 * @returns {string} Classe CSS da cor
 */
export const getStatusColor = (status) => {
  const colorMap = {
    pending: 'text-yellow-600 bg-yellow-100',
    accepted: 'text-blue-600 bg-blue-100',
    rejected: 'text-red-600 bg-red-100',
    started: 'text-purple-600 bg-purple-100',
    completed: 'text-green-600 bg-green-100',
    paid: 'text-gray-600 bg-gray-100'
  }
  
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}
