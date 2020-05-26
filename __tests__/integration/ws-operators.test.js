const app = require('../../src/app')
const supertest = require('supertest')
const { connection, query } = require('../../src/database/mysql')

const request = supertest(app)
const baseRoute = '/ws-operators/v1'

// Dados que devem retornar success
const operatorOk = 'op-01'
const bodyOk = {
  numero_cartao: '1111.2222.2222.2222',
  nome_cliente: 'TESTE JEST',
  bandeira: 'mister',
  cod_seguranca: 333,
  valor_em_centavos: 5000,
  parcelas: 12,
  cod_loja: 'loja-01'
}
let id_cliente
const dia_fechamento_fatura = 3
const limite_em_centavos = 7500

beforeAll(async done => {
  // Criar usuário
  const clientes = await query('select * from tb_cliente where nome = ?', [bodyOk.nome_cliente])
  if (clientes.length === 0) {
    const { insertId } = await query('insert into tb_cliente (nome) values (?)', [bodyOk.nome_cliente])
    id_cliente = insertId
  } else {
    id_cliente = clientes[0].id
  }
  // Criar cartão
  const cartoes = await query('select * from tb_cartao cart join tb_cliente cli on cart.tb_cliente_id = cli.id where cli.id = ?', [id_cliente])
  if (cartoes.length === 0) {
    await query(
      'insert into tb_cartao (tb_cliente_id, numero, nome_cliente, bandeira, cod_seguranca, limite_em_centavos, dia_fechamento_fatura) values (?, ?, ?, ?, ?, ?, ?)',
      [id_cliente, bodyOk.numero_cartao, bodyOk.nome_cliente, bodyOk.bandeira, bodyOk.cod_seguranca, limite_em_centavos, dia_fechamento_fatura]
    )
  }
  done()
})

beforeEach(async done => {
  const response = await request
    .get(`${baseRoute}/status`)
    .set('Accept', 'application/json')
  expect(response.status).toBe(200)
  expect(response.body).toEqual({
    status: 'Serviço disponível WS1'
  })
  done()
})

afterAll(async done => {
  await query('delete from tb_parcela')
  await query('delete from tb_fatura')
  await query('delete from tb_compra')
  connection.destroy()
  done()
})

describe('Operação não existente', () => {
  it('Deve dar erro pois op-04 não existe', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-04`)
      .set('Accept', 'application/json')
      .send(bodyOk)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Operadora não existe',
      operadora: 'op-04'
    })

    done()
  })

  it('Deve dar erro pois op-05 não existe', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-05`)
      .set('Accept', 'application/json')
      .send(bodyOk)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Operadora não existe',
      operadora: 'op-05'
    })

    done()
  })
})

describe('Bandeira não existente', () => {
  it('Deve dar erro pois bandeirainvalida não existe', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'bandeirainvalida'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: operatorOk,
      bandeira: 'bandeirainvalida'
    })

    done()
  })

  it('Deve dar erro pois bandeiraestrangeira não existe', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'bandeiraestrangeira'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: operatorOk,
      bandeira: 'bandeiraestrangeira'
    })

    done()
  })
})

describe('Lojas não suportadas pelas operadoras', () => {
  it('Deve dar erro pois op-02 não suporta loja-01', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-02`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'vista'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Loja não autorizada',
      operadora: 'op-02',
      cod_loja: 'loja-01'
    })

    done()
  })

  it('Deve dar erro pois op-02 não suporta loja-03', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-02`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'vista',
        cod_loja: 'loja-03'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Loja não autorizada',
      operadora: 'op-02',
      cod_loja: 'loja-03'
    })

    done()
  })

  it('Deve dar erro pois op-03 não suporta loja-01', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-03`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'daciolo'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Loja não autorizada',
      operadora: 'op-03',
      cod_loja: 'loja-01'
    })

    done()
  })

  it('Deve dar erro pois op-03 não suporta loja-02', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-03`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'daciolo',
        cod_loja: 'loja-02'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Loja não autorizada',
      operadora: 'op-03',
      cod_loja: 'loja-02'
    })

    done()
  })
})

describe('Bandeira não suportada pela operadora', () => {
  it('Deve dar erro pois op-02 não suporta bandeira mister', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-02`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'mister',
        cod_loja: 'loja-02'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: 'op-02',
      bandeira: 'mister'
    })

    done()
  })

  it('Deve dar erro pois op-02 não suporta bandeira daciolo', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-02`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'daciolo',
        cod_loja: 'loja-02'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: 'op-02',
      bandeira: 'daciolo'
    })

    done()
  })

  it('Deve dar erro pois op-03 não suporta bandeira mister', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-03`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'mister',
        cod_loja: 'loja-03'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: 'op-03',
      bandeira: 'mister'
    })

    done()
  })

  it('Deve dar erro pois op-03 não suporta bandeira vista', async done => {
    const response = await request
      .post(`${baseRoute}/pay/op-03`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'vista',
        cod_loja: 'loja-03'
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não autorizada',
      operadora: 'op-03',
      bandeira: 'vista'
    })

    done()
  })
})

describe('Quantidade de parcelas não suportado pela bandeira', () => {
  it('Deve dar erro pois bandeira mister suporta, no máximo, 12 parcelas', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        parcelas: 13
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não permite essa quantidade de parcelas',
      parcelas: 13,
      bandeira: 'mister'
    })

    done()
  })

  it('Deve dar erro pois bandeira vista suporta, no máximo, 6 parcelas', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'vista',
        parcelas: 7
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não permite essa quantidade de parcelas',
      parcelas: 7,
      bandeira: 'vista'
    })

    done()
  })

  it('Deve dar erro pois bandeira daciolo suporta, no máximo, 4 parcelas', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send({
        ...bodyOk,
        bandeira: 'daciolo',
        parcelas: 5
      })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'falha',
      detalhes: 'Bandeira não permite essa quantidade de parcelas',
      parcelas: 5,
      bandeira: 'daciolo'
    })

    done()
  })
})

describe('Dados enviados corretamente', () => {
  it('Deve dar certo, pois os dados estão corretos com o banco de dados e o cartão tem limite', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send(bodyOk)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      resposta: 'sucesso',
      nome_cliente: bodyOk.nome_cliente,
      valor_em_centavos: bodyOk.valor_em_centavos,
      parcelas: bodyOk.parcelas
    })

    done()
  })
})

describe('Sem limite no cartão', () => {
  it('Deve dar erro, pois, apesar dos dados estarem corretos, o cartão não tem limite suficiente', async done => {
    const response = await request
      .post(`${baseRoute}/pay/${operatorOk}`)
      .set('Accept', 'application/json')
      .send(bodyOk)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      resposta: 'erro',
      detalhes: 'Cartão sem limite',
      nome_cliente: bodyOk.nome_cliente,
      valor_em_centavos: bodyOk.valor_em_centavos,
      parcelas: bodyOk.parcelas
    })

    done()
  })
})