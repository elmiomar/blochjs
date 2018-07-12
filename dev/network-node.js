var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var requestPromise = require("request-promise");
var uuidv1 = require("uuid/v1");
const nodeAddress = uuidv1()
  .split("-")
  .join("");
const Blockchain = require("./blockchain");
const somecoin = new Blockchain(); // some blockchain instance

// port to be used
const port = process.argv[2];

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// register a node and broadcast it to the whole network
app.post("/register-and-broadcast-node", function(req, res) {
  const newNodeURL = req.body.newNodeURL;
  // check that the node does not exist before adding it
  const nodeExists = somecoin.networkNodes.indexOf(newNodeURL) != -1;
  if (!nodeExists) somecoin.networkNodes.push(newNodeURL);

  const regNodesPromises = [];
  somecoin.networkNodes.forEach(function(networkNodeURL) {
    const reqOptions = {
      uri: networkNodeURL + "/register-node",
      method: "POST",
      body: {
        newNodeURL: newNodeURL
      },
      json: true
    };
    regNodesPromises.push(requestPromise(reqOptions));
  });

  Promise.all(regNodesPromises)
    .then(function(data) {
      const bulkRegisterOptions = {
        uri: newNodeURL + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...somecoin.networkNodes, somecoin.currentNodeURL]
        },
        json: true
      };
      requestPromise(bulkRegisterOptions);
    })
    .then(function(data) {
      res.json({ message: "node registered  with network successfully." });
    });
});

// register one node
app.post("/register-node", function(req, res) {
  const newNodeURL = req.body.newNodeURL;
  // check if node
  const nodeExists = somecoin.networkNodes.indexOf(newNodeURL) != -1;
  const isCurrentNode = somecoin.currentNodeURL === newNodeURL;
  if (!nodeExists && !isCurrentNode) somecoin.networkNodes.push(newNodeURL);
  res.json({ message: "new node registered successfully" });
});

// this endpoint registers multiple nodes at once
app.post("/register-nodes-bulk", function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(function(networkNodeURL) {
    const nodeExists = somecoin.networkNodes.indexOf(networkNodeURL) != -1;
    const isCurrentNode = somecoin.currentNodeURL === networkNodeURL;
    if (!nodeExists && !isCurrentNode)
      somecoin.networkNodes.push(networkNodeURL);
  });
  res.json({ message: "bulk of nodes registred successfully" });
});

app.get("/blockchain", function(req, res) {
  res.send(somecoin);
});

app.post("/transaction", function(req, res) {
  const transaction = req.body.newTransaction;
  const blockIndex = somecoin.addTransactionToPendingTransactions(transaction);

  res.json({ message: `transaction will be added to block ${blockIndex}` });
});

app.post("/transaction/broadcast", function(req, res) {
  let amount = req.body.amount;
  let sender = req.body.sender;
  let recipient = req.body.recipient;
  const newTransaction = somecoin.createNewTransaction(
    amount,
    sender,
    recipient
  );

  somecoin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  somecoin.networkNodes.forEach(function(networkNodeURL) {
    const reqOptions = {
      uri: networkNodeURL + "/transaction",
      method: "POST",
      body: {
        newTransaction: newTransaction
      },
      json: true
    };
    requestPromises.push(requestPromise(reqOptions));
  });

  Promise.all(requestPromises).then(function(data) {
    res.json({ message: "transaction created and broadcasted successfully." });
  });
});

app.get("/mine", function(req, res) {
  const lastBlock = somecoin.getLastBlock();
  const previousBlockHash = lastBlock.hash;
  const currentBlockData = {
    transactions: somecoin.pendingTransactions,
    index: lastBlock.index + 1
  };
  const nonce = somecoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = somecoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  // create a new block in the chain
  const newBlock = somecoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  somecoin.networkNodes.forEach(function(networkNodeURL) {
    const requestOptions = {
      uri: networkNodeURL + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true
    };

    requestPromises.push(requestPromise(requestOptions));
  });

  Promise.all(requestPromises)
    .then(function(data) {
      const requestOptions = {
        uri: somecoin.currentNodeURL + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 15,
          sender: "00",
          recipient: nodeAddress
        },
        json: true
      };
      return requestPromise(requestOptions);
    })
    .then(function(data) {
      res.json({
        message: "block mined and broadcast successfully!",
        block: newBlock
      });
    });
});

app.post("/receive-new-block", function(req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = somecoin.getLastBlock();
  const legitHash = lastBlock.hash === newBlock.previousBlockHash;
  const legitIndex = lastBlock.index + 1 === newBlock.index;

  if (legitHash && legitIndex) {
    somecoin.chain.push(newBlock);
    somecoin.pendingTransactions = [];

    // send back positive response
    res.json({
      message: "new block received and accepted",
      newBlock: newBlock
    });
  } else {
    // send back negative response
    res.json({
      message: "new block received and rejected",
      newBlock: newBlock
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}...`);
});
