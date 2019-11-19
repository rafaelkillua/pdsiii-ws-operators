const banksController = require('../controllers/ws-banks')

const baseURL = '/ws-banks/v1/'

module.exports = app => {

  /** 
   * @api {GET} /ws-banks/v1/status Banks - Status da API
   * @apiVersion 0.0.1
   * @apiDescription Verifica a disponibilidade da API
   * @apiGroup Recursos Abertos
   * 
   * @apiSuccess {String} status Resultado da disponibilidade do servidor.
   * 
   * @apiSuccessExample [JSON] Success-Response
   * {
   *   'status': 'Serviço disponível WS3'
   * }
   *  
  */
  app.get(`${baseURL}status`, banksController.status)

  /**
   * @api {POST} /ws-banks/v1/pay/ Banks - Recebe dados para pagamento
   * @apiVersion 0.0.1
   * @apiDescription Envia para o NaNBank os dados da compra e cartão para cadastro da despesa no cadastro do cliente.
   * @apiGroup Recursos Autenticados
   * 
   * @apiParam {String} numero_cartao Número do cartão de crédito. O segundo conjunto de números.
   * @apiParam {String} nome_cliente Nome do titular do cartão de crédito.
   * @apiParam {String} bandeira Nome da bandeira segundo opções a seguir: mister (cod.: 1111), vista (cod.: 2222) ou daciolo (cod.: 3333).
   * @apiParam {Number} cod_seguranca Código de três dígitos.
   * @apiParam {Number} valor_em_centavos Valor em centavos da compra.
   * @apiParam {Number} parcelas Quantidade de parcelas para o pagamento.
   * 
   * @apiParamExample [JSON] Exemplo Corpo da Requisição
   * {
   *   "numero_cartao": "1111.2222.3333.4444",
   *   "nome_cliente": "USUARIO DA SILVA",
   *   "bandeira": "mister",
   *   "cod_seguranca": 111,
   *   "valor_em_centavos": 500,
   *   "parcelas": 12
   * }
   * 
   * @apiSuccess {String} resposta Resultado da transação.
   * @apiSuccess {String} nome_cliente Nome do titular do cartão de crédito.
   * @apiSuccess {Number} valor_em_centavos Valor em centavos da compra.
   * @apiSuccess {Number} parcelas Quantidade de parcelas em que o pagamento foi feito.
   * 
   * @apiSuccessExample [JSON] Exemplo-Resposta-Sucesso
   * {
   *   "resposta": "sucesso",
   *   "nome_cliente": "USUARIO DE SOUSA",
   *   "valor_em_centavos": 500,
   *   "parcelas": 12
   * }
   * 
  */
  app.post(`${baseURL}pay`, banksController.pay)
}
