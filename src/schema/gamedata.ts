import { z } from "zod"
import { CalendarTime, WeatherSchema } from "./header"

export const GamedataSchema = z
  .object({
    date: CalendarTime,
    maximum_mines_level: z.number(), // TODO: add max
    clock: z.number(),
    weather: WeatherSchema,
    playtime: z.number()
  })
  .passthrough()

export type Gamedata = z.infer<typeof GamedataSchema>
