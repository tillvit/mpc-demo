import type * as JIFF from "jiff-mpc"

const scripts = [
  // "/jiff/bignumber.js",
  "/jiff/jiff-client.js",
  // "/jiff/jiff-client-fixedpoint.js",
  // "/jiff/jiff-client-negativenumber.js",
  // "/jiff/jiff-client-bignumber.js"
];


declare global {
  var JIFFClient: typeof JIFF.JIFFClient;
  var jiff_fixedpoint: typeof JIFF.FixedPointExtension;
  var jiff_negativenumber: typeof JIFF.NegativeNumberExtension;
  var jiff_bignumber: typeof JIFF.BigNumberExtension;
  interface Window {
    JIFFClient: typeof JIFF.JIFFClient;
    jiff_fixedpoint: typeof JIFF.FixedPointExtension;
    jiff_negativenumber: typeof JIFF.NegativeNumberExtension;
    jiff_bignumber: typeof JIFF.BigNumberExtension;
  }
}

export async function loadJIFF() {
  if (window.JIFFClient) {return}
  console.log("Loading JIFF...")
  for (const src of scripts) {
    await fetch(src).then(res => res.text()).then(eval);
  }
  console.log("JIFF loaded.")
}
