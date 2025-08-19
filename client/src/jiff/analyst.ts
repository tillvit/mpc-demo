"use client"
import { performComputation } from '../../../server/common/protocol'
import { FormResult, FormStructure } from '../../../server/common/types'
import { loadJIFF } from './jiff'

export interface Analyst {
  close: () => void;
  compute: () => Promise<FormResult[]>;
  getPublicKey: () => Uint8Array<ArrayBufferLike> | undefined;
  getPrivateKey: () => Uint8Array<ArrayBufferLike> | undefined;
}

const options = {
  crypto_provider: true,
  party_id: 1,
  party_count: 100000,
  socketOptions: {
    reconnectionDelay: 3000,
    reconnectionDelayMax: 4000
  },
};

export async function analystConnect(computationID: string, form: FormStructure): Promise<Analyst> {
  await loadJIFF()
  console.log("Connecting to computation", computationID)
  // Create the instance
  const jiffClient = new JIFFClient('http://localhost:8081', computationID, options);
  // jiffClient.apply_extension(jiff_bignumber, {crypto_provider: true});
  // jiffClient.apply_extension(jiff_fixedpoint, {crypto_provider: true});
  // jiffClient.apply_extension(jiff_negativenumber, {crypto_provider: true});
  console.log(jiffClient)

  // Wait for server to connect
  jiffClient.wait_for(['s1'], function () {
    // save_keys(); // save the keys in case we need them again in the future

    console.log('Computation initialized!');
    console.log('Hit enter when you decide it is time to compute!');
  });

  return {
    close: () => {
      jiffClient.disconnect(true, true);
    },
    compute: async () => {
      return new Promise((resolve) => {
        jiffClient.emit('begin', [ 's1' ], '');
        console.time("compute")

        jiffClient.listen('number', function (_, party_count) {

          performComputation(jiffClient, parseInt(party_count), form).then(function (results) {
            jiffClient.disconnect(true, true);
            console.timeEnd("compute")
            return resolve(results);
          });
        });
      })
    },
    getPublicKey: () => {
      return jiffClient.public_key
    },
    getPrivateKey: () => {
      return jiffClient.secret_key
    },
  }
}
