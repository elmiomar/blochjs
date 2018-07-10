var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var requestPromise = require('request-promise');
var uuidv1 = require('uuid/v1');
const nodeAddress = uuidv1().split('-').join('');
const Blockchain = require('./blockchain');
const somecoin = new Blockchain(); // some blockchain instance

// port to be used
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/register-and-broadcast-node', function (req, res) {
    const newNodeURL = req.body.currentNodeURL;
    // check that the node does not exist before adding it
    const nodePresent = somecoin.networkNodes.indexOf(newNodeURL) != -1;
    if (!nodePresent) somecoin.networkNodes.push(newNodeURL);

    const regNodesPromises = [];
    somecoin.networkNodes.forEach(function (networkNodeURL) {
        const reqOptions = {
            url: newNodeURL + '/register-node',
            method: 'POST',
            body: {
                newNodeURL: networkNodeURL
            },
            json: true
        };
        regNodesPromises.push(requestPromise(reqOptions));
    });

    Promise.all(regNodesPromises)
        .then(function (data) {
            const bulkRegisterOptions = {
                url: newNodeURL + '/register-nodes-bulk',
                method: 'POST',
                body: {
                    allNetworkNodes: [
                        ...somecoin.networkNodes, somecoin.currentNodeUrl
                    ]
                },
                json: true
            };
            requestPromise(bulkRegisterOptions);
        })
        .then(function (data) {
            res.json({message: 'node registered  with network successfully.'});
        });
});

app.post('/register-node', function (req, res) {
    const newNodeURL = req.body.newNodeURL;
    // check if node
    const nodeExists = somecoin.networkNodes.indexOf(newNodeURL) != -1;
    const isCurrentNode = somecoin.currentNodeURL === newNodeURL;
    if (!nodeExists && !isCurrentNode) somecoin.networkNodes.push(newNodeURL);
    res.json({message: 'new node registered successfully'});
});

app.post('/register-nodes-bulk', function (req, res) {

});

app.get('/blockchain', function (req, res) {
    res.send(somecoin);
});

app.post('/transaction', function (req, res) {
    // console.log(req.body);
    let amount = req.body.amount;
    let sender = req.body.sender;
    let recipient = req.body.recipient;

    // create new transaction in blockchain
    const index = somecoin.createNewTransaction(amount, sender, recipient);
    res.send({
        message: `transaction will be added to block ${index}.`
    });

});

app.get('/mine', function (req, res) {
    const lastBlock = somecoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: somecoin.pendingTransactions,
        index: lastBlock.index + 1,
    };
    const nonce = somecoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = somecoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    // create a new transaction to reward the miner for successfully mining a new block
    somecoin.createNewTransaction(15, "00", nodeAddress);

    // create a new block in the chain
    const newBlock = somecoin.createNewBlock(nonce, previousBlockHash, blockHash);

    res.json({
        message: "block mined successfully!",
        block: newBlock
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});