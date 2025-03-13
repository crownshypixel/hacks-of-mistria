import { z } from "zod"
import { Preset, Stats } from "./header"
import { ArmorInventory, PlayerInventory, RenownInventory } from "./inventory"

const MAX_PRESET_SLOTS = 8

const Pronoun = z.enum([
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

export const Player = z
  .object({
    preset_index_selected: z.number(),
    presets: z.array(Preset).max(MAX_PRESET_SLOTS),
    recipe_unlocks: z.array(z.string()),
    farm_name: z.string(),
    name: z.string(),
    seen_cosmetics: z.array(z.string()),
    spells_learned: z.array(z.string()),
    birthday: z.number(),
    cosmetic_unlocks: z.string(),
    armor: ArmorInventory,
    inventory: PlayerInventory,
    stats: Stats,
    pinned_spell: z.string(),
    renown_reward_inventory: RenownInventory,
    pronoun_choice: Pronoun,
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
