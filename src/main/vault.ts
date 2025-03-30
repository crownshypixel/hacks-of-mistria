import path from "node:path"
import { readdir, rm } from "node:fs/promises"
import { HeaderSchema } from "schema/header"
import { PlayerSchema } from "schema/player"
import { InfoSchema } from "schema/info"
import { APPDATA_PATH, HOM_GAMEDATA_PATH, readJson, ROOT_PATH, safeExecFile, updateObjectValue, writeJson } from "main/util"
import { GamedataSchema } from "schema/gamedata"
import fs from "node:fs/promises"
import { z } from "zod"
import { stat, cp } from "node:fs/promises"

export const LOCAL_GAMEDATA_PATH = path.join(APPDATA_PATH, "Local", "FieldsOfMistria")
export const SAVES_PATH = path.join(LOCAL_GAMEDATA_PATH, "saves")
export const UNPACKING_DIR_PATH = path.join(APPDATA_PATH, "Local", "Temp", "hacks-of-mistria")
export const VAULTC_PATH = path.join(ROOT_PATH, "vaultc.exe")
export const JSON_KEYS = [
  "beach",
  "checksums",
  "deep_woods",
  "earth_seal",
  "eastern_raod",
  "farm",
  "fire_seal",
  "game_stats",
  "gamedata",
  "haydens_farm",
  "header",
  "info",
  "narrows",
  "npcs",
  "player",
  "player_home",
  "quests",
  "summit",
  "town",
  "water_seal",
  "western_ruins"
] as const

export const JsonParsersMap = {
  header: HeaderSchema,
  player: PlayerSchema,
  info: InfoSchema,
  gamedata: GamedataSchema
}

export const vaultc = {
  pack: async (unpackPath: string, savePath: string) => safeExecFile(VAULTC_PATH, ["pack", unpackPath, savePath]),
  unpack: async (savePath: string, unpackPath: string) => safeExecFile(VAULTC_PATH, ["unpack", savePath, unpackPath])
}

export type SavesPaths = {
  [saveId: string]: {
    json: {
      [filenameKey in (typeof JSON_KEYS)[number]]: string
    }
    unpackPath: string
    originPath: string
  }
}

export const savesPaths: SavesPaths = {}

export async function getSavesPaths() {
  return (await readdir(SAVES_PATH)).filter((file) => file.endsWith(".sav")).map((file) => path.join(SAVES_PATH, file))
}

export async function unpackSave(savePath: string) {
  const saveId = path.basename(savePath).replace(".sav", "")
  const unpackPath = path.join(UNPACKING_DIR_PATH, saveId)

  // console.time(`vaultc ${saveId}`)
  await vaultc.unpack(savePath, unpackPath)
  // console.timeEnd(`vaultc ${saveId}`)

  // @ts-ignore
  savesPaths[saveId] = {}
  // @ts-ignore
  savesPaths[saveId].json = {}

  for (const key of JSON_KEYS) {
    savesPaths[saveId].originPath = savePath
    savesPaths[saveId].unpackPath = unpackPath
    savesPaths[saveId].json[key] = path.join(unpackPath, `${key}.json`)
  }

  return saveId
}

export async function unpackAllSaves() {
  const paths = await getSavesPaths()

  await rm(UNPACKING_DIR_PATH, { recursive: true, force: true })

  return Promise.all(paths.map((path) => unpackSave(path)))
}

export async function packSave(saveId: string, shouldBringOnTop: boolean) {
  const savePaths = savesPaths[saveId]

  if (shouldBringOnTop) {
    const longestLastPlayed = Math.max(
      ...(await Promise.all(
        Object.entries(savesPaths).map(async ([_, _savePaths]) => {
          const info = InfoSchema.parse(await readJson(_savePaths.json.info))
          return info.last_played
        })
      ))
    )

    const parsedInfo = InfoSchema.parse(await readJson(savePaths.json.info))
    const currentLastPlayed = parsedInfo.last_played

    if (currentLastPlayed <= longestLastPlayed) {
      const updatedInfo = updateObjectValue(parsedInfo, { keyPath: "last_played", value: longestLastPlayed + 0.00000000001 })
      await writeJson(savePaths.json.info, InfoSchema.parse(updatedInfo))
    }
  }

  await vaultc.pack(savePaths.unpackPath, savePaths.originPath)

  return Date.now()
}

// TODO: Add better type support for `keyPath`
type UpdateType = { json: (typeof JSON_KEYS)[number]; keyPath: string; value: any }

async function applyUpdate(saveId: string, update: UpdateType) {
  const savePaths = savesPaths[saveId]

  const jsonKey = update.json
  const jsonPath = savePaths.json[jsonKey]

  const SchemaParser = JsonParsersMap[jsonKey]
  const parsedJson = SchemaParser.parse(await readJson(jsonPath))

  const updatedObj = updateObjectValue(parsedJson, { keyPath: update.keyPath, value: update.value })

  await writeJson(jsonPath, SchemaParser.parse(updatedObj))
}

export function update(saveId: string, updates: UpdateType[] | UpdateType) {
  if (Array.isArray(updates)) {
    for (const update of updates) {
      return applyUpdate(saveId, update)
    }
  } else {
    return applyUpdate(saveId, updates)
  }
}

