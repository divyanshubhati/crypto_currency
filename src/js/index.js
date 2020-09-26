import $ from 'jQuery';
import User from './User';
import Transaction from './Transaction';
import Block from './Block';
import _ from 'lodash';

let alice, bob, miner;
let pending_transactions = [];
let mined_transaction = [];
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

  if(transaction.fromAddress == transaction.toAddress) {
    alert("Internal transfer is not allowed");
    throw new Error('Internal transfer is not allowed');
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
  toUser.balance = parseInt(toUser.balance) + parseInt(transaction.amount); 
  pending_transactions.push(transaction);
  $("#bob_balance").text(bob.balance);
  $("#alice_balance").text(alice.balance);

  const transaction_row = `
  <tr class = "transaction_row">
    <th scope="row">${mined_transaction.length + pending_transactions.length -1 }</th>
    <td>${transaction.fromAddress.substring(0,10)}</td>
    <td>${transaction.toAddress.substring(0,10)}</td>
    <td id="txAmount">${transaction.amount}</td>
  </tr>`
  $("#pending_transactions").append(transaction_row);

  $([document.documentElement, document.body]).animate({
    scrollTop: $("#user-info").offset().top
  }, 1500);

});




function getLatestBlockHash() {
  return blockChain[blockChain.length - 1].hash;
}






$("#mine_block").on("click", function(){
  if (pending_transactions.length == 0 ) {
    alert("no trnasaction");
    return;
  }

  mined_transaction = _.concat(mined_transaction,pending_transactions);
  console.log(mined_transaction);

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
  $(".transaction_row").addClass("table-success");

  $(".list-group").append(blockCard);
  $([document.documentElement, document.body]).animate({
    scrollTop: $("#block-data").offset().top
  }, 1500);
});

function checkChainValidity(){

  for(let i=1; i< blockChain.length; i++) {
    const currentBlock = blockChain[i];

    if(!currentBlock.hasValidTransactions()) {
      return false ;
    }
    if(currentBlock.hash !== currentBlock.calculateHash()) {
      return false;
    }
  }
  return true
}

$("#tamper_data").on("click", function(){
  if (mined_transaction.length == 0 ) {
    alert("No Mined traction present. Add a transaction and mine the block before tampering the data.")
    return;
  }
  const transaction_id = $("#transaction_id").val();
  if(transaction_id >= mined_transaction.length) {
    alert("The selected transaction is either not mined yet or not present")
    return;
  }
  const new_amount = $("#new_amount").val();

  mined_transaction[transaction_id].amount = new_amount;
  if (checkChainValidity()) {
    $(".table-danger").addClass("table-success");
    $(".table-danger").removeClass("table-danger");
    $(".list-group-item").removeClass("bg-danger");
  } else {
    $(".table-success").addClass("table-danger");
    $(".table-success").removeClass("table-success");
    $(".list-group-item").addClass("bg-danger");
  }

  $([document.documentElement, document.body]).animate({
    scrollTop: $("#block-data").offset().top
  }, 1500);

});

$("#reload").on("click", function(){
  location.reload();
  console.log("click");
});