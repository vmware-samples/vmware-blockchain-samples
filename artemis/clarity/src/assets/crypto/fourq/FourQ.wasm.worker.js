let FourQWASM;

self.Module = {
  locateFile: function (s) { return s; }
};

try {
  self.importScripts('FourQ.wasm.js');
}
catch(e){
  console.log(e);
  postMessage({type:'import_error'});
}

// tslint:disable: only-arrow-functions
const FourQ = {

  runtimeReady: false, // got to wait for onRuntimeInitialized
  onRuntimeReady: () => {},
  heap: {},

  /**
   * Schnorr Variety 
   */
  generateFromSeed: function(secretKey) {
    if(secretKey.length !== 32) { throw new Error('Secret key must be 32-byte'); }
    
    // (SecretKey, %PublicKey)
    const dataHeap = this.heap.generateFromSeed;
    const ptr = dataHeap.ptr; 
    copySegmentTo(dataHeap, 0, secretKey);
    
    // (SecretKey, %PublicKey)
    FourQWASM.SchnorrQ_KeyGeneration(ptr.secretKey, ptr.publicKey);
    
    const publicKey = new Uint8Array(32); copySegmentTo(publicKey, 0, dataHeap, 32);
    
    return { isSchnorr: true, type: '4Q', publicKey: publicKey, secretKey: secretKey };
  },

  generateKeyPair: function() {
    // (%PublicKeySecretKey)
    const dataHeap = this.heap.generateKeyPair;
    
    // (%PublicKeySecretKey)
    FourQWASM.SchnorrQ_FullKeyGeneration(dataHeap.byteOffset);
    
    const publicKey = new Uint8Array(32); copySegmentTo(publicKey, 0, dataHeap, 0, 32);
    const secretKey = new Uint8Array(32); copySegmentTo(secretKey, 0, dataHeap, 32, 64);
    
    return { isSchnorr: true, type: '4Q', publicKey: publicKey, secretKey: secretKey };
  },

  sign: function(message, secretKey) {
    if(secretKey.length !== 32) { throw new Error('Secret key must be 32-byte'); }
    if(message.length > 65536) { throw new Error('Message cannot exceed 65536 bytes'); }

    // (SecretKey, Message, %Signature)
    const dataHeap = this.heap.sign;
    const ptr = dataHeap.ptr;
    copySegmentTo(dataHeap, 0, secretKey);
    copySegmentTo(dataHeap, 32 + 64, message);
    
    // (SecretKey, Message, SizeMessage, %Signature)
    FourQWASM.SchnorrQ_Sign(ptr.secretKey, ptr.message, message.length, ptr.signature);
    
    const signature = new Uint8Array(64); copySegmentTo(signature, 0, dataHeap, 32, 96);
    
    return { type: '4Q', data: signature };
  },

  verify: function(signature, message, publicKey) {
    if(signature.length !== 64) { throw new Error('Signature must be 64-byte'); }
    if(publicKey.length !== 32) { throw new Error('Public key must be 32-byte'); }
    if(message.length > 65536) { throw new Error('Message cannot exceed 65536 bytes'); }
    
    // (PublicKey, Message, Signature, int* valid)
    const dataHeap = this.heap.verify;
    const ptr = dataHeap.ptr;
    copySegmentTo(dataHeap, 0, publicKey);
    copySegmentTo(dataHeap, 32, signature);
    copySegmentTo(dataHeap, 32 + 64 + 4, message);
    
    // (PublicKey, Message, SizeMessage, Signature, int* valid)
    const result = FourQWASM.SchnorrQ_Verify(ptr.publicKey, ptr.message, message.length, ptr.signature, ptr.valid);
    
    return result;
  },


  /**
   * ECDH Variety 
   */
  
  ecdhGenerateFromSeed: function(secretKey) {
    if(secretKey.length !== 32) { throw new Error('Secret key must be 32-byte'); }

    // (SecretKey, %PublicKey)
    const dataHeap = this.heap.ecdhGenerateFromSeed;
    const ptr = dataHeap.ptr;
    copySegmentTo(dataHeap, 0, secretKey);
    
    // (SecretKey, %PublicKey)
    FourQWASM.CompressedPublicKeyGeneration(ptr.secretKey, ptr.publicKey);
    
    const publicKey = new Uint8Array(32); copySegmentTo(publicKey, 0, dataHeap, 32);
    
    return { isDH: true, type: '4Q', publicKey: publicKey, secretKey: secretKey };
  },

  ecdhGenerateKeyPair: function(){
    // (%PublicKeySecretKey)
    const dataHeap = this.heap.ecdhGenerateKeyPair;
    
    // (%PublicKeySecretKey)
    FourQWASM.CompressedKeyGeneration(dataHeap.byteOffset);
    
    const publicKey = new Uint8Array(32); copySegmentTo(publicKey, 0, dataHeap, 0, 32);
    const secretKey = new Uint8Array(32); copySegmentTo(secretKey, 0, dataHeap, 32, 64);
    
    return { isDH: true, type: '4Q', publicKey: publicKey, secretKey: secretKey };
  },

  getSharedSecret: function(mySecretKey, theirPublicKey) {
    if(mySecretKey.length !== 32) { throw new Error('My secret key must be 32-byte'); }
    if(theirPublicKey.length !== 32) { throw new Error('Their public key must be 32-byte'); }

    // (mySecretKey, theirPublicKey, %SharedSecret)
    const dataHeap = this.heap.getSharedSecret;
    const ptr = dataHeap.ptr;
    copySegmentTo(dataHeap, 0, mySecretKey);
    copySegmentTo(dataHeap, 32, theirPublicKey);

    // (mySecretKey, theirPublicKey, %SharedSecret)
    FourQWASM.CompressedSecretAgreement(ptr.mySecretKey, ptr.theirPublicKey, ptr.sharedSecret);

    const sharedSecret = new Uint8Array(32); copySegmentTo(sharedSecret, 0, dataHeap, 64);

    return sharedSecret;
  }

};


