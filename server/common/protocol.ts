import type { JIFFClient, SecretShare } from "jiff-mpc"
import type { FormResult, FormStructure, MultipleChoiceQuestion, NumericalQuestion, NumericalResults, SingleChoiceQuestion } from "./types.ts"

const MIN_SUFFICIENT_RESPONSES = 3


/**
 * Shares are inputted as 2D arrays, with each array representing a response to a question.
 * For numerical questions, the array will have one element. (e.g. [1])
 * For single/multiple choice questions, the array will have one element per option. (e.g. [1, 0, 0] for single choice, [1, 1, 0] for multiple choice).
 * A sample response could be:
 * [
 *   [1], // Numerical question response
 *   [0, 1, 0] // Single choice question response (Option 2 selected)
 * ]
 */

export async function performComputation(jiffClient: JIFFClient, party_count: number, form: FormStructure): Promise<FormResult[]> {
  console.log('Performing computation with', party_count, 'parties')
  // Receive shares from all parties that submitted
  let shares: SecretShare[][][] = [];
  for (let i = 2; i < party_count + 2; i++) {
    const share = (await jiffClient.share_2D_array([], getInputLengths(form), 2, [1, 's1'], [ i ], null, jiffClient.counters.gen_op_id2("array", [1, 's1'], [ i ])))[i]
    shares[i] = share
  }
  // Remove analyst and server shares
  shares = shares.slice(2)

  const results: FormResult[] = []
  for (let i = 0; i < form.questions.length; i++) {
    const question = form.questions[i];
    switch(question.type) {
      case "numerical": {
        results.push(await computeNumericalQuestion(jiffClient, question, shares.map(s => s[i][0])))
        break;
      }
      case "single_choice":
        results.push({
          ...await computeChoiceQuestion(jiffClient, question, shares.map(s => s[i])),
          type: "single_choice"
        })
        break;
      case "multiple_choice":
        results.push({
          ...await computeChoiceQuestion(jiffClient, question, shares.map(s => s[i]), question.minSelections, question.maxSelections ?? question.options.length),
          type: "multiple_choice"
        })
        break;
    }
  }
  console.log(results)
  return results
}


async function computeNumericalQuestion(jiffClient: JIFFClient, question: NumericalQuestion, responses: SecretShare[]): Promise<NumericalResults> {
  let numResponses = responses.length
  let sum: null | SecretShare = null;
  let numValidResponses: SecretShare | null = null;
  if (responses.length == 0) {
    return { type: "numerical", sum: 0, numValidResponses: 0, sufficient: false }
  }
  if (question.min !== undefined && question.min <= 0) question.min = undefined
  if (question.min !== undefined || question.max !== undefined) {
    for (const response of responses) {
      const check = withinRange(response, question.min, question.max);
      numValidResponses = numValidResponses == null ? check : numValidResponses.sadd(check);
      const modifiedShare = response.smult(check);
      sum = sum == null ? modifiedShare : sum.sadd(modifiedShare);
    }
    numResponses = await jiffClient.open(numValidResponses!, [1, "s1"])!
  } else {
    // Sum everyone's shares
    sum = responses[0];
    for (let p = 1; p < responses.length; p++) {
      sum = sum.sadd(responses[p]);
    }
  }
  // Not enough valid responses to not leak info
  if (numResponses < MIN_SUFFICIENT_RESPONSES) {
    return { type: "numerical", sum: 0, numValidResponses: numResponses, sufficient: false }
  }
  return {
    type: "numerical",
    sum: (await jiffClient.open(sum!, [1, "s1"])!),
    numValidResponses: numResponses,
    sufficient: true
  }
}

async function computeChoiceQuestion(jiffClient: JIFFClient, question: SingleChoiceQuestion | MultipleChoiceQuestion, responses: SecretShare[][], minChoices = 1, maxChoices = 1): Promise<{numValidResponses: number, sufficient: boolean, counts: number[]}> {
  let numValidResponses: SecretShare | null = null;
  let sums: SecretShare[] = new Array(question.options.length).fill(null);
  if (responses.length == 0) {
    return { counts: new Array(question.options.length).fill(0), numValidResponses: 0, sufficient: false }
  }
  for (const response of responses) {
    let sum = response[0];
    for (let i = 1; i < response.length; i++) {
      sum = sum.sadd(response[i])
    }
    let check: SecretShare
    if (maxChoices > 1) {
      check = isBoolean(response[0])
      // Check if all votes are 0 or 1
      for (let i = 1; i < response.length; i++) {
        check = check.smult(isBoolean(response[i]))
      }
      check = check.smult(withinRange(sum, minChoices, maxChoices));
    } else {
      check = withinRange(sum, minChoices, maxChoices);
    }

    numValidResponses = numValidResponses == null ? check : numValidResponses.sadd(check);
    for (let i = 0; i < response.length; i++) {
      const modifiedShare = response[i].smult(check);
      sums[i] = sums[i] == null ? modifiedShare : sums[i].sadd(modifiedShare);
    }
  }
  const numResponses = await jiffClient.open(numValidResponses!, [1, "s1"])!
  // Not enough valid responses to not leak info
  if (numResponses < MIN_SUFFICIENT_RESPONSES) {
    return { numValidResponses: numResponses, sufficient: false, counts: new Array(question.options.length).fill(0) }
  }
  return {
    numValidResponses: numResponses,
    sufficient: true,
    counts: await Promise.all(sums.map(s => jiffClient.open(s!, [1, "s1"])!))
  }
}

export function getInputLengths(form: FormStructure): {rows: number} & Record<string, number> {
  const lengths: {rows: number} & Record<string, number> = {rows: 0}
  form.questions.map((q, i) => {
    switch (q.type) {
      case "numerical":
        lengths[i] = 1
        break
      case "single_choice":
      case "multiple_choice":
        lengths[i] = q.options.length
        break
    }
  })
  lengths["rows"] = form.questions.length;
  return lengths
}

function isBoolean(share: SecretShare): SecretShare {
  return share.clt(2)
}

function withinRange(secret: SecretShare, min?: number, max?: number): SecretShare {

  let check = min !== undefined ? secret.cgteq(min) : secret.clteq(max!)
  if (max !== undefined) {
    check = check.smult(secret.clteq(max))
  }
  return check
}