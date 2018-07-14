const sha256 = require("sha256");
const uuidv1 = require("uuid/v1");
const currentNodeURL = process.argv[3];

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeURL = currentNodeURL;
  this.networkNodes = [];
  // create the genesis block
  // it's fine to pass arbitrary values, ONLY for the first block
  this.createNewBlock(100, "0", "0");
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
};

Blockchain.prototype.createNewTransaction = function(
  amount,
  sender,
  recepient
) {
  // new transaction to be created
  const newTransaction = {
    amount: amount,
    sender: sender,
    recepient: recepient,
    transactionID: uuidv1()
      .split("-")
      .join("")
  };

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(
  transaction
) {
  // push to pending transactions
  this.pendingTransactions.push(transaction);

  // return the index of the block where the pending transactions should go
  return this.getLastBlock().index + 1;
};

// function to hash the blocks
Blockchain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataToString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataToString);
  return hash;
};

Blockchain.prototype.proofOfWork = function(
  previousBlockHash,
  currentBlockData
) {
  // we want to make that every block added is legit
  // every time a block is created we need to prove that it's a legit block
  // that's what this method is about
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  // loop until hash starts with 4 zeros
  while (hash.substring(0, 4) != "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }

  // console.log(hash);
  // return the nonce value that gives the needed hash
  return nonce;
};

// function to check if a blockchain is valid
Blockchain.prototype.chainIsValid = function(blockchain) {
  let validChain = true;

  // iterate through every block in the chain and check if
  // the previous block hash of the current block equals the hash of the previous block
  for (var i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    const blockHash = this.hashBlock(
      previousBlock.hash,
      {
        transactions: currentBlock.transactions,
        index: currentBlock.index
      },
      currentBlock.nonce
    );

    if (blockHash.substring(0, 4) != "0000") validChain = false;

    // console.log("currentBlock.previousBlockHash ==> " + currentBlock.previousBlockHash);
    // console.log("previousBlock.hash             ==> " + previousBlock.hash);

    if (currentBlock.previousBlockHash !== previousBlock.hash)
      validChain = false;
  }

  const genesisBlock = blockchain[0];
  const nonceNotCorrect = genesisBlock.nonce !== 100;
  const previousBlockHashNotCorrect = genesisBlock.previousBlockHash !== "0";
  const hashNotCorrect = genesisBlock.hash !== "0";
  const transactionsNotCorrect = genesisBlock.transactions.length !== 0;

  if (
    nonceNotCorrect ||
    previousBlockHashNotCorrect ||
    hashNotCorrect ||
    transactionsNotCorrect
  )
    validChain = false;

  return validChain;
};

Blockchain.prototype.getBlock = function(blockHach) {
  let correctBlock = null;

  this.chain.forEach(function(block){
    if (blockHach === block.hash) correctBlock = block;
  });

  return correctBlock;
};

Blockchain.prototype.getTransaction = function(transactionId) {
  let correctTransaction = null;
  let correctBlock = null;

  this.chain.forEach(function(block){
    block.transactions.forEach(function(transaction){
      if (transaction.transactionID === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });

  return {
    transaction: correctTransaction,
    block: correctBlock
  };
};


Blockchain.prototype.getAddressData = function(address) {
  let addressTransactions = [];

  this.chain.forEach(function(block){
    block.transactions.forEach(function(transaction){
      if (transaction.sender === address || transaction.recepient === address) {
        addressTransactions.push(transaction);
      }
    });
  });

  let balance = 0;

  addressTransactions.forEach(function(transaction){
    if (transaction.recepient === address) {
      balance += transaction.amount;
    } else if (transaction.sender === address) {
      balance -= transaction.amount;
    }
  });

  return {
    transactions: addressTransactions,
    balance: balance
  };
};

module.exports = Blockchain;
