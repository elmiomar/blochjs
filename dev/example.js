const Blockchain = require('./blockchain');

const litecoin = new Blockchain();

// create first block
litecoin.createNewBlock(1234,'fasdrftasdtfuyatdfa2', '5asdr6tasd8duy3tdfau');

// create a new transaction
litecoin.createNewTransaction(100, 'yin-fadfasdgsafgfgasf', 'yan-asdgfgafgsgergrtg');

// mine a block, where the pending transactions should go
litecoin.createNewBlock(1236, 'fasdgafgaegeag', 'fadfasdgagsdggas');

litecoin.createNewTransaction(100, 'yin-fadfasdgsafgfgasf', 'yan-asdgfgafgsgergrtg');
litecoin.createNewTransaction(200, 'yin-fadfasdgsafgfgasf', 'yan-asdgfgafgsgergrtg');
litecoin.createNewTransaction(300, 'yin-fadfasdgsafgfgasf', 'yan-asdgfgafgsgergrtg');

litecoin.createNewBlock(1237, 'fasdgafgaegeag', 'fadfasdgagsdggas');

// log chain
console.log(litecoin.chain[2]);

// log last block
// console.log(litecoin.getLastBlock());