/**
 * Basic test
 */
Module.onRuntimeInitialized = function() {

  FourQWASM = {
    SchnorrQ_KeyGeneration: // (SecretKey, %PublicKey)
      Module.cwrap('SchnorrQ_KeyGeneration', 'number', ['number', 'number']),
  
    SchnorrQ_FullKeyGeneration: // (%PublicKeySecretKey)
      Module.cwrap('SchnorrQ_FullKeyGeneration', 'number', ['number']),
  
    SchnorrQ_Sign: // (SecretKey, Message, SizeMessage, %Signature)
      Module.cwrap('SchnorrQ_Sign', 'number', ['number', 'number', 'number', 'number']),
  
    SchnorrQ_Verify: // (PublicKey, Message, SizeMessage, Signature, int* valid)
      Module.cwrap('SchnorrQ_Verify', 'number', ['number', 'number', 'number', 'number']),
  
  
    CompressedPublicKeyGeneration: // (SecretKey, %PublicKey)
      Module.cwrap('CompressedPublicKeyGeneration', 'number', ['number', 'number']),
  
    CompressedKeyGeneration: // (%PublicKeySecretKey)
      Module.cwrap('CompressedKeyGeneration', 'number', ['number']),
  
    CompressedSecretAgreement: // (mySecretKey, theirPublicKey, %SharedSecret)
      Module.cwrap('CompressedSecretAgreement', 'number', ['number', 'number', 'number']),
  };

  // Preallocate all used memory spaces
  var thisHeap;
  thisHeap = FourQ.heap.generateFromSeed = getDataHeap(64);
  thisHeap.ptr = {
    secretKey: thisHeap.byteOffset,
    publicKey: thisHeap.byteOffset + 32,
  };
  thisHeap = FourQ.heap.generateKeyPair = getDataHeap(64);
  thisHeap = FourQ.heap.sign = getDataHeap(32 + 64 + 65536);
  thisHeap.ptr = {
    secretKey: thisHeap.byteOffset,
    signature: thisHeap.byteOffset + 32,
    message: thisHeap.byteOffset + 32 + 64,
  };
  thisHeap = FourQ.heap.verify = getDataHeap(32 + 64 + 4 + 65536);
  thisHeap.ptr = {
    publicKey: thisHeap.byteOffset,
    signature: thisHeap.byteOffset + 32,
    valid: thisHeap.byteOffset + 32 + 64,
    message: thisHeap.byteOffset + 32 + 64 + 4
  };

  thisHeap = FourQ.heap.ecdhGenerateFromSeed = getDataHeap(64);
  thisHeap.ptr = {
    secretKey: thisHeap.byteOffset,
    publicKey: thisHeap.byteOffset + 32,
  };
  thisHeap = FourQ.heap.ecdhGenerateKeyPair = getDataHeap(64);
  thisHeap = FourQ.heap.getSharedSecret = getDataHeap(96);
  thisHeap.ptr = {
    mySecretKey: thisHeap.byteOffset,
    theirPublicKey: thisHeap.byteOffset + 32,
    sharedSecret: thisHeap.byteOffset + 64,
  };

  FourQ.runtimeReady = true;

  FourQ.test = function(){

    const rand = Array.from({length: 32}, () => Math.floor(Math.random() * 256));   
    const message = new Uint8Array(rand);
    const keyPair = FourQ.generateKeyPair();
    const sig = FourQ.sign(message, keyPair.secretKey);

    console.log('');
    console.log(`======= SHNORR VARIETY ===========`);

    const t1 = Date.now();
    for (let i = 0; i < 1000; ++i){
      FourQ.generateKeyPair();
    }
    const t2 = Date.now();
    console.log(`${t2 - t1} ms, for 1000 key generation`);

    const t3 = Date.now();
    for (let i = 0; i < 1000; ++i){
      FourQ.sign(message, keyPair.secretKey);
    }
    const t4 = Date.now();
    console.log(`${t4 - t3} ms, for 1000 signing`);

    const t5 = Date.now();
    for (let i = 0; i < 1000; ++i){
      FourQ.verify(sig.data, message, keyPair.publicKey);
    }
    const t6 = Date.now();
    console.log(`${t6 - t5} ms, for 1000 verify`);

    console.log('');
    console.log(`======= ECDH VARIETY ===========`);

    const ecdhKeys1 = FourQ.ecdhGenerateKeyPair();
    const ecdhKeys2 = FourQ.ecdhGenerateKeyPair();
    const sharedSecret1 = FourQ.getSharedSecret(ecdhKeys1.secretKey, ecdhKeys2.publicKey);
    const sharedSecret2 = FourQ.getSharedSecret(ecdhKeys2.secretKey, ecdhKeys1.publicKey);

    const e1 = Date.now();
    for (let i = 0; i < 1000; ++i){
      FourQ.ecdhGenerateKeyPair();
    }
    const e2 = Date.now();
    console.log(`${e2 - e1} ms, for 1000 ECDH key generation`);

    const e3 = Date.now();
    for (let i = 0; i < 1000; ++i){
      FourQ.getSharedSecret(ecdhKeys1.secretKey, ecdhKeys2.publicKey);
    }
    const e4 = Date.now();
    console.log(`${e4 - e3} ms, for 1000 ECDH get shared secret`);
    console.log('');

    console.log(`======= ECDH SHARED SECRET CHECK ===========`);
    console.log('ECDH Key 1:', uint8ArrayToBase64(ecdhKeys1.publicKey) + ' || ' + uint8ArrayToBase64(ecdhKeys1.secretKey));
    console.log('ECDH Key 2:', uint8ArrayToBase64(ecdhKeys2.publicKey) + ' || ' + uint8ArrayToBase64(ecdhKeys2.secretKey));
    console.log('User 1 got SharedSecret:', uint8ArrayToBase64(sharedSecret1));
    console.log('User 2 got SharedSecret:', uint8ArrayToBase64(sharedSecret2));
    console.log('');
  }

  if(FourQ.onRuntimeReady) FourQ.onRuntimeReady();

};


