import { FormQuestion } from "@../../../../server/common/types"
import { getFormInput } from "./inputs/registry"


export interface FormQuestionProps<T = FormQuestion["type"]> {
  question: Extract<FormQuestion, { type: T }>
  responses: Record<string, number | number[]>
  onChange: (value: number | number[]) => void
}

export default function FormQuestionComponent(props: FormQuestionProps) {
  const Input = getFormInput(props.question.type)
  return (<div className="mb-4 bg-gray-900/30 border border-gray-700 p-4 rounded">
    <h3 className="mb-2">{props.question.question}</h3>
    <Input {...props} />
  </div>)
}