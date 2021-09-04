// ! IMPORTANT !
// change below to where FourQ.wasm.worker.js is relative to your webapp 
// e.g. for Angular it may be assets/js/FourQ.wasm.worker.js
const wasmWorkerURL = 'assets/crypto/fourq/FourQ.wasm.worker.js';

FourQ = {};

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

FourQ.getFleet = function(workerCount){
  if (!workerCount) { workerCount = 1; }
  var fleet = this;
  
  const shardMemoryEnabled = window.SharedArrayBuffer ? true : false;

  const maxConcurrentWorkload = 64;
  const maxQueueLength = 4096;

  var _fidNow = 0;
  var _flushIdNow = 0;
  var _fidReg = {};
  
  var workerNow = 0; // round robin
  var workers = [];
  var batchCount = 0;
  var fleetQueue = [];
  
  var available = [];
  var maxRetireAt = 200000;
  var baseRetireAt = 100000;
  var baseRetireMulti = 50000;
  var retiredWorkers = [];

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }  
  function gaussianHickUpOneSD() { // mean 0, variance 1, only positive
    let u = 0; let v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.abs(Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )) / 2;
  }
  function getFlushId() {
    if(_flushIdNow === Number.MAX_SAFE_INTEGER) { _flushIdNow = 0; }
    return ++_flushIdNow;
  }
  function getFID() {
    if(_fidNow === Number.MAX_SAFE_INTEGER) { _fidNow = 0; }
    return ++_fidNow;
  }
  function getWorker() {
    var worker, count = 0;
    while(!worker && count < workers.length) {
      ++count;
      ++workerNow; if(workerNow >= workers.length) workerNow = 0;
      worker = workers[workerNow];
      if (worker.retired || worker.saturated) { worker = null; }
    }
    return worker;
  }

  function opCodeDo(worker, op, a, _fid, flushId, batch) {
    if(batchCount) { batch = batchCount; batchCount = 0; }
    if (!worker) { return fleetQueue.push([op, a, _fid, null, batch]); }
    if (worker.retired) { return fleetQueue.push([op, a, _fid, null, batch]); }

    worker.congested = (worker.workload >= maxConcurrentWorkload);
    worker.saturated = (worker.queue.length >= maxQueueLength);

    if (!worker.ready || worker.congested){
      if (worker.saturated) {
        return fleetQueue.push([op, a, _fid, flushId, batch]);
      } else {
        return worker.queue.push([op, a, _fid, flushId, batch]);
      }
    }

    var _fobj;
    if(!_fid) { _fid = getFID(); _fidReg[_fid] = { _fid: _fid, input: [op, a, _fid, flushId, batch] }; }
    _fobj = _fidReg[_fid];

    var c = batch ? batch : undefined;
    var handled = true;
    switch(op){
      case FourQ.OpType.KEY_GEN:
        worker.postMessage({ _fid:_fid, op:op, count: c });
        _fobj.resolve = a[0];
      break;
      case FourQ.OpType.FROM_SEED:
        worker.postMessage({ _fid:_fid, op:op, count: c, secretKey: a[0] });
        _fobj.resolve = a[1];
      break;
      case FourQ.OpType.SIGN:
        worker.postMessage({ _fid:_fid, op:op, count: c, message:a[0], secretKey: a[1]});
        _fobj.resolve = a[2];
      break;
      case FourQ.OpType.VERIFY:
        worker.postMessage({ _fid:_fid, op:op, count: c, signature:a[0], message:a[1], publicKey: a[2]});
        _fobj.resolve = a[3];
      break;
      case FourQ.OpType.ECDH_KEY_GEN:
        worker.postMessage({ _fid:_fid, op:op, count: c });
        _fobj.resolve = a[0];
      break;
      case FourQ.OpType.ECDH_FROM_SEED:
        worker.postMessage({ _fid:_fid, op:op, count: c, secretKey: a[0] });
        _fobj.resolve = a[1];
      break;
      case FourQ.OpType.SHARED_SECRET:
        worker.postMessage({ _fid:_fid, op:op, count: c, mySecretKey: a[0], theirPublicKey:a[1] });
        _fobj.resolve = a[2];
      break;
      case FourQ.OpType.TEST:
        worker.postMessage({ _fid:_fid, op:op });
        _fobj.resolve = a[1];
      break;
      default:
        delete _fidReg[_fid];
        handled = false;
      break;
    }
    if (handled) {
      ++worker.workload;
      worker.total += c ? c : 1;
      if (worker.total >= worker.retireAt) { worker.retire(); }
    }
    return _fobj;
  }

  this.addWorker = function(unfinishedQueue){
    var worker = new Worker(wasmWorkerURL);
    worker.queue = unfinishedQueue ? unfinishedQueue : [];
    worker.congested = false;
    worker.saturated = false;
    worker.workload = 0;
    worker.total = 0;
    worker.uuid = uuidv4();
    worker.retireAt = baseRetireAt + gaussianHickUpOneSD() * baseRetireMulti;
    if(worker.retireAt > maxRetireAt) worker.retireAt = maxRetireAt;
    worker.onerror = function (e) { console.log(e); }
    worker.onmessage = function (e) {
      const data = e.data;
      if(!data.type){
        var _fobj = _fidReg[data._fid];
        if (_fobj) {
          if(data.result === null) {
            _fobj.resolve(new Error('errored: ' + data.message), data.input);
          } else {
            _fobj.resolve(null, data.result);
          }
        } else {
          console.log('errored: unregistered callback');
        }
        --this.workload;
        delete _fidReg[data._fid];
        worker.flush();
      } else if (e.data.type === 'ready'){
        this.ready = true;
        worker.flush();
      } else if (e.data.type === 'import_error'){
        console.log('Worker initialization error (most likely memory cap), restarting worker...');
        worker.retire();
      } else {
        console.log('???', e);
      }
    }
    worker.flush = function(){
      var flushId = getFlushId();
      while (this.queue.length > 0) {
        const a = this.queue.shift();
        if (flushId === a[3]) { this.queue.unshift(a); break; }
        opCodeDo(worker, a[0], a[1], a[2], flushId, a[4]);
      }
      if(this.retired && this.workload === 0) {
        const idx = retiredWorkers.indexOf(worker);
        retiredWorkers.splice(idx, 1);
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate(); // Release memory
      }
    }
    worker.retire = function(){
      if(this.retired) { return; }
      this.retired = true;
      const idx = workers.indexOf(worker);
      retiredWorkers.push(worker);
      workers.splice(idx, 1);
      available.push(this.queue);
      this.queue = [];
    }
    workers.push(worker);
  };

  this.generateKeyPair = function(cb) { return opCodeDo(getWorker(), FourQ.OpType.KEY_GEN, [cb]); }
  this.generateFromSeed = function(secretKey, cb) { return opCodeDo(getWorker(), FourQ.OpType.FROM_SEED, [secretKey, cb]); }
  this.sign = function(message, secretKey, cb) { return opCodeDo(getWorker(), FourQ.OpType.SIGN, [message, secretKey, cb]); }
  this.verify = function(signature, message, publicKey, cb) { return opCodeDo(getWorker(), FourQ.OpType.VERIFY, [signature, message, publicKey, cb]); }
  this.ecdhGenerateKeyPair = function(cb) { return opCodeDo(getWorker(), FourQ.OpType.ECDH_KEY_GEN, [cb]); }
  this.ecdhGenerateFromSeed = function(secretKey, cb) { return opCodeDo(getWorker(), FourQ.OpType.ECDH_FROM_SEED, [secretKey, cb]); }
  this.getSharedSecret = function(mySecret, theirPublicKey, cb) { return opCodeDo(getWorker(), FourQ.OpType.SHARED_SECRET, [mySecret, theirPublicKey, cb]); }
  this.test = function(cb) { return opCodeDo(getWorker(), FourQ.OpType.TEST, [cb]); }

  this.batch = function(count){
    batchCount = count;
    return {
      generateKeyPair: fleet.generateKeyPair,
      generateFromSeed: fleet.generateFromSeed,
      sign: fleet.sign,
      verify: fleet.verify,
      ecdhGenerateKeyPair: fleet.ecdhGenerateKeyPair,
      ecdhGenerateFromSeed: fleet.ecdhGenerateFromSeed,
      getSharedSecret: fleet.getSharedSecret,
    };
  };

  for (let i = 0; i < workerCount; ++i){ this.addWorker(); }

  setInterval(() => {
    if(available.length > 0){
      for (let i = 0; i < available.length; ++i){ this.addWorker(available[i]); }
      available.length = 0;
    }
  },100);

  // fleet queue flush
  setInterval(() => {
    if(fleetQueue.length > 0) {
      var count = 0, maxTry = fleetQueue.length;
      while(fleetQueue.length > 0 && count < maxTry){
        const a = fleetQueue.shift();
        const worker = getWorker(); if(!worker) { fleetQueue.unshift(a); break; }
        opCodeDo(worker, a[0], a[1], a[2], null, a[4]);
        ++count;
      }
    }
  }, 1000);

}
