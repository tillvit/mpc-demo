import { useRef } from "react"
import { FormQuestionProps } from "../FormQuestion"

export default function SingleChoiceInput({ question, onChange }: FormQuestionProps<"single_choice">) {
  const choiceRef = useRef<HTMLDivElement>(null);

    function inputChanged() {
      if (!choiceRef.current) return;
      const output = []
      for (const optionElement of choiceRef.current.children) {
        const option = optionElement.firstChild as HTMLInputElement;
        output.push(Number(option.checked))
      }
      onChange(output);
    }

    return (<div
      ref={choiceRef}
      className="border border-gray-300 rounded px-2 py-1"
    >
      {
        question.options.map((option, index) => (
          <div key={index}>
          <input type="radio" value={index} name={question.id} onChange={inputChanged} id={`${question.id}-${index}`} />
          <label htmlFor={`${question.id}-${index}`}>{option}</label>
        </div>
        ))
      }
    </div>)
}