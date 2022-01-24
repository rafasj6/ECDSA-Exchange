const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const SHA256 = require('crypto-js/sha256');
var EC = require('elliptic').ec;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());
var ec = new EC('secp256k1');


var balances = {}
balances["rafael"] = {"balance": 100, "publicKey": "4dc72ddcb08c58705233a2d0bb2d2c6f980c08a057decee8787a06c6eca03ba7c15c84a9850f356381fed15c25764c5b7c8546d3137325c66d3363cb8054dcda"}
balances["tom"] = {"balance": 20, "publicKey": "adb46dd396e6a2f35e0e70e74184a0335935ad5baeec0208695673ed985fea844e2ae1df537a8186cddca36c1af54ba5b96795527798744bc66e59de654b4dfb"}
balances["alex"] = {"balance": 50, "publicKey": "ae1312d3df2f67c6ddd1f1123f8b43b136d9bd68992b082dab237e274f2f6f6ba993dc01ed5dd5d609d6be80ba9c21fd18cfade1b3e60dae1ace73992730a733"}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  var balance;
  if(balances[address.toLowerCase()] == undefined){
    balance = 0;
  } else{
    balance = balances[address.toLowerCase()]["balance"] || 0;
  }
  res.send({ balance });
});

app.post('/sign-up', (req, res) => {
  const {newUser, publicKey} = req.body;
  if (balances[newUser] != undefined){
    let message = false
    console.log(message)
    res.send( {message: message} );
  } else{
    balances[newUser] = {"balance": 0, "publicKey": publicKey}
    let message = true
    console.log(message)
    res.send({ message: message })
  }
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, signature} = req.body;
  if(balances[sender]== undefined || balances[recipient] == undefined || balances[sender]["balance"]- amount < 0){
    return
  }
  const senderKey = balances[sender]["publicKey"]
  const publicKey = {
    x: senderKey.slice(0, 64),
    y: senderKey.slice(64, 128),
  }
  const key = ec.keyFromPublic(publicKey, 'hex');
  const msgHash = SHA256(JSON.stringify({
    sender, amount, recipient
  }));

  if (key.verify(msgHash.toString(), signature)) {
    balances[sender]["balance"] -= amount;
    console.log(recipient)
    balances[recipient]["balance"] = (balances[recipient]["balance"] || 0) + +amount;
    res.send({ balance: balances[sender]["balance"] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
