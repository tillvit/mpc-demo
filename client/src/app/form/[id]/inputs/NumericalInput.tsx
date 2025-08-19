import { useState } from "react"
import { FormQuestionProps } from "../FormQuestion"

export default function NumericalInput({ responses, question, onChange }: FormQuestionProps<"numerical">) {

  const [valid, setValid] = useState(true);

  return <div>
    <input
      type="number"
      min={question.min}
      max={question.max}
      onChange={(e) => {
        const newValue = e.target.value.replaceAll(/[^0-9.-]/g, "");
        if (!e.target.validity.valid) return
        onChange(Number(newValue))
      }}
      onInput={(e: React.FormEvent<HTMLInputElement>) => {
        setValid(e.currentTarget.validity.valid);
      }}
      className="border border-gray-300 rounded px-2 py-1"
    />
    {!valid && <p className="mt-2 text-sm italic text-red-500">Please enter a valid number</p>}
  </div>
}