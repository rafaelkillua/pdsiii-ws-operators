const BrandsService = require('../services/ws-brands')

module.exports = {
  status: (req, res) => {
    return res.status(200).json({ status: 'Serviço disponível WS1' })
  },
  
  pay: async (req, res) => {
    const regras = require('../resources/constants.js').operadores
    const { operadora } = req.params
    const dadosOperadora = regras[operadora]

    if (!operadora || !dadosOperadora) {
      return res.status(400).json({
        resposta: 'falha',
        detalhes: 'Operadora não existe',
        operadora
      })
    }

    const { numero_cartao, nome_cliente, bandeira, cod_seguranca, valor_em_centavos, parcelas, cod_loja } = req.body
    if (!dadosOperadora.bandeirasAutorizadas.includes(bandeira)) {
      return res.status(400).json({
        resposta: 'falha',
        detalhes: 'Bandeira não autorizada',
        operadora,
        bandeira
      })
    }

    if (!dadosOperadora.lojasAutorizadas.includes(cod_loja)) {
      return res.status(400).json({
        resposta: 'falha',
        detalhes: 'Loja não autorizada',
        operadora,
        cod_loja
      })
    }
    
    let limiteParcelas
    try {
      const response = await BrandsService.installmentsLimit(bandeira)
      limiteParcelas = response.data.limite_parcelas
    } catch (error) {
      return res.status(400).json(error.message)
    }
    if (parcelas > limiteParcelas) {
      return res.status(400).json({
        resposta: 'falha',
        detalhes: 'Bandeira não permite essa quantidade de parcelas',
        parcelas,
        bandeira
      })
    }

    try {
      const response = (await BrandsService.pay(bandeira, {
        numero_cartao,
        nome_cliente,
        cod_seguranca,
        valor_em_centavos,
        parcelas,
        cod_operadora: operadora
      }))

      return res.status(200).json(response.data)
    } catch (error) {
      return res.status(400).json(error.response.data)
    }
  }
}