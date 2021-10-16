
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

// # Decryption Starts Here.
function decrypt(encrypted) {

  let t = Buffer.from(encrypted, "base64");   // Decode base64 encrypted data to a Hex Buffer.

  let IV1  = t.slice(0,16);   // 32 Idhr jao. //First 32 bytes are IV.
  let AAD1 = t.slice((t.length-16),t.length);  // 32 Udhr jao. //Last 32 Bytes are AAD.
  let ENC1 = t.slice(16,(t.length-16));  // Jo bache wo mere peeche aao.  //Rest is the actual encrypted data. Haha!

	let y = [IV1, ENC1, AAD1];
	let z = Buffer.concat(y);
	console.log(typeof(z), z.length + "\n#\n");

  // console.log(" IV_DEC || Type || Length: " + typeof IV1  + " || " + IV1.toString('hex')  + " || " + IV1.length + "\n");
  // console.log("AAD_DEC || Type || Length: " + typeof AAD1 + " || " + AAD1.toString('hex') + " || " + AAD1.length + "\n");
  // console.log("ENC_DEC (without IV and AAD concat): " + typeof ENC1 + " || " + ENC1.length + '\n');

  // let extra = t.slice(185,192);
  // console.log("   T || Type || Length: " + typeof t + " || " + t.toString('hex') + " || " + t.length + "\n");
  // console.log("EXTR || Type || Length: " + typeof extra + " || " + extra + " || " + extra.toString('hex') + " || " + extra.length + "\n");

  // The Magical Crypto Code
  let decipher = crypto.createDecipheriv(ALGO, KEY, IV1)
      decipher.setAuthTag(Buffer.from(AAD1));
  let dec  = decipher.update(ENC1);
      dec += decipher.final();

  return dec;
}


// # Encryption Starts Here.
function encrypt(data) {

  // let IV = Buffer.from(crypto.randomBytes(16));  // Set an IV of 16 Bytes. This should be dynamic, as it will be sent with the payload.
  let IV  = Buffer.from("fhK5nUB2L2KHzSBD2Dqy9w==", "base64"); // IV only for test purpose. In production, IV needs to be dynamic as mentioned above.

  let plaintext = data.replace(/\0/g, '');  // Remove Nullbytes.

	// START Debug Code for string length mis-match.
  // console.log(data + " || " + data.length + "");
  // console.log(plain_data + " || " + plain_data.length);
  // let new1 = data.replace(/\0/g, '');
  // console.log(new1 + " || " + new1.length);

  // let i=0;
  // for(const char of data) {
  //   i++;
  //   console.log(" " + char.toString('utf-8') + " - " + char.length + " - " + i);
  // }
	// END Debug Code for string length mis-match.

	// START Debug Code for padding.
  // let plainLength = plaintext.toString().length;

  // let remainder = plainLength % 16;
  // var pad = "";
  // if (remainder != 0) {
  //   plainLength += 16 - remainder;
  //   pad = Buffer.alloc(16-remainder);
  // }

  // var plain = Buffer.from(plaintext + pad);
  // console.log(pad.length + "\n\n");
  // console.log(plain.length + "\n\n");
	// END Code for paddinG.

	let plain = new TextEncoder().encode(plaintext);

  // The Magical Crypto Code
  let cipher = crypto.createCipheriv(ALGO, KEY, IV);
  let ENC = Buffer.from(cipher.update(plain)); // Set encryption params. Auto-padding is default.
      ENC += cipher.final('utf8'); // Perform actual encryption and return an Array Buffer.

  let AAD = cipher.getAuthTag(); // Get Auth Tag. Returns a Buffer.

	let z_buffer = [IV, ENC, AAD];
  let finalText = Buffer.concat(z_buffer);  // Concat the data
  let final = Buffer.from(finalText.toString("base64"));   //Encode the data in Base64

	console.log(finalText.length, typeof(finalText));
	console.log(final.length, typeof(final) + "\n\n");

  // console.log(" IV_ORG || Type || Length: " + typeof IV  + " || " + IV.toString('hex')  + " || " + IV.length + "\n");
  // console.log("AAD_ORG || Type || Length: " + typeof AAD + " || " + AAD.toString('hex') + " || " + AAD.length + "\n");
  // console.log("ENC_ORG (without IV and AAD concat): " + typeof ENC + " || " + ENC.length + '\n');
  // console.log("AAD || Type || Length: " + typeof AAD + " || " + s2B(AAD.toString('utf-8')) + " || " + AAD.length + "\n");
  // console.log("FNT || Type || Length: " + finalText + " || " + finalText.length + "\n\n");

  let r = Buffer.from(final, "base64");   // Decode base64 encrypted data to a Hex Buffer.
  let IV1  = r.slice(0,16);   // 32 Idhr jao. //First 32 bytes are IV.
  let AAD1 = r.slice((r.length-16),r.length);  // 32 Udhr jao. //Last 32 Bytes are AAD.
  let ENC1 = r.slice(16,(r.length-16));  // Jo bache wo mere peeche aao.  //Rest is the actual encrypted data. Haha!
  console.log(" IV1_ENC || Type || Length: " + typeof IV1  + " || " + IV1.toString('hex')  + " || " + IV1.length + "\n");
  console.log("AAD1_ENC || Type || Length: " + typeof AAD1 + " || " + AAD1.toString('hex') + " || " + AAD1.length + "\n");
  console.log("ENC1_ENC (without IV and AAD concat): " + typeof ENC1 + " || " + ENC1.toString('hex').length + '\n');


  return final;
}



// Call Functions and Print Results
var dec_data = decrypt(enc_data);
// console.log(dec_data.toString() + " || " + dec_data.toString().length + "\n");

console.log("###################\n");

var enc_data1 = encrypt(dec_data);
console.log(enc_data1.toString() + "\n\n");

// console.log("###################\n");

// var dec_data1 = decrypt(enc_data1);
// console.log(dec_data1.toString() + "\n\n");

//## Console Output

