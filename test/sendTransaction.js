const ultralightbeam = require('./ultralightbeam')
const TransactionRequest = require('../lib/TransactionRequest')
const storageContractInfo = require('./storageContractInfo')
const accounts = require('./accounts')
const Q = require('q')
const Transaction = require('../lib/Transaction')
const TransactionReceipt = require('../lib/TransactionReceipt')
const TransactionMonitor = require('../lib/TransactionMonitor')
const Amorph = require('amorph')
const amorphNumber = require('amorph-number')
const amorphArray = require('amorph-array')

describe('sendTransaction', () => {

  const balances = []
  let contractAddress1

  it('should get balances', () => {

    const promises = []

    accounts.forEach((account) => {
      const promise = ultralightbeam
        .eth.getBalance(account.address)
        .then((balance) => {
          balances.push(balance)
        })
      promises.push(promise)
    })

    return Q.all(promises)

  })

  let transactionMonitor
  let transactionHash

  it('should send 1 wei from account0 to account1', () => {
    transactionMonitor = new TransactionRequest(ultralightbeam, {
      from: accounts[0],
      to: accounts[1].address,
      value: Amorph.from(amorphNumber.unsigned, 1)
    }).send()
  })

  it('transactionMonitor should be instance of TransactionMonitor', () => {
    transactionMonitor.should.be.instanceOf(TransactionMonitor)
  })

  it('transactionHashPromise should be fulfilled', () => {
    return transactionMonitor.transactionHashPromise.then((_transactionHash) => {
      transactionHash = _transactionHash
    }).should.be.fulfilled
  })

  it('transactionHash should be an Amorph', () => {
    transactionHash.should.be.instanceof(Amorph)
  })

  it('transactionHash should be 32 bytes long', () => {
    transactionHash.to(amorphArray).should.have.length(32)
  })

  it('transactionPromise should eventually return a Transaction', () => {
    return transactionMonitor.transactionPromise.should.eventually.be.instanceOf(Transaction)
  })

  it('getConfirmation() should eventually return a transactionReceipt', () => {
    return transactionMonitor.getTransactionReceipt().should.eventually.be.instanceOf(
      TransactionReceipt
    )
  })

  it('account1 balance should have increased by 1', () => {
    return ultralightbeam.eth.getBalance(accounts[1].address)
    .should.eventually.amorphTo(amorphNumber.unsigned).equal(
      balances[1].to(amorphNumber.unsigned) + 1
    )
  })


  it('should deploy contract', () => {

    const transactionRequest = new TransactionRequest(ultralightbeam, {
      data: storageContractInfo.code,
      gas: Amorph.from(amorphNumber.unsigned, 3141592)
    })

    return transactionRequest.send().getTransactionReceipt().then((
      transactionReceipt
    ) => {
      contractAddress1 = transactionReceipt.contractAddress
    }).should.be.fulfilled

  })

  it('contract address code should be correct', () => {
    return ultralightbeam.eth.getCode(contractAddress1).should.eventually.amorphEqual(
      storageContractInfo.runcode
    )
  })

})
