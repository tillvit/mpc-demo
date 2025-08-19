import cors from 'cors'
import express from 'express'
import { Server } from 'http'
import jiff_pkg from 'jiff-mpc'
const { JIFFServer, JIFFServerBigNumber, JIFFClientBigNumber, JIFFClientFixedpoint, JIFFClientNegative } = jiff_pkg

import { performComputation } from '../common/protocol.ts'
import type { FormStructure } from '../common/types.ts'

const app = express();
const server = new Server(app)
const jiff = new JIFFServer(server, {
  socketOptions: {
    pingTimeout: 1000,
    pingInterval: 2000
  }
})
// jiff.apply_extension(JIFFServerBigNumber, {crypto_provider: true});
app.use(cors());

export async function startJIFFServer() {
  return new Promise<void>((resolve) => {
    server.listen(8081, function () {
      console.log('Jiff listening on *:8081');
      resolve();
    })
  })
}

export async function shutdownJIFFServer() {
  return new Promise<void>((resolve, reject) => {
    server.closeAllConnections()
    server.close((err) => {
      if (err) return reject(err);
      console.log('JIFF server closed');
      resolve();
    });
  });
}


export async function initializeCompute(id: string, form: FormStructure) {
  jiff.computationMaps.maxCount[id] = 100000;

  const computationClient = jiff.compute(id, {
    crypto_provider: true
  })
  // computationClient.apply_extension(JIFFClientBigNumber, {crypto_provider: true});
  // computationClient.apply_extension(JIFFClientFixedpoint, {crypto_provider: true});
  // computationClient.apply_extension(JIFFClientNegative, {crypto_provider: true});
  computationClient.wait_for([1], function () {
    // Perform server-side computation.
    console.log('Computation initialized!', id)

    // When the analyst sends the begin signal, we start!
    computationClient.listen('begin', function () {
      console.log('Analyst sent begin signal!', id)

      // Get all connected parties IDs
      let party_count = 0
      const party_map = jiff.socketMaps.socketId[id];
      for (const id in party_map) {
        if (party_map.hasOwnProperty(id)) {
          party_count++;
        }
      }
      party_count--; // exclude analyst

      // Send number of parties to analyst
      computationClient.emit('number', [ 1 ], party_count.toString());

      // execute the mpc protocol
      performComputation(computationClient, party_count, form).then(function (result) {
        console.log(result)
        // setTimeout(() => {
        //   console.log('Computation finished!', id);
        //   jiff.freeComputation(id);
        // }, 20000);
      })
    });
  });
}

export async function freeComputation(id: string) {
  jiff.freeComputation(id);
}