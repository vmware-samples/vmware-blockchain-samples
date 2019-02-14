/*
 * Copyright 2019 VMware, all rights reserved.
 */

export function random(max: number) {
  return 1 + Math.floor(Math.random() * max);
}

export function randomElement(arr: Array<any>) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomHex(length) {
  const random13chars = function () {
    return Math.random().toString(16).substring(2, 15);
  };
  const loops = Math.ceil(length / 13);
  return new Array(loops).fill(random13chars).reduce((string, func) => {
    return string + func();
  }, '').substring(0, length);
}

export function randomHexString(length) {
  return '0x' + randomHex(length);
}
