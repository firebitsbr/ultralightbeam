const ultralightbeam = require('./ultralightbeam')
const SolDeployTransactionRequest = require('../lib/SolDeployTransactionRequest')
const solc = require('solc')
const Amorph = require('../lib/Amorph')
const SolWrapper = require('../lib/SolWrapper')
const amorphParseSolcOutput = require('amorph-parse-solc-output')
const _ = require('lodash')

require('./parseTransactionReceipt')

const arrayValContract = {
  sol: `pragma solidity ^0.4.4;
        contract ArrayVal {
          uint[] uints;
          bool[] bools;

          function setUints(uint[] _uints) {
            uints = _uints;
          }

          function getUints() constant returns(uint[]){
            return uints;
          }

          function setUintsAndBools(uint[] _uints, bool[] _bools) {
            uints = _uints;
            bools = _bools;
          }

          function getUintsAndBools() constant returns(uint[], bool[]) {
            return (uints, bools);
          }

          function getUintsAndBoolsWithNames() constant returns(uint[] myUints, bool[] myBools) {
            return (uints, bools);
          }
        }`
}

_.merge(arrayValContract, amorphParseSolcOutput(solc.compile(arrayValContract.sol, 1)).ArrayVal)

describe('arrayValContract', () => {
  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      arrayValContract.code, arrayValContract.abi, []
    )
    return ultralightbeam.sendTransaction(transactionRequest).getTransactionReceipt().then((
      transactionReceipt
    ) => {
      arrayValContract.address = transactionReceipt.contractAddress
      arrayValContract.SolWrapper = new SolWrapper(
        ultralightbeam, arrayValContract.abi, arrayValContract.address
      )
    })
  })

  it('should have correct code', () => {
    return ultralightbeam.eth.getCode(arrayValContract.address).should.eventually.amorphEqual(
      arrayValContract.runcode, 'hex'
    )
  })

  it('should getUints() as []', () => {
    return arrayValContract.SolWrapper.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(0)
    })
  })

  it('should getUintsAndBools() as [[],[]]', () => {
    return arrayValContract.SolWrapper.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(0)
      values[1].should.have.length(0)
    })
  })

  it('should setUints([0, 1, 2])', () => {
    return arrayValContract.SolWrapper.broadcast('setUints(uint256[])', [
      [
        new Amorph(0, 'number'),
        new Amorph(1, 'number'),
        new Amorph(2, 'number')
      ]
    ]).transactionPromise
  })

  it('should getUints() values [0, 1, 2]', () => {
    return arrayValContract.SolWrapper.fetch('getUints()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(3)
      values[0].should.amorphTo('number').equal(0)
      values[1].should.amorphTo('number').equal(1)
      values[2].should.amorphTo('number').equal(2)
    })
  })

  it('should setUintsAndBools([3, 4, 5], [false, true])', () => {
    return arrayValContract.SolWrapper.broadcast('setUintsAndBools(uint256[],bool[])', [
      [
        new Amorph(3, 'number'),
        new Amorph(4, 'number'),
        new Amorph(5, 'number')
      ],
      [
        new Amorph(false, 'boolean'),
        new Amorph(true, 'boolean')
      ]
    ]).transactionPromise
  })

  it('should getUintsAndBools() values [[3, 4, 5], [false, true]]', () => {
    return arrayValContract.SolWrapper.fetch('getUintsAndBools()', []).then((values) => {
      values.should.be.instanceOf(Array)
      values.should.have.length(2)
      values[0].should.be.instanceOf(Array)
      values[1].should.be.instanceOf(Array)
      values[0].should.have.length(3)
      values[1].should.have.length(2)

      values[0][0].should.amorphTo('number').equal(3)
      values[0][1].should.amorphTo('number').equal(4)
      values[0][2].should.amorphTo('number').equal(5)

      values[1][0].should.amorphTo('boolean').equal(false)
      values[1][1].should.amorphTo('boolean').equal(true)
    })
  })

  it('should getUintsAndBoolsWithNames() values { myUints: [3, 4, 5], myBools: [false, true] }', () => {
    return arrayValContract.SolWrapper.fetch('getUintsAndBoolsWithNames()', []).then((values) => {
      values.should.have.keys(['myUints', 'myBools'])

      values.myUints.should.be.instanceOf(Array)
      values.myBools.should.be.instanceOf(Array)

      values.myUints.should.have.length(3)
      values.myBools.should.have.length(2)

      values.myUints[0].should.amorphTo('number').equal(3)
      values.myUints[1].should.amorphTo('number').equal(4)
      values.myUints[2].should.amorphTo('number').equal(5)

      values.myBools[0].should.amorphTo('boolean').equal(false)
      values.myBools[1].should.amorphTo('boolean').equal(true)
    })
  })
})

module.exports = arrayValContract
