import { z } from "zod"

const ARMOR_SLOTS = 5
const RENOWN_SLOTS = 8
const INVENTORY_SLOTS = [10, 20, 30]

export const Infusion = z.enum([
  "fortified",
  "hasty",
  "leeching",
  "sharp",
  "lightweight",
  "tireless",
  "restorative",
  "speedy",
  "likeable",
  "loveable",
  "fairy",
  "quality"
])

export const EquipmentTag = z.enum(["head", "chest", "legs", "boots", "accessory"])

export const BasicMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.string(),
  inner_item: z.null(),
  infusion: Infusion.nullable()
})

export const PouchMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.enum(["basic_pouch", "large_pouch"]),
  inner_item: z.null(),
  infusion: Infusion.nullable()
})

export const ScrollMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.enum(["crafting_scroll", "recipe_scroll"]),
  inner_item: z.string(),
  infusion: z.null()
})

export const PurseMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.number(),
  item_id: z.literal("purse"),
  inner_item: z.null(),
  infusion: z.null()
})

export const CosmeticMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.string(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.string(),
  inner_item: z.null(),
  infusion: z.null()
})

export const AnimalCosmeticMember = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.object({ cosmetic: z.string(), animal: z.string() }),
  gold_to_gain: z.null(),
  item_id: z.string(),
  inner_item: z.null(),
  infusion: z.null()
})

export const ArmorInventory = z
  .object({
    required_tags: z.array(EquipmentTag).nonempty(),
    members: z.array(BasicMember).default([])
  })
  .array()
  .length(ARMOR_SLOTS)

export const RenownInventory = z
  .object({
    required_tags: z.array(EquipmentTag).default([]),
    members: z
      .array(z.union([BasicMember, PouchMember, ScrollMember, PurseMember, CosmeticMember, AnimalCosmeticMember]))
      .default([])
  })
  .array()
  .length(RENOWN_SLOTS)

export const PlayerInventory = z
  .object({
    required_tags: z.array(EquipmentTag).length(0),
    members: z
      .array(z.union([BasicMember, PouchMember, ScrollMember, PurseMember, CosmeticMember, AnimalCosmeticMember]))
      .default([])
  })
  .array()
  .refine((arr) => INVENTORY_SLOTS.includes(arr.length), {
    message: "Player's inventory must have 10, 20 or 30 slots"
  })
