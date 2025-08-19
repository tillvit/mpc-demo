import z from "zod"

export const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  questions: z.array(
    z.union([
      z.object({
        id: z.string().length(8).regex(/^[a-zA-Z0-9]+$/),
        type: z.literal("numerical"),
        question: z.string().min(1, "Question is required"),
        required: z.boolean(),
        min: z.number().optional(),
        max: z.number().optional()
      }),
      z.object({
        id: z.string().length(8).regex(/^[a-zA-Z0-9]+$/),
        type: z.literal("single_choice"),
        question: z.string().min(1, "Question is required"),
        required: z.boolean().default(false),
        options: z.array(z.string().min(1, "Option cannot be empty"))
      }),
      z.object({
        id: z.string().length(8).regex(/^[a-zA-Z0-9]+$/),
        type: z.literal("multiple_choice"),
        question: z.string().min(1, "Question is required"),
        required: z.boolean().default(false),
        options: z.array(z.string().min(1, "Option cannot be empty")),
        minSelections: z.int().min(0).optional(),
        maxSelections: z.int().min(1).optional(),
      })
    ])
  )
}).refine((data) => {
  for (const question of data.questions) {
    if (question.type === "multiple_choice") {
      if (question.maxSelections && question.maxSelections > question.options.length) {
        return false;
      }
    }
  }
  if (new Set(data.questions.map(q => q.id)).size !== data.questions.length) {
    return false;
  }
  return true;
})


export type FormStructure = z.infer<typeof FormSchema>;
export type FormQuestion = FormStructure["questions"][number];

export type NumericalQuestion = Extract<FormQuestion, { type: "numerical" }>;
export type SingleChoiceQuestion = Extract<FormQuestion, { type: "single_choice" }>;
export type MultipleChoiceQuestion = Extract<FormQuestion, { type: "multiple_choice" }>;

export type BaseResults = {
  sufficient: boolean
  numValidResponses: number
}

export type NumericalResults = BaseResults & {
  type: "numerical"
  sum: number
}

export type SingleChoiceResults = BaseResults & {
  type: "single_choice"
  counts: number[]
}

export type MultipleChoiceResults = BaseResults & {
  type: "multiple_choice"
  counts: number[]
}

export type FormResult = NumericalResults | SingleChoiceResults | MultipleChoiceResults