function uint8ArrayToBase64(arr) {
  // String.fromCharCode.apply only works for arr.length < 65536
  return btoa(String.fromCharCode.apply(null, arr));
}


function getDataHeap(byteLength) {
  const dataPtr = Module._malloc(byteLength);
  const dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, byteLength);
  return dataHeap;
}

function copySegmentTo(dest, destStart, source, start, end){
  if (!destStart) { destStart = 0;}
  if (!start) { start = 0; }
  if (!end) { end = Number.MAX_SAFE_INTEGER; }
  let counter = start;
  for (let i = 0; i < source.length && counter < end; ++i) {
    dest[destStart + i] = source[i + start];
    ++counter;
  }
}


FourQ.onRuntimeReady = () => {
  postMessage({type:'ready'});
};

FourQ.OpType = {
  KEY_GEN: 1,
  FROM_SEED: 2,
  SIGN: 3,
  VERIFY: 4,
  ECDH_KEY_GEN: 5,
  ECDH_FROM_SEED: 6,
  SHARED_SECRET: 7,
  TEST: 8,
};

self.onmessage = (e) => {
  const data = e.data;
  const _fid = data._fid;
  try {
    switch(data.op){
      case FourQ.OpType.KEY_GEN:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { result.push(FourQ.generateKeyPair()); }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.generateKeyPair() });
        }
      break;
      case FourQ.OpType.FROM_SEED:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.generateFromSeed(data.secretKey[i]));
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.generateFromSeed(data.secretKey) });
        }
      break;
      case FourQ.OpType.SIGN:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.sign(data.message[i], data.secretKey[i]));
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.sign(data.message, data.secretKey) });
        }
      break;
      case FourQ.OpType.VERIFY:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.verify(data.signature[i].data, data.message[i], data.publicKey[i]));
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.verify(data.signature.data, data.message, data.publicKey) });
        }
      break;
      case FourQ.OpType.ECDH_KEY_GEN:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.ecdhGenerateKeyPair());
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.ecdhGenerateKeyPair() });
        }
      break;
      case FourQ.OpType.ECDH_FROM_SEED:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.ecdhGenerateFromSeed(data.secretKey[i]));
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.ecdhGenerateFromSeed(data.secretKey) });
        }
      break;
      case FourQ.OpType.SHARED_SECRET:
        if (data.count) {
          const result = []; for(let i = 0; i < data.count; ++i) { 
            result.push(FourQ.getSharedSecret(data.mySecretKey[i], data.theirPublicKey[i]));
          }
          postMessage({ _fid:_fid, result: result });
        } else {
          postMessage({ _fid:_fid, result: FourQ.getSharedSecret(data.mySecretKey, data.theirPublicKey) });
        }
      break;
      case FourQ.OpType.TEST:
        FourQ.test();
        postMessage({ _fid:_fid, result: {} });
      break;
      default:
        postMessage({ _fid:_fid, result: null, message: 'Unknown Opcode: ' + data.op });
      break;
    }
  } catch(e) {
    console.log(e);
    postMessage({ _fid:_fid, result: null, message:e.stack + '', input: data });
  }
  
}