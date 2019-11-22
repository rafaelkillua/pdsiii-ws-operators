const query = require('../database/mysql')
const { format, getDate, setDate, getMonth, setMonth, addMonths } = require('date-fns')

module.exports = {
  status: (req, res) => {
    return res.status(200).json({ status: 'Serviço disponível WS3' })
  },
  
  pay: async (req, res) => {
    const { numero_cartao, nome_cliente, bandeira, cod_seguranca, valor_em_centavos, parcelas } = req.body

    // Pegar o cartão
    let cartao
    try {
      cartao = await query(`select * from tb_cartao where 
                            numero = ? and
                            nome_cliente = ? and
                            cod_seguranca = ? and
                            bandeira = ?`, [numero_cartao, nome_cliente, cod_seguranca, bandeira])
      if (!cartao[0]) throw new Error('erro - cartão inexistente')
      cartao = cartao[0]
    } catch (error) {
      return res.status(400).json({
        resposta: error.message,
        nome_cliente,
        valor_em_centavos,
        parcelas
      })
    }
    
    try {
      // Checar limite
      let compras
      compras = await query('select sum(valor_em_centavos) as total from tb_compra where tb_cartao_id = ?', [cartao.id])
      compras = compras[0]

      if (valor_em_centavos <= cartao.limite_em_centavos - compras.total) {
        // Criar compra
        // const dataCompra = new Date(2020, 3, 3)
        const dataCompra = new Date()
        const compra = {
          tb_cartao_id: cartao.id,
          data: format(dataCompra, 'yyyy-MM-dd'),
          valor_em_centavos
        }
        const compraId = (await query('insert into tb_compra(tb_cartao_id, data, valor_em_centavos) values (?, ?, ?)', [compra.tb_cartao_id, compra.data, compra.valor_em_centavos])).insertId
        
        // Definir as datas da primeira fatura
        let dataInicioPrimeiraFatura = setDate(dataCompra, cartao.dia_fechamento_fatura + 1)
        const dataFinalPrimeiraFatura = addMonths(setDate(dataInicioPrimeiraFatura, cartao.dia_fechamento_fatura), 1)
        if (getDate(dataCompra) < cartao.dia_fechamento_fatura) {
          dataInicioPrimeiraFatura = setMonth(dataInicioPrimeiraFatura, getMonth(dataCompra) - 1)
        }

        const faturas = await query(`select * from tb_fatura where
                                    tb_cartao_id = ? and 
                                    data_inicial >= ?`, [cartao.id, format(dataInicioPrimeiraFatura, 'yyyy-MM-dd')])

        const valorParcela = Math.round(valor_em_centavos/parcelas)
        for(let i = 0; i < parcelas; i++) {
          // Iterar sobre as parcelas
          let fatura
          let isNewFatura
          if (faturas[i]) {
            fatura = faturas[i]
            isNewFatura = false
          } else {
            fatura = {
              tb_cartao_id: cartao.id,
              data_inicial: format(addMonths(dataInicioPrimeiraFatura, i), 'yyyy-MM-dd'),
              data_final: format(addMonths(dataFinalPrimeiraFatura, i), 'yyyy-MM-dd')
            }
            isNewFatura = true
          }

          // Criar fatura nova, se precisar, ou usar a existente
          let faturaId
          if (isNewFatura) {
            faturaId = (await query('insert into tb_fatura(tb_cartao_id, data_inicial, data_final) values (?, ?, ?)', 
                        [fatura.tb_cartao_id, fatura.data_inicial, fatura.data_final])).insertId
          } else {
            faturaId = fatura.id
          }

          // Criar parcela
          const parcela = {
            tb_compra_id: compraId,
            tb_fatura_id: faturaId,
            valor_em_centavos: valorParcela
          }
          await query('insert into tb_parcela(tb_compra_id, tb_fatura_id, valor_em_centavos) values (?, ?, ?)', 
                        [parcela.tb_compra_id, parcela.tb_fatura_id, parcela.valor_em_centavos])
        }
        
        return res.status(200).json({
          resposta: "sucesso",
          nome_cliente,
          valor_em_centavos,
          parcelas
        })
      } else {
        return res.status(400).json({
          resposta: 'erro - cartão sem limite',
          nome_cliente,
          valor_em_centavos,
          parcelas
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
}
