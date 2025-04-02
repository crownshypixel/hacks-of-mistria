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

  // We're checking if there are existing data under HOM_GAMEDATA_PATH/version and if there are, then return those, else try to fetch them from anna's github
  const existingGamedataVersionPath = join(HOM_GAMEDATA_PATH, version)
  const existingGamedata = await readdir(existingGamedataVersionPath, { withFileTypes: true }).catch(() => null)

  // we're loading here the files paths to read at the end
  let gamedataFiles: string[] = []

  // if (!existingGamedata) {
  //   const res = await fetch(`${ANNAS_GITHUB_URL}/${version}/parsed/items.json`).catch(() => null)
  //   if (!res || !res?.ok) {
  //     // No ids of the version in anna's github
  //     return null
  //   }

  //   await mkdir(join(HOM_GAMEDATA_PATH, version), { recursive: true })

  //   for (const file of JSON_FILES) {
  //     const res = await fetch(`${ANNAS_GITHUB_URL}/${version}/parsed/${file}`).catch(() => null)

  //     if (!res || !res.ok) {
  //       // remove any remnants if some files where fetched but at least one failed
  //       await rm(join(HOM_GAMEDATA_PATH, version), { recursive: true, force: true })
  //       return null
  //     }

  //     const contents = await res.json()
  //     const jsonFile = join(HOM_GAMEDATA_PATH, version, file)
  //     await writeJson(jsonFile, contents)

  //     gamedataFiles.push(jsonFile)
  //   }
  // } else {
  //   gamedataFiles = existingGamedata.map((dirent) => join(dirent.parentPath, dirent.name))
  // }

  let cosmetics: string[] = []
  let furnitureRecipes: string[] = []
  let items: string[] = []
  let cookingRecipes: string[] = []

  for (const file of gamedataFiles) {
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

// export async function initGamedata() {
//   const existingGamedataDir = await stat(HOM_GAMEDATA_PATH).catch(() => null)

//   if (!existingGamedataDir || !existingGamedataDir.isDirectory()) {
//     const prefetchedGamedata = join(ROOT_PATH, "gamedata")
//     const prefetchedVersionEntries = await readdir(prefetchedGamedata, { withFileTypes: true })

//     for (const entry of prefetchedVersionEntries) {
//       await cp(entry.parentPath, HOM_GAMEDATA_PATH, { recursive: true })
//     }
//   }
// }

export async function getGamedataVersionList() {
  return (await readdir(HOM_GAMEDATA_PATH)).map((v) => GamedataVersionSchema.parse(v)) as Version[]
}
