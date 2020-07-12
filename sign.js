function parseSignature(signature) {
  var r = signature.substring(0, 64);
  var s = signature.substring(64, 128);
  var v = signature.substring(128, 130);

  return {
      r: "0x" + r,
      s: "0x" + s,
      v: parseInt(v, 16)
  }
}
var message;
var fullSig;

function genSolidityVerifierData(signature) {
      
  return solidityData
    .replace("<Signature>", fullSig)
    .replace("<SigR>", signature.r)
    .replace("<SigS>", signature.s)
    .replace("<SigV>", signature.v)
}

window.onload = function (e) {
  var res = document.getElementById("response");
  res.style.display = "none";

  // force the user to unlock their MetaMask
  if (web3.eth.accounts[0] == null) {
    alert("Please unlock MetaMask first");
    // Trigger login request with MetaMask
    web3.currentProvider.enable().catch(alert)
  }

  var signBtn = document.getElementById("signBtn");
  signBtn.onclick = function(e) {
    if (web3.eth.accounts[0] == null) {
      return;
    }

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ];

    const testData = [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ];
  
    const domainData = {
      name: "TestSignature",
      version: "2",
      chainId: 5777,
      verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
      salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
    };

    message = {
      spender: "0xE1B45033cBd272a58f7fCc4744Cf737DCcb24b76",
      amount: 100 
    };


    const msgParams = JSON.stringify({types:{
      EIP712Domain:[
        {name:"name",type:"string"},
        {name:"version",type:"string"},
        {name:"chainId",type:"uint256"},
        {name:"verifyingContract",type:"address"}
      ],
      Person:[
        {name:"name",type:"string"},
        {name:"wallet",type:"address"}
      ],
      Mail:[
        {name:"from",type:"Person"},
        {name:"to",type:"Person"},
        {name:"contents",type:"string"}
      ]
    },
    primaryType:"Mail",
    domain:{name:"Ether Mail",version:"1",chainId:1,verifyingContract:"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},
    message:{
      from:{name:"Cow",wallet:"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},
      to:{name:"Bob",wallet:"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},
      contents:"Hello, Bob!"}
    })
    
    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        TestData: testData
      },
      domain: domainData,
      primaryType: "TestData",
      message: message
    });

    const signer = web3.toChecksumAddress(web3.eth.accounts[0]);
    console.log(msgParams);

    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [signer, msgParams],
        from: signer
      }, 
      function(err, result) {
        if (err || result.error) {
          return console.error(result);
        }
        fullSig = result.result;

        const signature = parseSignature(fullSig.substring(2));
        res.style.display = "block";
        res.value = genSolidityVerifierData(signature);
      }
    );
  };
}
  