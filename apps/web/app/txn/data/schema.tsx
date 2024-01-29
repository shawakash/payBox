import { TxnSchema } from "@paybox/common"
import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = TxnSchema

export type Task = z.infer<typeof taskSchema>