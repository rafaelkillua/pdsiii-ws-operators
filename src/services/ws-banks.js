let config = {
  baseURL: process.env.WS_BANKS_BASE_URL
}

const axios = require('axios').create(config)

module.exports = {
  status: () => axios.get('status'),
  
  pay: data => axios.post(`pay`, data)
}
