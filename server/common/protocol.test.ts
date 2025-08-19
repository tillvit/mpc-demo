import { initializeCompute, shutdownJIFFServer, startJIFFServer } from "../jiff/server.ts"
import { getInputLengths, performComputation } from "./protocol.ts"
import { FormResult, FormStructure } from "./types.js"

import JIFF from 'jiff-mpc'

jest.setTimeout(10000)

beforeAll(async () => {
  await startJIFFServer();
});

afterAll(async () => {
  await shutdownJIFFServer();
});

describe("Numerical questions", () => {
  const form: FormStructure = {
    title: "Test",
    questions: [
      {
        id: "00000000",
        type: "numerical",
        required: true,
        question: "Enter a number",
      }
    ]
  }

  it("can compute small sum (3 parties)", async () => {
    const test = await setup("small-sum", form)
    let sum = 0
    for (let i = 0; i < 3; i++) {
      const rand = Math.floor(Math.random() * 10) + 1;
      await test.submitResponse([[rand]])
      sum += rand;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(true)
    expect(numResults.numValidResponses).toBe(3)
    expect(numResults.sum).toBe(sum)
    // freeComputation(test.getID())
  })
  it("can compute large sum (25 parties)", async () => {
    const test = await setup("large-sum", form)
    let sum = 0
    for (let i = 0; i < 25; i++) {
      const rand = Math.floor(Math.random() * 10) + 1;
      await test.submitResponse([[rand]])
      sum += rand;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(true)
    expect(numResults.numValidResponses).toBe(25)
    expect(numResults.sum).toBe(sum)
    // freeComputation(test.getID())
  })
  test.each([1, 2])("can reject insufficient parties", async (parties) => {
    const test = await setup(`insufficient-sum`, form)
    let sum = 0
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 10) + 1;
      await test.submitResponse([[rand]])
      sum += rand;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(false)
    expect(numResults.numValidResponses).toBe(parties)
    expect(numResults.sum).toBe(0)
    // freeComputation(test.getID())
  })
  it("can reject zero parties", async () => {
    const test = await setup(`zero-sum`, form)
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(false)
    expect(numResults.numValidResponses).toBe(0)
    expect(numResults.sum).toBe(0)
    // freeComputation(test.getID())
  })
  // it("can handle negative and decimal numbers", async () => {
  //   const test = await setup("negative-decimal-sum", form)
  //   let sum = 0
  //   for (let i = 0; i < 5; i++) {
  //     const rand = parseFloat(((Math.random() * 10) - 5).toFixed(2));
  //     await test.submitResponse([[rand]])
  //     sum += rand;
  //   }
  //   const results: FormResult[] = await test.compute()
  //   expect(results).toHaveLength(1)
  //   expect(results[0].type).toBe("numerical")
  //   const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
  //   expect(numResults.sufficient).toBe(true)
  //   expect(numResults.numValidResponses).toBe(5)
  //   expect(numResults.sum).toBeCloseTo(sum)
  // })
  it("can reject invalid inputs", async () => {
    const test = await setup("invalid-inputs-sum", {
      title: "Test",
      questions: [
        {
          id: "00000000",
          type: "numerical",
          required: true,
          question: "Enter a number",
          min: 0,
          max: 10,
        }
      ]
    })
    await test.submitResponse([[25]])
    await test.submitResponse([[15]])
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(false)
    expect(numResults.numValidResponses).toBe(0)
    expect(numResults.sum).toBe(0)
  })
  test.each([1, 3, 5])("can accept some valid and some invalid inputs", async (parties) => {
    jest.setTimeout(20000)
    const test = await setup("mixed-inputs-sum", {
      title: "Test",
      questions: [
        {
          id: "00000000",
          type: "numerical",
          required: true,
          question: "Enter a number",
          min: 0,
          max: 10,
        }
      ]
    })
    let sum = 0
    await test.submitResponse([[25]])
    await test.submitResponse([[15]])
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 6) + 1;
      await test.submitResponse([[rand]])
      sum += rand;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("numerical")
    const numResults = results[0] as Extract<FormResult, { type: "numerical" }>
    expect(numResults.sufficient).toBe(parties != 1)
    expect(numResults.numValidResponses).toBe(parties)
    expect(numResults.sum).toBe(parties == 1 ? 0 : sum)
  })
})

