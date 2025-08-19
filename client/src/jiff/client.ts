"use client"
import { getInputLengths } from "../../../server/common/protocol"
import { FormStructure } from "../../../server/common/types"
import { loadJIFF } from "./jiff"

export async function clientSubmit(id: string, form: FormStructure, responses: Record<string, number | number[]>): Promise<boolean> {
  if (!validateResponses(form, responses)) throw new Error("Invalid responses");
  await loadJIFF()
  return new Promise(resolve => {
    const jiffClient = new JIFFClient('http://localhost:8081', id, {crypto_provider: true});
    // jiffClient.apply_extension(jiff_bignumber, {crypto_provider: true});
    // jiffClient.apply_extension(jiff_fixedpoint, {crypto_provider: true});
    // jiffClient.apply_extension(jiff_negativenumber, {crypto_provider: true});


    // Package input into one list
    const inputs: number[][] = []
    for (const question of form.questions) {
      const response = responses[question.id];
      inputs.push(typeof response === "number" ? [response] : response);
    }
    console.log(inputs)

    // Wait for server to connect
    jiffClient.wait_for([1, 's1'], async function () {
      console.log('Connected! ID: ' + jiffClient.id);
      await jiffClient.share_2D_array(inputs, getInputLengths(form), 2, [1, 's1'], [ jiffClient.id! ], null, jiffClient.counters.gen_op_id2("array", [1, 's1'], [ jiffClient.id! ]));
      console.log('Shared input!');
      jiffClient.disconnect(true, true);
      console.log('Disconnected!');
      resolve(true);
    });
  });
}
function validateResponses(form: FormStructure, responses: Record<string, number | number[]>): boolean {
  for (const question of form.questions) {
    const response = responses[question.id];
    if (question.required && (response === undefined || response === null)) {
      return false;
    }
    switch (question.type) {
      case 'numerical':
        if (typeof response !== 'number' || isNaN(response)) {
          return false;
        }
        if (question.min !== undefined && response < question.min) {
          return false;
        }
        if (question.max !== undefined && response > question.max) {
          return false;
        }
        break;
      case 'single_choice':
        if (!Array.isArray(response) || response.length !== question.options.length) {
          return false;
        }
        for (const value of response) {
          if (typeof value !== 'number' || value < 0 || value > 1) {
            return false;
          }
        }
        if (response.every(value => value === 0) && question.required) {
          return false;
        }
        break;
      case 'multiple_choice':
        if (!Array.isArray(response) || response.length !== question.options.length) {
          return false;
        }
        let selections = 0
        for (const value of response) {
          if (typeof value !== 'number' || value < 0 || value > 1) {
            return false;
          }
          if (value === 1) selections++;
        }
        if (question.minSelections !== undefined && selections < question.minSelections) {
          return false;
        }
        if (question.maxSelections !== undefined && selections > question.maxSelections) {
          return false;
        }
        break;
    }
  }
  return true;
}