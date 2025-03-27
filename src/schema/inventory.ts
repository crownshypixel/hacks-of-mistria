import { z } from "zod"

export const ARMOR_SLOTS = 5
export const RENOWN_SLOTS = 8
export const INVENTORY_SLOTS = [10, 20, 30]

export const InfusionSchema = z.enum([
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

export const EquipmentTagSchema = z.enum(["head", "chest", "legs", "boots", "accessory"])

export const BasicMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.string(),
  inner_item: z.null(),
  infusion: InfusionSchema.nullable()
})

export const PouchMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.enum(["basic_pouch", "large_pouch"]),
  inner_item: z.null(),
  infusion: InfusionSchema.nullable()
})

export const ScrollMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.enum(["crafting_scroll", "recipe_scroll"]),
  inner_item: z.string(),
  infusion: z.null()
})

export const PurseMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.number(),
  item_id: z.literal("purse"),
  inner_item: z.null(),
  infusion: z.null()
})

export const CosmeticMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.string(),
  animal_cosmetic: z.null(),
  gold_to_gain: z.null(),
  item_id: z.literal("cosmetic"),
  inner_item: z.null(),
  infusion: z.null()
})

export const AnimalCosmeticMemberSchema = z.object({
  auto_use: z.boolean().default(false),
  cosmetic: z.null(),
  animal_cosmetic: z.object({ cosmetic: z.string(), animal: z.string() }),
  gold_to_gain: z.null(),
  item_id: z.literal("animal_cosmetic"),
  inner_item: z.null(),
  infusion: z.null()
})

export const MemberSchema = z.union([
  BasicMemberSchema,
  PouchMemberSchema,
  ScrollMemberSchema,
  PurseMemberSchema,
  CosmeticMemberSchema,
  AnimalCosmeticMemberSchema
])

export type Member = z.infer<typeof MemberSchema>

export const ArmorInventorySchema = z
  .object({
    required_tags: z.array(EquipmentTagSchema).nonempty(),
    members: z.array(BasicMemberSchema).default([])
  })
  .array()
  .length(ARMOR_SLOTS)

export type ArmorInventory = z.infer<typeof ArmorInventorySchema>

export const RenownInventorySchema = z
  .object({
    required_tags: z.array(EquipmentTagSchema).default([]),
    members: z
      .array(
        z.union([
          BasicMemberSchema,
          PouchMemberSchema,
          ScrollMemberSchema,
          PurseMemberSchema,
          CosmeticMemberSchema,
          AnimalCosmeticMemberSchema
        ])
      )
      .default([])
  })
  .array()
  .length(RENOWN_SLOTS)

export type RenownInventory = z.infer<typeof RenownInventorySchema>

export const PlayerInventorySchema = z
  .object({
    required_tags: z.array(EquipmentTagSchema).length(0),
    members: z
      .array(
        z.union([
          BasicMemberSchema,
          PouchMemberSchema,
          ScrollMemberSchema,
          PurseMemberSchema,
          CosmeticMemberSchema,
          AnimalCosmeticMemberSchema
        ])
      )
      .default([])
  })
  .array()
  .refine((arr) => INVENTORY_SLOTS.includes(arr.length), {
    message: "Player's inventory must have 10, 20 or 30 slots"
  })

export type PlayerInventory = z.infer<typeof PlayerInventorySchema>
