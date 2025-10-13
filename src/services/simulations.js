// Serviços de Simulação para Picopro
// Simula APIs externas: eSocial, PIX e Biometria

/**
 * Simula envio de dados para o eSocial
 * @param {Object} contractData - Dados do contrato
 * @returns {Promise<Object>} Resposta simulada do eSocial
 */
export const sendToESocial = async (contractData) => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simula 95% de sucesso
  const success = Math.random() > 0.05;
  
  if (success) {
    return {
      success: true,
      protocol: `ESOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: 'Dados enviados com sucesso ao eSocial',
      timestamp: new Date().toISOString(),
      data: {
        empregador: contractData.company,
        trabalhador: contractData.professional,
        tipoContrato: 'CLT Intermitente',
        evento: 'S-2200', // Admissão
        status: 'PROCESSADO'
      }
    };
  } else {
    throw new Error('Erro na comunicação com eSocial. Tente novamente.');
  }
};

/**
 * Simula cálculo de encargos trabalhistas
 * @param {number} grossAmount - Valor bruto
 * @param {number} hoursWorked - Horas trabalhadas
 * @returns {Object} Breakdown dos encargos
 */
export const calculateTaxes = (grossAmount, hoursWorked) => {
  // Cálculos baseados em CLT Intermitente
  const inss = grossAmount * 0.08; // 8% para o trabalhador
  const fgts = grossAmount * 0.08; // 8% FGTS
  const irrf = calculateIRRF(grossAmount);
  const netAmount = grossAmount - inss - irrf;
  
  return {
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    inss: parseFloat(inss.toFixed(2)),
    fgts: parseFloat(fgts.toFixed(2)),
    irrf: parseFloat(irrf.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2)),
    hoursWorked: hoursWorked,
    breakdown: {
      descricao: 'Pagamento CLT Intermitente',
      salarioBruto: grossAmount,
      descontos: {
        inss: inss,
        irrf: irrf,
        total: inss + irrf
      },
      encargosEmpregador: {
        fgts: fgts,
        inssPatronal: grossAmount * 0.20,
        total: fgts + (grossAmount * 0.20)
      }
    }
  };
};

/**
 * Calcula IRRF simplificado
 */
const calculateIRRF = (amount) => {
  if (amount <= 2112.00) return 0;
  if (amount <= 2826.65) return amount * 0.075 - 158.40;
  if (amount <= 3751.05) return amount * 0.15 - 370.40;
  if (amount <= 4664.68) return amount * 0.225 - 651.73;
  return amount * 0.275 - 884.96;
};

/**
 * Simula processamento de pagamento via PIX
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} Resposta simulada do PIX
 */
export const processPixPayment = async (paymentData) => {
  // Simula delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simula 98% de sucesso
  const success = Math.random() > 0.02;
  
  if (success) {
    const transactionId = `PIX${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      success: true,
      transactionId,
      status: 'APROVADO',
      message: 'Pagamento processado com sucesso',
      timestamp: new Date().toISOString(),
      details: {
        valor: paymentData.amount,
        chavePix: paymentData.pixKey,
        beneficiario: paymentData.recipientName,
        dataHora: new Date().toISOString(),
        comprovante: `https://pix-comprovante.example.com/${transactionId}`,
        e2eId: `E${Date.now()}${Math.random().toString(36).substr(2, 20)}`
      }
    };
  } else {
    throw new Error('Erro no processamento do pagamento PIX. Verifique os dados e tente novamente.');
  }
};

/**
 * Simula validação de biometria facial
 * @param {Object} biometryData - Dados da biometria (simulado com webcam)
 * @returns {Promise<Object>} Resultado da validação
 */
