import $ from 'jQuery';
import User from './User';
import Transaction from './Transaction';
import Block from './Block';

let alice, bob, miner;
let pending_transactions = [];
let blockChain = [];
const difficultyLevel = 2;
const miningReward = 20;
init();
function init () {

  alice = new User("alice", 100);
  bob = new User("bob", 100);
  miner = new User("miner", 0);
  $("#bob_address").text(`${bob.publicKey.substring(0,10)}...`);
  $("#bob_balance").text(bob.balance);
  $("#alice_address").text(`${alice.publicKey.substring(0,10)}...`);
  $("#alice_balance").text(alice.balance);
  $("#miner_address").text(`${miner.publicKey.substring(0,10)}...`);
  $("#miner_balance").text(miner.balance);

  createGenesisBlock();
  
}

 function createGenesisBlock () {
  const block = new Block(Date.now(), [], '0');
  block.mineBlock(difficultyLevel);
  blockChain.push(block);

  let blockCardListElement = `
    <li class="list-group-item">
      <div class="col-3" style="display: inline-block;">
        <h4 class="card-title">Genisis Block</h4>
      </div>
      <div style="display: inline-block;">
      <p class="card-text">Previous Block Hash : ${block.previousHash}</p>
      <p class="card-text">Time Stamp : ${block.timestamp}</p>
      <p class="card-text">Transaction : - </p>
      <p class="card-text">Nounce : ${block.nonce}</p>
      <p class="card-text">Block Hash : ${block.hash.substring(0,10)}...</p>
      </div>
    </li>`;

  $(".list-group").append(blockCardListElement);
}

$("#send_money").on("click", function() {
  const from = $("#inputFrom").val();
  const to = $("#inputTo").val();
  const amount = $("#inputAmount").val();

  const fromUser = from == 'alice'? alice : bob ;
  const toUser  = to == 'alice'? alice : bob ;

  const transaction = new Transaction(
    fromUser.publicKey,
    toUser.publicKey,
    amount
  );


  transaction.signTransaction(fromUser.key);

  if(!transaction.fromAddress || !transaction.toAddress) {
    throw new Error('Transaction must include from and to address');
  }

  if(!transaction.isValid()) {
    throw new Error('Cannot add invalid transaction to chain');
  }

  if(transaction.amount <= 0) {
    throw new Error('Transaction amount should be higher than 0');
  }

  if(fromUser.balance < transaction.amount) {
    throw new Error('Insufficient funds ');
  }
  fromUser.balance -= transaction.amount;
  toUser.balance = toUser.balance + transaction.amount; 
  pending_transactions.push(transaction);
  $("#bob_balance").text(bob.balance);
  $("#alice_balance").text(alice.balance);

  const transaction_row = `
  <tr class = "transaction_row">
    <th scope="row">2</th>
    <td>${transaction.fromAddress.substring(0,10)}</td>
    <td>${transaction.toAddress.substring(0,10)}</td>
    <td>${transaction.amount}</td>
  </tr>`
  $("#pending_transactions").append(transaction_row);

});

function getLatestBlockHash() {
  return blockChain[blockChain.length - 1].hash;
}

$("#mine_block").on("click", function(){
  if (pending_transactions.length == 0 ) {
    alert("no trnasaction");
    return;
  }

  // add miner reward
  const rewardTx = new Transaction(null, miner.publicKey, miningReward);
  pending_transactions.push(rewardTx);

  const block =  new Block(Date.now(), pending_transactions, getLatestBlockHash());
  block.mineBlock(difficultyLevel);
  blockChain.push(block);

  let blockCard = `
    <li class="list-group-item">
      <div class="col-3" style="display: inline-block;">
        <h4 class="card-title">${blockChain.length -1 }</h4>
      </div>
      <div style="display: inline-block;">
      <p class="card-text">Previous Block Hash : ${block.previousHash.substring(0,10)}</p>
      <p class="card-text">Time Stamp : ${block.timestamp}</p>
      <p class="card-text">Transaction : `; 

  block.transactions.forEach( (Tx) => {
    let tempTx;
    if (Tx.fromAddress == null){
      tempTx = `<br>From : -  <br>To : ${Tx.toAddress.substring(0,10)} <br>Amount : ${Tx.amount}`;
    } else {
      tempTx = `<br>From : ${Tx.fromAddress.substring(0,10)} <br>To : ${Tx.toAddress.substring(0,10)} <br>Amount : ${Tx.amount}`;
    }
    blockCard = blockCard.concat(tempTx);
  });

  let blockCard2 = `</p>
      <p class="card-text">Nounce : ${block.nonce}</p>
      <p class="card-text">Block Hash : ${block.hash.substring(0,10)}...</p>
    </div>
    </li>`;

  blockCard = blockCard.concat(blockCard2);
  console.log(blockCard);
  pending_transactions = [];
  miner.balance += miningReward;
  $("#miner_balance").text(miner.balance);
  $(".transaction_row").remove();

  $(".list-group").append(blockCard);
});

$("#check_chain_validity").on("click", function(){

  for(let i=1; i< blockChain.length; i++) {
    const currentBlock = blockChain[i];

    if(!currentBlock.hasValidTransactions()) {
      console.log("false");
      return false ;
    }
    if(currentBlock.hash !== currentBlock.calculateHash()) {
      console.log("false");
      return false;
    }
  }
  console.log("true");
  return true
});