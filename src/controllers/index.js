module.exports = {
  status: (req, res) => {
    return res.status(200).json({ status: 'Serviço disponível WS1' })
  },
  
  pay: async (req, res) => {
    const regras = require('../resources/constants.json')
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

    return res.status(200).json({ message: 'opa irmao, dando certo ai!' })
  }
}