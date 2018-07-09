const sha256 = require('sha256');

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  // the new block to create
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(), // when this block was created
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash, // this is the results of hashing the data (updated transactions) from this new block
    previousBlockHash: previousBlockHash // the previous block hash, i.e. hash of previous block in the chain
  };

  // clear out all the new transactions in the chain, because all the new transactions
  // will be stored the new block that has been created
  this.pendingTransactions = [];
  // push the new block in the chain
  this.chain.push(newBlock);

  return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function(amount, sender, recepient) {
    // new transaction to be created
    const newTransaction = {
        amount: amount,
        sender: sender,
        recepient:recepient
    }

    // push to pending transactions
    this.pendingTransactions.push(newTransaction);

    // return the index of the block where the pending transactions should go
    return this.getLastBlock()['index'] + 1;
}

// function to hash the blocks
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataToString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataToString);
    return hash;
}


module.exports = Blockchain;
