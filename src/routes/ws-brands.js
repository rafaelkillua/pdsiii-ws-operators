const brandsController = require('../controllers/ws-brands')

const baseURL = '/ws-brands/v1/'

module.exports = app => {

  /** 
   * @api {GET} /ws-brands/v1/status Brands - Status da API
   * @apiVersion 0.0.1
   * @apiDescription Verifica a disponibilidade da API
   * @apiGroup Recursos Abertos
   * 
   * @apiSuccess {String} status Resultado da disponibilidade do servidor.
   * 
   * @apiSuccessExample [JSON] Success-Response
   * {
   *   'status': 'Serviço disponível WS2'
   * }
   *  
  */
  app.get(`${baseURL}status`, brandsController.status)

  /**
   * @api {GET} /ws-brands/v1/installments-limit/:bandeira Brands - Limite de parcelas
   * @apiVersion 0.0.1
   * @apiDescription Verifica a quantidade permitida de parcelas em uma compra a partir da bandeira informada.
   * @apiGroup Recursos Autenticados
   * 
   * @apiParam {String} brand Nome da bandeira segundo opções a seguir: mister (12 parcelas), vista (6 parcelas) e daciolo (4 parcelas)
   * 
   * @apiSuccess {String} bandeira Bandeira requisitada.
   * @apiSuccess {Number} limite_parcelas Limite de parcelas que a bandeira aceita.
   * @apiSuccess {Object} operadores_permitidos Conjunto de operadores que tem relação com a bandeira.
   * 
   * @apiSuccessExample [JSON] Resposta-Sucesso
   * {
   *   "bandeira": "mister",
   *   "limite_parcelas": 12,
   *   "operadores_permitidos": {
   *     "op-01": true,
   *     "op-02": true,
   *     "op-03": true
   *   }
   * }
   * 
   * @apiError (400) {String} resposta Resposta resultado.
   * @apiError (400) {String} detalhes Detalhes do erro
   * 
   * @apiErrorExample [JSON] Resposta-Erro
   * {
   *   "resposta": "erro",
   *   "detalhes": "A bandeira informada não existe"
   * }
   *  
  */
  app.get(`${baseURL}installments-limit/:bandeira`, brandsController.installmentsLimit)

  /**
   * @api {POST} /ws-brands/v1/pay/:bandeira Brands - Recebe dados para pagamento
   * @apiVersion 0.0.1
   * @apiDescription Envia para a bandeira do cartão a solicitação de pagamento.
   * @apiGroup Recursos Autenticados
   * 
   * @apiParam {String} numero_cartao Número do cartão de crédito. O segundo conjunto de números
   * @apiParam {String} nome_cliente Nome do titular do cartão de crédito.
   * @apiParam {String} bandeira Nome da bandeira segundo opções a seguir: mister (cod.: 1111), vista (cod.: 2222) ou daciolo (cod.: 3333).
   * @apiParam {Number} cod_seguranca Código de três dígitos.
   * @apiParam {Number} valor_em_centavos Valor em centavos da compra.
   * @apiParam {Number} parcelas Quantidade de parcelas para o pagamento.
   * @apiParam {String} cod_operadora Código único da operadora de cartão. Será usado para que a bandeira verifique se o operador é seu cliente.
   * 
   * @apiParamExample [JSON] Exemplo Corpo da Requisição
   * {
   *   "numero_cartao": "1111.2222.3333.4444",
   *   "nome_cliente": "USUARIO DA SILVA",
   *   "bandeira": "mister",
   *   "cod_seguranca": 111,
   *   "valor_em_centavos": 500,
   *   "parcelas": 12,
   *   "cod_operadora": "op-xx"
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
   * @apiError (400) {String} cod_resposta Código de resposta da transação. operadora-negada para a operadora não autorizada a trabalhar com a bandeira.
   * @apiError (400) {String} resposta Resultado da transação.
   * @apiError (400) {String} detalhes Detalhes do erro
   * @apiError (400) {String} cod_operadora Código da operadora de cartão.
   * 
   * @apiErrorExample [JSON] Resposta-Erro-Operadora-Negada
   * {
   *   "cod_resposta": "operadora-negada",
   *   "resposta": "falha",
   *   "detalhes": "Operadora sem relação com a bandeira",
   *   "cod_operadora": "op-xx"
   * }
   *  
  */
 app.post(`${baseURL}pay/:bandeira`, brandsController.pay)
}
