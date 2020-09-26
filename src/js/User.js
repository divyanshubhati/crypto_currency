const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

export default class User {
    constructor(name, inital_balance) {
        this.name = name;
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.balance = inital_balance;
    }
}