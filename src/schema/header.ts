import { z } from "zod"

export const PresetSchema = z.object({
  assets: z.array(z.object({ name: z.string(), lut_index: z.number() })),
  eyes: z.number(),
  skin_tone: z.number()
})

export const EffectTypeSchema = z.enum([
  "restorative",
  "speedy",
  "fairy",
  "guardians_shield",
  "mine_time",
  "slime_dash",
  "shrine_boon"
])

// export const Spell = z.enum(["full_restore", "growth", "summon_rain"])
export const ForecastSchema = z.enum(["calm", "inclement", "heavy_inclement", "special"])

export const StatsSchema = z
  .object({
    mana_max: z.number(),
    invulnerable_hits: z.number(),
    stamina_current: z.number(),
    base_health: z.number(),
    free_baths: z.number(),
    base_stamina: z.number(),
    gold: z.number(),
    renown: z.number(),
    essence: z.number(),
    mana_current: z.number(),
    health_current: z.number(),
    status_effects: z
      .object({
        finish: z.number(),
        last_update: z.number(),
        amount: z.null(),
        type: EffectTypeSchema
      })
      .nullable()
      .array()
  })
  .passthrough()

export const WeatherSchema = z.object({
  forecast: z.array(z.string())
})

export const CalendarTime = z.number().refine((time) => time % 86400 === 0, {
  message: "Calendar time must be multiple of 86400"
})

export const HeaderSchema = z
  .object({
    playtime: z.number(),
    preset: PresetSchema,
    name: z.string(),
    farm_name: z.string(),
    calendar_time: CalendarTime,
    clock_time: z.number(),
    weather: WeatherSchema,
    stats: StatsSchema
  })
  .passthrough()

export type Header = z.infer<typeof HeaderSchema>
