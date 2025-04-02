import { cp, mkdir, readdir, rm, stat } from "node:fs/promises"
import { basename, join } from "node:path"
import { z } from "zod"
import { HOM_GAMEDATA_PATH, readJson, ROOT_PATH, writeJson } from "./util"

export type Version = `v${number}.${number}`

export const GamedataVersionSchema = z.string().refine((val) => {
  const parts = val.split(".") // v0.12 -> ["v0, 12"]
  return parts.length === 2 && parts[0].startsWith("v") && !isNaN(Number(parts[0].slice(1))) && !isNaN(Number(parts[1]))
})

export async function fetchVersionGamedata(version: `v${number}.${number}`) {
  // const ANNAS_GITHUB_URL = "https://raw.githubusercontent.com/AnnaNomoly/mistria-notes/refs/heads/main/game_data"
  // const JSON_FILES = ["cooking_recipes.json", "cosmetics.json", "furniture_recipes.json", "items.json"] as const

  const res = GamedataVersionSchema.safeParse(version)
  if (res.error) return null

  const gamedataFiles = await readdir(join(HOM_GAMEDATA_PATH, version)).catch(() => null)
  if (!gamedataFiles) return null
  const gamedataFilesPaths = gamedataFiles.map((file) => join(HOM_GAMEDATA_PATH, version, file))

  let cosmetics: string[] = []
  let furnitureRecipes: string[] = []
  let items: string[] = []
  let cookingRecipes: string[] = []

  for (const file of gamedataFilesPaths) {
    const jsonName = basename(file).slice(0, -5) // (remove the 5 last characters which is the .json file ext)
    if (jsonName === "cosmetics") cosmetics = await readJson(file)
    else if (jsonName === "furniture_recipes") furnitureRecipes = await readJson(file)
    else if (jsonName === "cooking_recipes") cookingRecipes = await readJson(file)
    else if (jsonName === "items") items = await readJson(file)
    else return null
  }

  return {
    cosmetics,
    furnitureRecipes,
    items,
    cookingRecipes,
    version
  }
}

export async function getGamedataVersionList() {
  return (await readdir(HOM_GAMEDATA_PATH)).map((v) => GamedataVersionSchema.parse(v)) as Version[]
}
