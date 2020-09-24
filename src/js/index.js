import x from './test';
import $ from 'jQuery';
console.log(`value is >> ${x}`);

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}
const { Blockchain, Transaction } = require("./blockchain");

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('0fb770237fc9b0647f6f0d13b646345250897ec597a5715cb52b690fd84d2430');

const myWalletAddress = myKey.getPublic('hex');




const bvrCoin = new Blockchain();

bvrCoin.minePendingTransactions(myWalletAddress);


const tx1 = new Transaction(myWalletAddress, 'address2', 10);
tx1.signTransaction(myKey);
bvrCoin.addTransaction(tx1);

bvrCoin.minePendingTransactions(myWalletAddress);




const tx2 = new Transaction(myWalletAddress, 'address1', 20);
tx2.signTransaction(myKey);
bvrCoin.addTransaction(tx2);

bvrCoin.minePendingTransactions(myWalletAddress);



console.log()
console.log('Balance of Rao is ' + bvrCoin.getBalanceOfAddress(myWalletAddress));



console.log()
console.log("Blockchain valid : " + bvrCoin.isChainValid() ? 'Yes' : 'No');
