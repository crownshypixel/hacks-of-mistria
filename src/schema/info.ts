import { z } from "zod"

export const VersionSchema = z.object({
  patch: z.number(),
  major: z.number(),
  minor: z.number(),
  pre: z.nullable(z.unknown())
})

export const InfoSchema = z.object({
  last_played: z.number(),
  version: VersionSchema,
  creation_version: VersionSchema
})

export type Info = z.infer<typeof InfoSchema>
