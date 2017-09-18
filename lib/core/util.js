/** @babel */

import bluebird from 'bluebird'

import fsSync from 'fs'
import fsPlus from 'fs-plus'

const fsAsync = bluebird.Promise.promisifyAll(fsSync)
const fs = new Proxy({}, {
  get: (target, key) => { return fsPlus[key] || fsAsync[key] },
  set: (target, key, value) => { fsPlus[key] = value }
})
export {fs}

import tempSync from 'temp'
const temp = bluebird.Promise.promisifyAll(tempSync)
export {temp}

function FourCC(str) {
  return (str.charCodeAt(0) << 24) +
         (str.charCodeAt(1) << 16) +
         (str.charCodeAt(2) << 8) +
         (str.charCodeAt(3) << 0)
}
export {FourCC}
