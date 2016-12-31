const Amorph = require('../lib/Amorph')
const TransactionRequest = require('../lib/TransactionRequest')
const personas = require('../modules/personas')
const personaValidator = require('../lib/validators/persona')
const amorphAddressValidator = require('../lib/validators/amorphAddress')
const transactionRequestFieldValidator = require(
  '../lib/validators/transactionRequestField'
)
const ultralightbeam = require('./ultralightbeam')
const _ = require('lodash')

describe('TransactionRequest', () => {

  let transactionRequest1
  let transactionRequest2

  it('should instantiate with no arguments', () => {
    transactionRequest1 = new TransactionRequest
  })

  it('.toPojo should be blank pojo', () => {
    Object.keys(transactionRequest1.toPojo()).should.have.length(0)
  })

  it('should instantiate with complete arguments', () => {
    transactionRequest2 = new TransactionRequest({
      from: personas[0],
      to: personas[1].address,
      data: new Amorph('01', 'hex'),
      nonce: new Amorph('01', 'hex')
    })
  })

  it('should .toRawSigned()', () => {
    transactionRequest2.toRawSigned().should.be.instanceof(Amorph)
  })

  it('.toPojo should have keys [from, to, data] ', () => {
    transactionRequest2.toPojo().should.have.all.keys('from', 'to', 'data', 'nonce')
  })

  it('should throw validation error with bad from', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest({
        from: new Amorph('01', 'hex')
      })
    }).should.throw(personaValidator.Error)
  })

  it('should throw validation error with bad tp', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest({
        to: new Amorph('01', 'hex')
      })
    }).should.throw(amorphAddressValidator.Error)
  })

  it('should throw validation error with bogus field', () => {
    (() => {
      // eslint-disable-next-line no-new
      new TransactionRequest({
        bogus: new Amorph('01', 'hex')
      })
    }).should.throw(transactionRequestFieldValidator.Error)
  })

})
