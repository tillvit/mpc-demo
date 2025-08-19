import { FormQuestion } from "@/../../../server/common/types"
import { FormQuestionProps } from "../FormQuestion"

import MultipleChoiceInput from "./MultipleChoiceInput"
import NumericalInput from "./NumericalInput"
import SingleChoiceInput from "./SingleChoiceInput"

const INPUT_REGISTRY: {[key in FormQuestion["type"]]: React.ComponentType<FormQuestionProps<key>>} = {
  numerical: NumericalInput,
  multiple_choice: MultipleChoiceInput,
  single_choice: SingleChoiceInput,
}

export function getFormInput(type: FormQuestion["type"]) {
  return INPUT_REGISTRY[type] as React.ComponentType<FormQuestionProps>
}
