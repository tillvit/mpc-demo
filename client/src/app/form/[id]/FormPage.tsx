"use client"

import { FormStructure } from "@/../../../server/common/types"
import { clientSubmit } from "@/jiff/client"
import { useEffect, useState } from "react"
import FormQuestionComponent from "./FormQuestion"

export function FormPage({ id }: { id: string }) {

  const [formStrucuture, setFormStructure] = useState<FormStructure>()
  const [submitted, setSubmitted] = useState(false)
  const [responses, setResponses] = useState<Record<string, number | number[]>>({})

  useEffect(() => {
    async function fetchForm() {
      const res = await fetch(`http://localhost:8080/api/form/get/${id}`)
      const form = await res.json()
      if (!res.ok){
        console.error("Failed to fetch form", form)
        return
      }
      console.log(form)

      // Fill out form with default values
      setFormStructure(form)
    }
    fetchForm()
  }, [id])

  function setResponse(questionId: string, response: number | number[]) {
    console.log("Setting response for question", questionId, "to", response)
    setResponses((prev) => ({ ...prev, [questionId]: response }))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
     event.preventDefault();
    if (!formStrucuture) return;
    console.log("Submitting form with responses:", responses)
    clientSubmit(id, formStrucuture, responses)
    setSubmitted(true)
  }

  return (<div>
    <div>Form Page for {id}</div>
    <form onSubmit={submit} >
    {formStrucuture ? (
      <>
        <h1 className="text-2xl font-bold mb-4">{formStrucuture.title}</h1>
        {formStrucuture.questions.map((question) => (
          <FormQuestionComponent key={question.id} question={question} responses={responses} onChange={(value) => setResponse(question.id, value)} />
        ))}
        <input type="submit"/>
      </>
    ) : (
      <div>Loading...</div>
    )}
    </form>
    {/* <div>enter income:</div>
    <input
      type="text"
      onChange={(e) => setMoney(Number(e.target.value))}
      className="border border-gray-300 rounded px-2 py-1"
      value={money}
    />
    {
      submitted ?
      <div>Form submitted!</div>
      :<button onClick={submit} className="bg-blue-500 text-white py-2 px-4 rounded">send</button>
    } */}
    </div>
    )
}