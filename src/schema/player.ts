import { z } from "zod"
import { PresetSchema, StatsSchema } from "schema/header"
import { ArmorInventorySchema, PlayerInventorySchema, RenownInventorySchema } from "schema/inventory"

export const MAX_PRESET_SLOTS = 8

export const PronounSchema = z.enum([
  "they_them",
  "she_her",
  "he_him",
  "she_they",
  "they_she",
  "he_they",
  "they_he",
  "he_she",
  "she_he",
  "it_its",
  "all",
  "none"
])

export type Pronoun = z.infer<typeof PronounSchema>

export const PlayerSchema = z
  .object({
    preset_index_selected: z.number(),
    presets: z.array(PresetSchema).max(MAX_PRESET_SLOTS),
    recipe_unlocks: z.array(z.string()),
    farm_name: z.string(),
    name: z.string(),
    seen_cosmetics: z.array(z.string()),
    spells_learned: z.array(z.string()),
    birthday: z.number(),
    cosmetic_unlocks: z.array(z.string()),
    armor: ArmorInventorySchema,
    inventory: PlayerInventorySchema,
    stats: StatsSchema,
    pinned_spell: z.string().nullable(),
    renown_reward_inventory: RenownInventorySchema,
    pronoun_choice: PronounSchema,
    skill_xp: z.object({
      archaeology: z.number(),
      farming: z.number(),
      cooking: z.number(),
      fishing: z.number(),
      ranching: z.number(),
      woodcrafting: z.number(),
      blacksmithing: z.number(),
      combat: z.number(),
      mining: z.number()
    })
  })
  .passthrough()

export type Player = z.infer<typeof PlayerSchema>
