var generateuid=(function () {
  'use strict';

  var isNode=typeof process != 'undefined' && typeof process.pid == 'number';

  if(isNode){
    var crypto = require('crypto');
  }

  function random(count) {
    if (isNode) {
      return nodeRandom(count)
    } else {
      var crypto = window.crypto || window.msCrypto
      if (!crypto) throw new Error("Your browser does not support window.crypto.")
      return browserRandom(count)
    }
  }

  function nodeRandom(count) {
    var buf = crypto.randomBytes(count);
    return [].slice.call(buf)
  }

  function browserRandom(count) {
    var nativeArr = new Uint8Array(count)
    var crypto = window.crypto || window.msCrypto
    crypto.getRandomValues(nativeArr)
    return [].slice.call(nativeArr)
  }

  function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
  }

  function nodePrint() {
    var os = require('os'),
      padding = 2,
      pid = pad((process.pid).toString(36), padding),
      hostname = os.hostname(),
      length = hostname.length,
      hostId = pad((hostname)
        .split('')
        .reduce(function (prev, char) {
          return +prev + char.charCodeAt(0);
        }, +length + 36)
        .toString(36),
      padding);
    return pid + hostId;
  }

  function browserPrint() {
    var i, count = 0;
    for (i in window) {
      count++;
    }
    var globalCount=count.toString(36);
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      globalCount, 4);
  }

  var fingerprint = isNode ? nodePrint() : browserPrint();

  var c=0;
  var blockSize = 4;
  var base = 256;
  var discreteValues = Math.pow(256, 2);//65536 ffff

  function randomBlock(cryptoBytes) {
    if(cryptoBytes){
      let randomNrs = random(4); // 0-255
      let r1=randomNrs[0].toString(16);
      let r2=randomNrs[1].toString(16);
      let r3=randomNrs[2].toString(16);
      let r4=randomNrs[3].toString(16);
      return r1+r2+r3+r4;
    }else{
      let rand=Math.floor(Math.random()*Math.pow(256,4)).toString(16);
      return pad(rand,8);
    }
  }

  function safeCounter() {
    c = (c < discreteValues) ? c : 0;
    c++; // this is not subliminal
    return c - 1;
  }

  function _uid(cryptoBytes=false) {
    var now = Date.now();
    var timestamp = now;//(now).toString(16);
    var random = randomBlock(cryptoBytes)+randomBlock(cryptoBytes);
    var counter = pad(safeCounter().toString(16), 4);
    // 8 is (Math.pow(256, 4)-1).toString(16).length
    // so counter will always be 8 characters long
    return  (timestamp +"-"+ random +"-"+ fingerprint + "-" + counter);
  }

  return _uid;
}());

if(typeof module!="undefined"){
  if(typeof module.exports!="undefined"){
    module.exports = generateuid;
  }
}
