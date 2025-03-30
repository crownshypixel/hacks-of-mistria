import { createListCollection, Image } from "@chakra-ui/react"
import { InfusionSchema } from "schema/inventory"
import { z } from "zod"

export const InfusionWithNone = z.enum([...InfusionSchema.options, "none"])

export const infusionsCollection = createListCollection({
  items: Object.values(InfusionWithNone.enum).map((inf) => ({
    label: inf,
    value: inf
  }))
})
