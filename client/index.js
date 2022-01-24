import "./index.scss";
var EC = require('elliptic').ec;
const server = "http://localhost:3042";
var ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

document.getElementById("check-balance").addEventListener('click', () => {
  let value = document.getElementById("exchange-address").value;
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value.toLowerCase();
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value.toLowerCase();
  const privateKey = document.getElementById("private-key").value;

  const key = ec.keyFromPrivate(privateKey);

  const msgHash = SHA256(JSON.stringify({
    sender, amount, recipient
  }));

  const signature = key.sign(msgHash.toString());

  const body = JSON.stringify({
    sender, amount, recipient, signature
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' ,'Accept': 'application/json'}}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("sign-up").addEventListener('click', () => {
  const newUser = document.getElementById("new-user").value.toLowerCase();
  const key = ec.genKeyPair();
  const publicKey = key.getPublic().x.toString(16)+key.getPublic().y.toString(16)
  const body = JSON.stringify({
    newUser, publicKey
  });
  const request = new Request(`${server}/sign-up`, { method: 'POST', body });
  fetch(request, { headers: { 'Content-Type': 'application/json'}}).then(response => {
    return response.json();
  }).then(({ message }) => {
    console.log(message)
    if (message){
      document.getElementById("new-private-key").innerHTML =  `Your new private key is "${key.getPrivate().toString(16)}". Please write it down!`;
    } else{
      document.getElementById("new-private-key").innerHTML =  `This user name is already used`;
    }
  });
});


