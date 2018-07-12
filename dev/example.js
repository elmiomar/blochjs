const Blockchain = require('./blockchain');

const somecoin = new Blockchain();

// choose which example to run
let example = 3;
console.log(`running example #${example}...`);

if (example == 0) {
    console.log(somecoin);
}

if (example == 1) {
    // create first block
    somecoin.createNewBlock(1234, '2AAE6C35C94FCFB415DBE95F408B9CE91EE846ED', '6E71B3CAC15D32FE2D36C270887DF9479C25C640');

    // create a new transaction
    somecoin.createNewTransaction(100, 'OMAR9C30AB8E0831B70EA469FBD9BB71B77F689F', 'ILIAS13456D810F99152A44821B8F40ACE191B4F');

    // mine a block, where the pending transactions should go
    somecoin.createNewBlock(1236, '6E71B3CAC15D32FE2D36C270887DF9479C25C640', '182F44B755488FE4B6A8F6F55A537C0ABD4401EC');

    somecoin.createNewTransaction(100, 'OMAR9C30AB8E0831B70EA469FBD9BB71B77F689F', '6E71B3CAC15D32FE2D36C270887DF9479C25C640');
    somecoin.createNewTransaction(200, '6E71B3CAC15D32FE2D36C270887DF9479C25C640', '182F44B755488FE4B6A8F6F55A537C0ABD4401EC');
    somecoin.createNewTransaction(300, '6E71B3CAC15D32FE2D36C270887DF9479C25C640', '182F44B755488FE4B6A8F6F55A537C0ABD4401EC');

    somecoin.createNewBlock(1237, '182F44B755488FE4B6A8F6F55A537C0ABD4401EC', '1E2D808D66034DBE6236476C56E92595DCDD522B');

    // log chain
    console.log(somecoin.chain[2]);

    // log last block
    // console.log(somecoin.getLastBlock());
}

if (example == 2) {
    const previousBlockHash = '182F44B755488FE4B6A8F6F55A537C0ABD4401EC';
    const currentBlockData = {
        transactions: [{
                amount: 100,
                sender: 'OMAR9C30AB8E0831B70EA469FBD9BB71B77F689F',
                recepient: '6E71B3CAC15D32FE2D36C270887DF9479C25C640'
            },
            {
                amount: 200,
                sender: '6E71B3CAC15D32FE2D36C270887DF9479C25C640',
                recepient: '182F44B755488FE4B6A8F6F55A537C0ABD4401EC'
            },
            {
                amount: 300,
                sender: '6E71B3CAC15D32FE2D36C270887DF9479C25C640',
                recepient: '182F44B755488FE4B6A8F6F55A537C0ABD4401EC'
            }
        ]
    };
    let nonce = somecoin.proofOfWork(previousBlockHash, currentBlockData);
    // console.log(`found it after ${nonce} tries.`);
    console.log(somecoin.hashBlock(previousBlockHash, currentBlockData, nonce));
}


if (example == 3) {
    var bch = require('./test/mock-chain.json');
    console.log('Is chain valid? ' + somecoin.chainIsValid(bch.chain));
}