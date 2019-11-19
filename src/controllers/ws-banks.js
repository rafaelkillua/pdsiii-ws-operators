module.exports = {
  status: (req, res) => {
    return res.status(200).json({ status: 'Serviço disponível WS3' })
  },
  
  pay: async (req, res) => {
    const { numero_cartao, nome_cliente, bandeira, cod_seguranca, valor_em_centavos, parcelas, cod_loja } = req.body



    return res.status(200).json({ message: 'opa irmao, dando certo ai!' })
  }
}