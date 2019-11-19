let config = {
  baseURL: process.env.WS_BRANDS_BASE_URL
}

const axios = require('axios').create(config)

module.exports = {
  status: () => axios.get('status'),

  installmentsLimit: bandeira => axios.get(`installments-limit/${bandeira}`),
  
  pay: (bandeira, data) => axios.post(`pay/${bandeira}`, data)
}
