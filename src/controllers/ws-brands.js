const BankService = require('../services/ws-banks')

module.exports = {
  status: (req, res) => {
    return res.status(200).json({ status: 'Serviço disponível WS2' })
  },
  
  installmentsLimit: async (req, res) => {
    const { operadores, parcelas } = require('../resources/constants.js')
    const { bandeira } = req.params
    const limite_parcelas = parcelas[bandeira]

    if (!limite_parcelas) {
      return res.status(400).json({ 
        resposta: 'erro',
        detalhes: 'A bandeira informada não existe'
      })
    }

    const operadores_permitidos = {}
    Object.entries(operadores).forEach(
      ([key, value]) => 
        value.bandeirasAutorizadas.includes(bandeira) ? operadores_permitidos[key] = true : null
    )

    return res.status(200).json({ 
      bandeira,
      limite_parcelas,
      operadores_permitidos
    })
  },

  pay: async (req, res) => {
    const regras = require('../resources/constants.js').operadores
    const { bandeira } = req.params
    const { numero_cartao, nome_cliente, cod_seguranca, valor_em_centavos, parcelas, cod_operadora } = req.body
    const dadosOperadora = regras[cod_operadora]

    if (!dadosOperadora.bandeirasAutorizadas.includes(bandeira)) {
      return res.status(400).json({
        cod_resposta: 'operadora-negada',
        resposta: 'falha',
        detalhes: 'Operadora sem relação com a bandeira',
        cod_operadora,
      })
    }

    try {
      const response = (await BankService.pay({
        numero_cartao,
        nome_cliente,
        bandeira,
        cod_seguranca,
        valor_em_centavos,
        parcelas
      }))

      return res.status(200).json(response.data)
    } catch (error) {
      return res.status(400).json(error.response.data)
    }
  }
}