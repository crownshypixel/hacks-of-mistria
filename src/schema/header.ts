import { z } from "zod"

export const Preset = z.object({
  assets: z.array(z.object({ name: z.string(), lut_index: z.number() })),
  eyes: z.number(),
  skin_tone: z.number()
})

export const EffectType = z.enum(["restorative", "speedy", "fairy", "guardians_shield", "mine_time", "slime_dash", "shrine_boon"])

// export const Spell = z.enum(["full_restore", "growth", "summon_rain"])
export const Forecast = z.enum(["calm", "inclement", "heavy_inclement", "special"])

export const Stats = z.object({
  mana_max: z.number(),
  invulnerable_hits: z.number(),
  stamina_current: z.number(),
  ancient_inspiration_time: z.number(),
  base_health: z.number(),
  free_baths: z.number(),
  end_of_day_status: z.string(),
  base_stamina: z.number(),
  gold: z.number(),
  renown: z.number(),
  essence: z.number(),
  mana_current: z.number(),
  status_effects: z
    .object({
      finish: z.number(),
      last_update: z.number(),
      amount: z.null(),
      type: EffectType
    })
    .nullable(),
  health_current: z.number(),
  perks_active: z.record(z.string(), z.boolean().nullable())
})

export const Weather = z.object({
  forecast: z.array(z.string())
})

export const Header = z.object({
  playtime: z.number(),
  preset: Preset,
  name: z.string(),
  farm_name: z.string(),
  calendar_time: z.number(),
  clock_time: z.number(),
  weather: Weather,
  stats: Stats
})
