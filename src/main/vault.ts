import path from "node:path"
import { promisify } from "node:util"
import { readdir, rm } from "node:fs/promises"
import { execFile } from "node:child_process"
import { InfoSchema } from "../schema"
import { APPDATA_PATH, readJson, ROOT_PATH, updateObjectValue, writeJson } from "./util"

const execFileAsync = promisify(execFile)

const LOCAL_GAMEDATA_PATH = path.join(APPDATA_PATH, "Local", "FieldsOfMistria")
const SAVES_PATH = path.join(LOCAL_GAMEDATA_PATH, "saves")
const UNPACKING_DIR_PATH = path.join(APPDATA_PATH, "Local", "Temp", "hacks-of-mistria")
const VAULTC_PATH = path.join(ROOT_PATH, "vaultc.exe")
const JSON_KEYS = [
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

const vaultc = {
  pack: async (unpackPath: string, savePath: string) => await execFileAsync(VAULTC_PATH, ["pack", unpackPath, savePath]),
  unpack: async (savePath: string, unpackPath: string) => await execFileAsync(VAULTC_PATH, ["unpack", savePath, unpackPath])
}

type SavesPaths = {
  [saveId: string]: {
    json: {
      [filenameKey in (typeof JSON_KEYS)[number]]: string
    }
    unpackPath: string
    originPath: string
  }
}

export const savesPaths: SavesPaths = {}

async function getSavesPaths() {
  return (await readdir(SAVES_PATH)).filter((file) => file.endsWith(".sav")).map((file) => path.join(SAVES_PATH, file))
}

export async function unpackSave(savePath: string) {
  const saveId = path.basename(savePath).replace(".sav", "")
  const unpackPath = path.join(UNPACKING_DIR_PATH, saveId)

  await vaultc.unpack(savePath, unpackPath)

  for (const key of JSON_KEYS) {
    savesPaths[saveId].originPath = savePath
    savesPaths[saveId].unpackPath = unpackPath
    savesPaths[saveId][key] = path.join(unpackPath, `${key}.json`)
  }
}

export async function unpackAllSaves() {
  const paths = await getSavesPaths()

  await rm(UNPACKING_DIR_PATH, { recursive: true, force: true })

  for (const path of paths) {
    unpackSave(path)
  }
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
}