export async function getSaveInfo(saveId: string) {
  const savePaths = savesPaths[saveId]

  const { header, player, info } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedInfo = InfoSchema.parse(await readJson(info))

  return {
    playerName: parsedHeader.name,
    farmName: parsedHeader.farm_name,
    playtime: parsedHeader.playtime,
    gold: parsedHeader.stats.gold,
    essence: parsedHeader.stats.essence,
    renown: parsedHeader.stats.renown,
    calendar: parsedHeader.calendar_time,
    clock: parsedHeader.clock_time,
    lastPlayed: parsedInfo.last_played
  }
}

type SaveBasicInfo = {
  [saveId: string]: Awaited<ReturnType<typeof getSaveInfo>> & { saveId: string }
}

export async function getAllSavesInfo() {
  const saveIds = Object.keys(savesPaths)

  let saveInfo: SaveBasicInfo = {}
  for (const saveId of saveIds) {
    saveInfo[saveId] = {
      ...(await getSaveInfo(saveId)),
      saveId
    }
  }

  return saveInfo
}

export async function getSingleSaveInfo(saveId: string) {
  const savePaths = savesPaths[saveId]

  const { header, player, info } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))
  const parsedInfo = InfoSchema.parse(await readJson(info))

  return {
    playerName: parsedHeader.name,
    farmName: parsedHeader.farm_name,
    playtime: parsedHeader.playtime,
    pronoun: parsedPlayer.pronoun_choice,
    gold: parsedHeader.stats.gold,
    essence: parsedHeader.stats.essence,
    stamina: parsedHeader.stats.base_stamina,
    health: parsedHeader.stats.base_health,
    renown: parsedHeader.stats.renown,
    calendar: parsedHeader.calendar_time,
    birthday: parsedPlayer.birthday,
    clock: parsedHeader.clock_time,
    lastPlayed: parsedInfo.last_played,
    weather: parsedHeader.weather.forecast[0],
    playerInventory: parsedPlayer.inventory,
    renownInventory: parsedPlayer.renown_reward_inventory,
    armorInventory: parsedPlayer.armor
  }
}

export async function backupSaves(backupPath: string) {
  await fs.mkdir(backupPath, { recursive: true })

  const savePaths = await getSavesPaths()

  let count = 0
  for (const savePath of savePaths) {
    ++count
    await fs.copyFile(savePath, path.join(backupPath, path.basename(savePath)))
  }

  return { backupPath, savesCopied: count }
}

const VersionSchema = z.string().refine((val) => {
  // v0.12 -> ["v0, 12"]
  const parts = val.split(".")
  return parts.length === 2 && parts[0].startsWith("v") && !isNaN(Number(parts[0].slice(1))) && !isNaN(Number(parts[1]))
})

const ANNAS_GITHUB_URL = "https://raw.githubusercontent.com/AnnaNomoly/mistria-notes/refs/heads/main/game_data"
const JSON_FILES = ["cooking_recipes.json", "cosmetics.json", "furniture_recipes.json", "items.json"] as const

export async function fetchVersionGamedata(version: `v${number}.${number}`) {
  const res = VersionSchema.safeParse(version)
  if (res.error) return null

  // We're checking if there are existing data under HOM_GAMEDATA_PATH/version and if there are, then return those, else try to fetch them from anna's github
  const existingGamedataVersionPath = path.join(HOM_GAMEDATA_PATH, version)
  const existingGamedata = await readdir(existingGamedataVersionPath, { withFileTypes: true }).catch(() => null)

  // we're loading here the files paths to read at the end
  let gamedataFiles: string[] = []

  if (!existingGamedata) {
    const res = await fetch(`${ANNAS_GITHUB_URL}/${version}/parsed/items.json`).catch(() => null)
    if (!res || !res?.ok) {
      // No ids of the version in anna's github
      return null
    }

    await fs.mkdir(path.join(HOM_GAMEDATA_PATH, version), { recursive: true })

    for (const file of JSON_FILES) {
      const res = await fetch(`${ANNAS_GITHUB_URL}/${version}/parsed/${file}`).catch(() => null)

      if (!res || !res.ok) {
        // remove any remnants if some files where fetched but at least one failed
        await rm(path.join(HOM_GAMEDATA_PATH, version), { recursive: true, force: true })
        return null
      }

      const contents = await res.json()
      const jsonFile = path.join(HOM_GAMEDATA_PATH, version, file)
      await writeJson(jsonFile, contents)

      gamedataFiles.push(jsonFile)
    }
  } else {
    gamedataFiles = existingGamedata.map((dirent) => path.join(dirent.parentPath, dirent.name))
  }

  let cosmetics: string[] = []
  let furnitureRecipes: string[] = []
  let items: string[] = []
  let cookingRecipes: string[] = []

  for (const file of gamedataFiles) {
    const jsonName = path.basename(file).slice(0, -5) // (remove the 5 last characters which is the .json file ext)
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

export async function initGamedata() {
  const existingGamedataDir = await stat(HOM_GAMEDATA_PATH).catch(() => null)

  if (!existingGamedataDir || !existingGamedataDir.isDirectory()) {
    const prefetchedGamedata = path.join(ROOT_PATH, "gamedata")
    const prefetchedVersionEntries = await readdir(prefetchedGamedata, { withFileTypes: true })

    for (const entry of prefetchedVersionEntries) {
      await cp(entry.parentPath, HOM_GAMEDATA_PATH, { recursive: true })
    }
  }
}

type Version = `v${number}.${number}`

export async function getGamedataVersionList() {
  return (await readdir(HOM_GAMEDATA_PATH)).map((v) => VersionSchema.parse(v)) as Version[]
}
