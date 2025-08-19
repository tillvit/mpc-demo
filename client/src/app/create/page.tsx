"use client";

import { useRouter } from "next/navigation"
import { FormStructure } from "../../../../server/common/types"

export default function Create() {
  const router = useRouter()

  async function createForm() {

  const form: FormStructure = {
    title: "Sample Form",
    questions: [
      {
        id: "aaaaaaaa",
        type: "numerical",
        question: "What is your income?",
        required: true,
        min: 0,
        max: 100,
      },
      // {
      //   id: "bbbbbbbb",
      //   type: "single_choice",
      //   question: "What is your favorite color?",
      //   required: false,
      //   options: ["Red", "Blue", "Green"]
      // },
      // {
      //   id: "cccccccc",
      //   type: "multiple_choice",
      //   question: "Which fruits do you like?",
      //   required: true,
      //   options: ["Apple", "Banana", "Orange", "Grapes", "Option 5"],
      //   minSelections: 1,
      //   maxSelections: 3
      // }
      // ,
      // {
      //   id: "cccccccc",
      //   type: "single_choice",
      //   question: "Which fruits do you like?",
      //   required: true,
      //   options: ["Apple", "Banana", "Orange", "Grapes", "Option 5"],
      // }
    ]
  }


    const data = await fetch('http://localhost:8080/api/form/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())

    if (!data.id) {
      console.error("Failed to create form", data)
      return
    }
    console.log("Created form with ID", data.id)
    // Redirect to manage page
    router.push(`/manage/${data.id}`);
  }

  return (
   <button onClick={createForm}>Create</button>
  )

}