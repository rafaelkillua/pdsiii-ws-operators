let config = {
  baseURL: process.env.WS_OPERATORS_BASE_URL
}

const axios = require('axios').create(config)

module.exports = {
  status: () => axios.get('status'),
  
  pay: (operadora, data) => axios.post(`pay/${operadora}`, data)
}
