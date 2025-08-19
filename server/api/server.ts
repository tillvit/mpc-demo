import bodyParser from "body-parser"
import cors from 'cors'
import express from "express"
import z from "zod"
import { FormSchema, type FormStructure } from "../common/types.ts"
import { initializeCompute } from "../jiff/server.ts"

const app = express();

app.use(bodyParser.json())
app.use(cors());

const formMap: { [key: string]: FormStructure } = {}


app.post("/api/form/create", (req, res) => {
  const computationID = Math.random().toString(36).substring(2, 15)
  const form = z.safeParse(FormSchema, req.body) // will throw if invalid

  if (!form.success) {
    return res.status(400).json({ error: "Invalid form data", issues: form.error.issues })
  }
  formMap[computationID] = form.data

  initializeCompute(computationID, form.data).then(() => {
    res.json({ id: computationID })
  })

})

app.get("/api/form/get/:id", (req, res) => {
  const form = formMap[req.params.id]
  if (!form) return res.status(404).json({ error: "Form not found" })
  res.json(form)
})

app.listen(8080, function () {
  console.log('API listening on *:8080');
})

