
const buffer = require('buffer');
const crypto = require('crypto');
const    hex = require('hex');

const ALGO = 'aes-256-gcm';

// ToDo: Read Key file here.

// Base64 representation of 'CCIL_MUMBAI.key'.
//const key = "BxUdstHRUOuhl5aKjCNEptH+LyF/byK+rylythHGReI=";

// Base64 representation of 'ANTS_BLAIR.key' read as a Buffer.
const KEY = Buffer.from("eRiIC19oFfg0BOKsMZaZa67eS8QkKwCpE7I0yTu4RVM=", "base64");

//Expected String
var enc_data = "fhK5nUB2L2KHzSBD2Dqy98V6NuAeSvQGsRdwv2K+rwm+Z74wYmTb3DTnt+hg0Tb6RZXGHRU07yFGQ45XZfyHR4evqLG5NFeLtJ/8jkP25dzE6XzeuklTeUS01FSWhC3ph/pPiXK5L3MSS6Fq2HCFKfAK1AS6yETu4zNtTuEeyZBSOS5eDjrbroIVapu3ZcNSVSUK9K8iIzUNuRoBWfrXeT9LfQCqHXFKPSMLP38kVGqj3bzPnhkaBSEku5BqoAS+Zlxyn1L3TBpWs+F3WOtFnGGWW1ODKbUrFhzK10RI9b4=";

//Plain-text Data
var plain_data = "ref_no=754675467|functionType=|radioValue=|merchantFlag=false|viewType=|amount=10|merchantCode=|echequeNo=|checkSum=dd2a17a93d6bfad866429fa2ed9aedf2bbe86177a1f6d27c42c204e432f7e55c";

// Expected AAD
var authTag = "61965b538329b52b161ccad74448f5be";

// # Decryption Starts Here.
function decrypt(encrypted) {

  let t = Buffer.from(encrypted, "base64");   // Decode base64 encrypted data to a Hex Buffer.

  let IV1  = t.slice(0,16);   // 16 Idhr jao. //First 16 bytes are IV.
  let AAD1 = t.slice((t.length-16),t.length);  // 16 Udhr jao. //Last 16 Bytes are AAD.
  let ENC2 = t.slice(16,(t.length-16));  // Jo bache wo mere peeche aao.  //Rest is the actual encrypted data. Haha!
	let ENC1 = Buffer.from(ENC2).toString('hex');

  console.log(" IV_DEC: " + typeof IV1  + " || " + IV1.toString('hex')  + " || " + IV1.length + "\n");
  console.log("AAD_DEC: " + typeof AAD1 + " || " + AAD1.toString('hex') + " || " + AAD1.length + "\n");
  console.log("ENC_DEC: " + ENC1 + " || " + ENC1.length + '\n');

  AAD2 = AAD1.toString('hex');
  AAD3 = Buffer.from(AAD2, 'hex');

  // The Magical Crypto Code
  let decipher = crypto.createDecipheriv(ALGO, KEY, IV1)
      decipher.setAuthTag(AAD3, 'hex');
  let dec  = decipher.update(ENC1, 'hex');
      dec += decipher.final('ascii');

  return dec.replace(/\0/g, '');
}


// # Encryption Starts Here.
function encrypt(data) {

  // let IV = Buffer.from(crypto.randomBytes(16));  // Set an IV of 16 Bytes. This should be dynamic, as it will be sent with the payload.
  let IV  = Buffer.from("fhK5nUB2L2KHzSBD2Dqy9w==", "base64"); // IV only for test purpose. In production, IV needs to be dynamic as mentioned above.
	let plaintext = data.replace(/\0/g, '');	// Remove Nullbytes.

  let plainLength = plaintext.toString().length;
  let remainder = plainLength % 16;
  var pad = "";
  if (remainder != 0) {
    plainLength += 16 - remainder;
    pad = Buffer.alloc(16-remainder);
  }
  let plain = Buffer.from(plaintext + pad);

  // The Magical Crypto Code
  let cipher = crypto.createCipheriv(ALGO, KEY, IV);
  let ENC = Buffer.from(cipher.update(plain, 'utf8', 'latin1')); // Set encryption params. Auto-padding is default.
      ENC += cipher.final(); // Perform actual encryption and return an Array Buffer.

  let AAD = cipher.getAuthTag(); // Get Auth Tag. Returns a Buffer.

	let u = Buffer.from(ENC, 'latin1');

	let z_buffer = [IV, u, AAD];
  let finalBuffer = Buffer.concat(z_buffer);  // Concat the data
  let final = finalBuffer.toString("base64");   //Encode the data in Base64

	// console.log("###");
	// console.log("###");
	// console.log(u.toString('hex') + " || " + u.length);
	// console.log("###");

  // let cipher1 = crypto.createCipheriv(ALGO, KEY, IV);
	// let final1 = Buffer.from(cipher1.update(plain, 'utf8', 'ascii'));
	//     final1 += cipher1.final();

  console.log(" IV_ORG: " + typeof IV  + " || " + IV.toString('hex')  + " || " + IV.length + "\n");
  console.log("AAD_ORG: " + typeof AAD + " || " + AAD.toString('hex') + " || " + AAD.length + "\n");
  // console.log("ENC_ENC: " + final.toString() + " || " + final.toString().length + '\n');
  // console.log("ENC_ENC: " + final1.toString() + " || " + final1.toString().length + '\n');

  return final;
}



// Call Functions and Print Results
var dec_data = decrypt(enc_data);
console.log(dec_data.toString() + " || " + dec_data.toString().length + "\n");

console.log("###################\n");

var enc_data1 = encrypt(dec_data);
console.log(enc_data1.toString() + "\n\n");

console.log("###################\n");

var dec_data1 = decrypt(enc_data1);
console.log(dec_data1.toString() + " || " + dec_data1.toString().length + "\n");

//## Console Output

