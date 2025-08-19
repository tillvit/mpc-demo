"use client"

import { Analyst, analystConnect } from "@/jiff/analyst"
import { useEffect, useRef, useState } from "react"
import { FormResult } from "../../../../../server/common/types"

export function ManagePage({ id }: { id: string }) {

  const [analyst, setAnalyst] = useState<Analyst>()
  const [result, setResult] = useState<FormResult[]>()

  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true

      async function fetchForm() {
        const res = await fetch(`http://localhost:8080/api/form/get/${id}`)
        const form = await res.json()
        analystConnect(id, form).then(a => {
          setAnalyst(a);
        })
      }
      fetchForm()
    }
  }, [id])



  async function compute() {
    console.log("Computing...")
    const res = await analyst?.compute()
    setResult(res)
  }

  return (<div>
    <h1 className="text-lg font-bold">Form created!</h1>
    <p>Use this link to submit your data: <code>http://localhost:3000/form/{id}</code></p>
    <p>Once all parties have submitted, hit the button below to compute the result.</p>
    {
      result ? <div>
        <p>{JSON.stringify(result)}</p>
      </div> : <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={compute}>Compute</button>
    }

    </div>)
}