export const validateBiometry = async (biometryData) => {
  // Simula processamento de IA
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simula 92% de sucesso na validação
  const success = Math.random() > 0.08;
  const confidence = success ? 0.85 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4;
  
  if (success) {
    return {
      success: true,
      matched: true,
      confidence: parseFloat(confidence.toFixed(2)),
      message: 'Biometria validada com sucesso',
      timestamp: new Date().toISOString(),
      biometryId: `BIO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      details: {
        faceDetected: true,
        liveness: true, // Prova de vida
        quality: 'HIGH',
        coordinates: {
          latitude: biometryData.latitude,
          longitude: biometryData.longitude
        }
      }
    };
  } else {
    return {
      success: false,
      matched: false,
      confidence: parseFloat(confidence.toFixed(2)),
      message: 'Falha na validação biométrica. Tente novamente em melhor iluminação.',
      timestamp: new Date().toISOString(),
      details: {
        faceDetected: true,
        liveness: false,
        quality: 'LOW'
      }
    };
  }
};

/**
 * Simula captura de biometria (para usar com webcam)
 * @param {string} userId - ID do usuário
 * @param {Object} location - Localização atual
 * @returns {Promise<Object>} Dados da captura
 */
export const captureBiometry = async (userId, location) => {
  // Simula captura de imagem
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    userId,
    captureId: `CAP-${Date.now()}`,
    timestamp: new Date().toISOString(),
    imageData: 'data:image/jpeg;base64,SIMULATED_IMAGE_DATA', // Em produção seria a imagem real
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy
    },
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform
    }
  };
};

/**
 * Gera contrato CLT Intermitente em formato PDF simulado
 * @param {Object} contractData - Dados para o contrato
 * @returns {Promise<Object>} URL do contrato gerado
 */
export const generateContract = async (contractData) => {
  // Simula geração de PDF
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const contractId = `CONT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    contractId,
    documentUrl: `https://storage.picopro.com/contracts/${contractId}.pdf`,
    generatedAt: new Date().toISOString(),
    data: {
      empregador: contractData.company,
      empregado: contractData.professional,
      funcao: contractData.role,
      salarioHora: contractData.hourlyRate,
      dataInicio: contractData.startDate,
      dataFim: contractData.endDate,
      local: contractData.location,
      clausulas: [
        'Este contrato é regido pela Lei 13.467/2017 (Reforma Trabalhista)',
        'Modalidade: CLT Intermitente',
        'Pagamento mediante convocação e prestação de serviço',
        'Recolhimento de INSS, FGTS e demais encargos conforme legislação'
      ]
    }
  };
};

/**
 * Valida dados de background check
 * @param {string} cpf - CPF do profissional
 * @returns {Promise<Object>} Resultado da verificação
 */
export const checkBackground = async (cpf) => {
  // Simula consulta a bases de dados
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simula 90% de aprovação
  const approved = Math.random() > 0.10;
  
  return {
    success: true,
    approved,
    cpf,
    checkedAt: new Date().toISOString(),
    checks: {
      antecedentes_criminais: approved ? 'LIMPO' : 'PENDENTE',
      dividas_trabalhistas: approved ? 'NENHUMA' : 'ENCONTRADAS',
      cpf_regular: true,
      score: approved ? 850 + Math.floor(Math.random() * 150) : 300 + Math.floor(Math.random() * 200)
    },
    message: approved 
      ? 'Profissional aprovado em todas as verificações'
      : 'Pendências encontradas. Análise manual necessária.'
  };
};

/**
 * Envia notificação push simulada
 * @param {string} userId - ID do usuário
 * @param {Object} notification - Dados da notificação
 * @returns {Promise<Object>} Confirmação de envio
 */
export const sendPushNotification = async (userId, notification) => {
  // Simula envio via Firebase/OneSignal
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    notificationId: `NOTIF-${Date.now()}`,
    userId,
    sentAt: new Date().toISOString(),
    delivered: true,
    notification: {
      title: notification.title,
      body: notification.message,
      data: notification.data
    }
  };
};

/**
 * Calcula distância entre dois pontos (Haversine formula)
 * @param {number} lat1 - Latitude ponto 1
 * @param {number} lon1 - Longitude ponto 1
 * @param {number} lat2 - Latitude ponto 2
 * @param {number} lon2 - Longitude ponto 2
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calcula score de matching entre profissional e vaga
 * @param {Object} professional - Dados do profissional
 * @param {Object} job - Dados da vaga
 * @returns {number} Score de 0 a 100
 */
export const calculateMatchScore = (professional, job) => {
  let score = 0;
  
  // Habilidades (40 pontos)
  const matchingSkills = job.required_skills.filter(skill => 
    professional.skills.includes(skill)
  );
  score += (matchingSkills.length / job.required_skills.length) * 40;
  
  // Certificações (30 pontos)
  if (job.required_certifications && job.required_certifications.length > 0) {
    const matchingCerts = job.required_certifications.filter(cert =>
      professional.certifications.includes(cert)
    );
    score += (matchingCerts.length / job.required_certifications.length) * 30;
  } else {
    score += 30; // Se não requer certificações, pontuação máxima
  }
  
  // Distância (20 pontos) - quanto mais perto, melhor
  const distance = calculateDistance(
    professional.latitude,
    professional.longitude,
    job.latitude,
    job.longitude
  );
  const distanceScore = Math.max(0, 20 - (distance / job.max_distance_km) * 20);
  score += distanceScore;
  
  // Rating (10 pontos)
  score += (professional.rating / 5) * 10;
  
  return Math.round(Math.min(100, score));
};

export default {
  sendToESocial,
  calculateTaxes,
  processPixPayment,
  validateBiometry,
  captureBiometry,
  generateContract,
  checkBackground,
  sendPushNotification,
  calculateDistance,
  calculateMatchScore
};