describe("Single Choice questions", () => {
  const form: FormStructure = {
    title: "Choice Test",
    questions: [
      {
        id: "00000000",
        type: "single_choice",
        required: true,
        question: "Select an option",
        options: [ "Option 1", "Option 2", "Option 3" ]
      }
    ]
  }
  it("can compute small single choice (3 parties)", async () => {
    const test = await setup("small-choice", form)
    let sum = [0, 0, 0]
    for (let i = 0; i < 3; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [0, 0, 0];
      array[rand] = 1;
      await test.submitResponse([array])
      sum[rand]++;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(true)
    expect(choiceResults.numValidResponses).toBe(3)
    expect(choiceResults.counts).toEqual(sum)
    // freeComputation(test.getID())
  })
  it("can compute large single choice (25 parties)", async () => {
    const test = await setup("large-choice", form)
    let sum = [0, 0, 0]
    for (let i = 0; i < 25; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [0, 0, 0];
      array[rand] = 1;
      await test.submitResponse([array])
      sum[rand]++;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(true)
    expect(choiceResults.numValidResponses).toBe(25)
    expect(choiceResults.counts).toEqual(sum)
    // freeComputation(test.getID())
  })

  test.each([1, 2])("can reject insufficient parties", async (parties) => {
    const test = await setup(`insufficient-choice`, form)
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [0, 0, 0];
      array[rand] = 1;
      await test.submitResponse([array])
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(parties)
    expect(choiceResults.counts).toEqual([0, 0, 0])
  })
  it("can reject zero parties", async () => {
    const test = await setup(`zero-choice`, form)
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(0)
    expect(choiceResults.counts).toEqual([0, 0, 0])
    // freeComputation(test.getID())
  })
  it("can reject invalid inputs", async () => {
    const test = await setup("invalid-inputs-choice", form)
    await test.submitResponse([[1, 1, 1]])
    await test.submitResponse([[1, 1, 0]])
    await test.submitResponse([[0, 0, 0]])
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(0)
    expect(choiceResults.counts).toEqual([0, 0, 0])
  })
  test.each([1, 3, 5])("can accept some valid and some invalid inputs", async (parties) => {
    jest.setTimeout(20000)
    const test = await setup("mixed-inputs-choice", form)
    let sum = [0, 0, 0]
    await test.submitResponse([[1, 0, 1]])
    await test.submitResponse([[1, 1, 0]])
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [0, 0, 0];
      array[rand] = 1;
      await test.submitResponse([array])
      sum[rand]++;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("single_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "single_choice" }>
    expect(choiceResults.sufficient).toBe(parties != 1)
    expect(choiceResults.numValidResponses).toBe(parties)
    expect(choiceResults.counts).toEqual(parties == 1 ? [0, 0, 0] : sum)
  })
})


describe("Multiple Choice questions", () => {
  const form: FormStructure = {
    title: "Choice Test",
    questions: [
      {
        id: "00000000",
        type: "multiple_choice",
        required: true,
        question: "Select options",
        options: [ "Option 1", "Option 2", "Option 3" ]
      }
    ]
  }
  it("can compute small multiple choice (3 parties)", async () => {
    const test = await setup("small-choice", form)
    let sum = [3, 3, 3]
    for (let i = 0; i < 3; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [1, 1, 1];
      array[rand] = 0;
      await test.submitResponse([array])
      sum[rand]--;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(true)
    expect(choiceResults.numValidResponses).toBe(3)
    expect(choiceResults.counts).toEqual(sum)
  })
  it("can compute large multiple choice (25 parties)", async () => {
    const test = await setup("large-choice", form)
    let sum = [25, 25, 25]
    for (let i = 0; i < 25; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [1, 1, 1];
      array[rand] = 0;
      await test.submitResponse([array])
      sum[rand]--;
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(true)
    expect(choiceResults.numValidResponses).toBe(25)
    expect(choiceResults.counts).toEqual(sum)
    // freeComputation(test.getID())
  })

  test.each([1, 2])("can reject insufficient parties", async (parties) => {
    const test = await setup(`insufficient-choice`, form)
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [1, 1, 1];
      array[rand] = 0;
      await test.submitResponse([array])
    }
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(parties)
    expect(choiceResults.counts).toEqual([0, 0, 0])
  })
  it("can reject zero parties", async () => {
    const test = await setup(`zero-choice`, form)
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(0)
    expect(choiceResults.counts).toEqual([0, 0, 0])
    // freeComputation(test.getID())
  })
  it("can reject invalid inputs", async () => {
    const test = await setup("invalid-inputs-choice", {
      title: "Choice Test",
      questions: [
        {
          id: "00000000",
          type: "multiple_choice",
          required: true,
          question: "Select options",
          options: [ "Option 1", "Option 2", "Option 3" ],
          maxSelections: 2
        }
      ]
    })
    await test.submitResponse([[0, 0, 0]])
    await test.submitResponse([[1, 1, 1]])
    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(false)
    expect(choiceResults.numValidResponses).toBe(0)
    expect(choiceResults.counts).toEqual([0, 0, 0])
  })
  test.each([1, 3, 5])("can accept some valid and some invalid inputs", async (parties) => {
    jest.setTimeout(20000)
    const test = await setup("mixed-inputs-choice", {
      title: "Choice Test",
      questions: [
        {
          id: "00000000",
          type: "multiple_choice",
          required: true,
          question: "Select options",
          options: [ "Option 1", "Option 2", "Option 3" ],
          maxSelections: 2
        }
      ]
    })

    let sum = [parties, parties, parties]
    for (let i = 0; i < parties; i++) {
      const rand = Math.floor(Math.random() * 3);
      const array = [1, 1, 1];
      array[rand] = 0;
      await test.submitResponse([array])
      sum[rand]--;
    }

    const results: FormResult[] = await test.compute()
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe("multiple_choice")
    const choiceResults = results[0] as Extract<FormResult, { type: "multiple_choice" }>
    expect(choiceResults.sufficient).toBe(parties != 1)
    expect(choiceResults.numValidResponses).toBe(parties)
    expect(choiceResults.counts).toEqual(parties == 1 ? [0, 0, 0] : sum)
  })
})

const usedIDs = new Set<string>();

async function setup(id: string, form: FormStructure) {
  while (usedIDs.has(id)) {
    id = `${id}-${Math.floor(Math.random() * 10000)}`
  }
  usedIDs.add(id);
  await initializeCompute(id, form)
  const analyst = await analystConnect(id, form)
  return {
    compute: () => analyst.compute(),
    submitResponse: (inputs: number[][]) => {
      const jiffClient = new JIFF.JIFFClient('http://localhost:8081', id);
      // jiffClient.apply_extension(JIFF.JIFFClientBigNumber, {crypto_provider: true});
      // jiffClient.apply_extension(JIFF.JIFFClientFixedpoint, {crypto_provider: true});
      // jiffClient.apply_extension(JIFF.JIFFClientNegative, {crypto_provider: true});

      return new Promise<void>((resolve) => {
        // Wait for server to connect
        jiffClient.wait_for([1, 's1'], async function () {
          await jiffClient.share_2D_array(inputs, getInputLengths(form), 2, [1, 's1'], [ jiffClient.id! ], null, jiffClient.counters.gen_op_id2("array", [1, 's1'], [ jiffClient.id! ]));
          jiffClient.disconnect(true, true);
          resolve()
        });
      });
    },
    getID: () => {
      return id
    }
  }
}


export async function analystConnect(computationID: string, form: FormStructure) {
  console.log("Connecting to computation", computationID)
  // Create the instance
  const jiffClient = new JIFF.JIFFClient('http://localhost:8081', computationID, {
    crypto_provider: true,
    party_id: 1,
    party_count: 100000,
    socketOptions: {
      reconnectionDelay: 3000,
      reconnectionDelayMax: 4000
    },
  });
  // jiffClient.apply_extension(JIFF.JIFFClientBigNumber, {crypto_provider: true});
  // jiffClient.apply_extension(JIFF.JIFFClientFixedpoint, {crypto_provider: true});
  // jiffClient.apply_extension(JIFF.JIFFClientNegative, {crypto_provider: true});

  // Wait for server to connect
  await new Promise<void>((resolve) => {
    jiffClient.wait_for(['s1'], function () {
      // save_keys(); // save the keys in case we need them again in the future
      resolve();
    });
  })

  return {
    close: () => {
      jiffClient.disconnect(true, true);
    },
    compute: async () => {
      return new Promise<FormResult[]>((resolve) => {
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
