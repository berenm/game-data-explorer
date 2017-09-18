/** @babel */

function FourCC(str) {
  return (str.charCodeAt(0) << 24) +
         (str.charCodeAt(1) << 16) +
         (str.charCodeAt(2) << 8) +
         (str.charCodeAt(3) << 0)
}
export {FourCC}
