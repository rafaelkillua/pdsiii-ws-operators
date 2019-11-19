const operatorsController = require('../controllers/ws-operators')

const baseURL = '/ws-operators/v1/'

module.exports = app => {

  /** 
   * @api {GET} /ws-operators/v1/status Operators - Status da API
   * @apiVersion 0.0.1
   * @apiDescription Verifica a disponibilidade da API
   * @apiGroup Recursos Abertos
   * 
   * @apiSuccess {String} status Resultado da disponibilidade do servidor.
   * 
   * @apiSuccessExample [JSON] Success-Response
   * {
   *   'status': 'Serviço disponível WS1'
   * }
   *  
  */
  app.get(`${baseURL}status`, operatorsController.status)

  /**
   * @api {POST} /ws-operators/v1/pay/:operadora Operators - Executa o pagamento via cartão de crédito
   * @apiVersion 0.0.1
   * @apiDescription Envia a solicitação para pagamento via cartão de crédito a operadora de cartão.
   * @apiGroup Recursos Autenticados
   * 
   * @apiParam {String} operator Parâmetro da url que corresponde a operadora de cartão desejado. Deve ser uma das opções a seguir: op-01, op-02 ou op-03.
   * @apiParam {String} numero_cartao Número do cartão de crédito.
   * @apiParam {String} nome_cliente Nome do titular do cartão de crédito.
   * @apiParam {String} bandeira Nome da bandeira segundo opções a seguir: mister (cod.: 1111), vista (cod.: 2222) ou daciolo (cod.: 3333).
   * @apiParam {Number} cod_seguranca Código de três dígitos.
   * @apiParam {Number} valor_em_centavos Valor em centavos da compra.
   * @apiParam {Number} parcelas Quantidade de parcelas para o pagamento.
   * @apiParam {String} cod_loja Código único da loja e-commerce. Será usado para que a operadora de cartão verifique se a loja é sua cliente. Deve ser uma das opções a seguir: loja-01, loja-02 ou loja-03.
   * 
   * @apiParamExample [JSON] Exemplo Corpo da Requisição
   * {
   *   "numero_cartao": "1111.2222.3333.4444",
   *   "nome_cliente": "USUARIO DA SILVA",
   *   "bandeira": "mister",
   *   "cod_seguranca": 111,
   *   "valor_em_centavos": 500,
   *   "parcelas": 12,
   *   "cod_loja": "loja-xx"
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
   * @apiError (400) {String} resposta Resultado da transação.
   * @apiError (400) {String} detalhes Detalhes do erro
   * @apiError (400) {String} operadora Operadora que foi buscado.
   * @apiError (400) {String} cod-loja Loja de onde partiu a compra.
   * @apiError (400) {String} bandeira Bandeira requisitada.
   * @apiError (400) {String} parcelas_solicitadas Quantidade de parcelas solicitadas.
   * @apiError (400) {String} limite_parcelas Limite de parcelas da bandeira.
   * 
   * @apiErrorExample [JSON] Resposta-Erro-Operadora-Inexistente
   * {
   *   "resposta": "falha",
   *   "detalhes": "Operadora não existe",
   *   "operadora": "op-xx"
   * }
   * @apiErrorExample [JSON] Resposta-Erro-Loja-Negada
   * {
   *   "resposta": "falha",
   *   "detalhes": "Loja não autorizada",
   *   "operadora": "op-xx",
   *   "cod-loja": "loja-xx"
   * }
   * @apiErrorExample [JSON] Resposta-Erro-Bandeira-Negada
   * {
   *   "resposta": "falha",
   *   "detalhes": "Bandeira não autorizada",
   *   "operadora": "op-xx",
   *   "bandeira": "mister"
   * }
   * @apiErrorExample [JSON] Resposta-Erro-Parcelas-Não-Aceitas
   * {
   *   "resposta": "falha",
   *   "detalhes": "Limite de parcelas ultrapassado",
   *   "bandeira": "mister"
   *   "parcelas_solicitadas": 00,
   *   "limite_parcelas": 00
   * }
   *  
  */
  app.post(`${baseURL}pay/:operadora`, operatorsController.pay)
}
