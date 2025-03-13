import { z } from "zod"

export const Version = z.object({
  patch: z.number(),
  major: z.number(),
  minor: z.number(),
  pre: z.nullable(z.unknown())
})

export const Info = z.object({
  last_played: z.number(),
  version: Version,
  creation_version: Version
})
