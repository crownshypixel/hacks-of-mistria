import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path, { basename, join } from "node:path"
import os from "node:os"
import { z } from "zod"
import { execFile } from "node:child_process"
import { InfoSchema } from "schema/info"

export const ROOT_PATH = path.join(__dirname, "..", "..")
export const APPDATA_PATH = path.join(os.homedir(), "AppData")
export const VAULTC_PATH = path.join(ROOT_PATH, "vaultc.exe")
export const HOM_USERDATA_PATH = path.join(APPDATA_PATH, "Roaming", "hacks-of-mistria")
export const HOM_GAMEDATA_PATH = path.join(HOM_USERDATA_PATH, "gamedata")
export const FOM_LOCAL_PATH = path.join(APPDATA_PATH, "Local", "FieldsOfMistria")
export const FOM_SAVES_PATH = path.join(FOM_LOCAL_PATH, "saves")
export const HOM_TEMP_PATH = path.join(APPDATA_PATH, "Local", "Temp", "hacks-of-mistria")
export const HOM_UNPACKING_PATH = path.join(HOM_TEMP_PATH, "saves")
export const jsonFilenames = [
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

export const vaultc = {
  pack: async (unpackPath: string, savePath: string) => {
    try {
      return safeExecFile(VAULTC_PATH, ["pack", unpackPath, savePath])
    } catch (e) {
      console.error(
        `Failed to pack ${unpackPath} to ${savePath}. The error has most likely has occured either from the process itself or vaultc`
      )
      throw e
    }
  },
  unpack: async (savePath: string, unpackPath: string) => {
    try {
      return safeExecFile(VAULTC_PATH, ["unpack", savePath, unpackPath])
    } catch (e) {
      console.error(
        `Failed to unpack ${savePath} to ${unpackPath}. The error most likely has occured either from the process itself or vaultc`
      )
      throw e
    }
  }
}

// contains all the unpacked saves paths at any given time
export const savesPaths: {
  [saveId: string]: {
    saveId: string
    json: {
      // header: "C:\Users\...\saves\game-414455342-1417407981\header.json"
      [filenameKey in (typeof jsonFilenames)[number]]: string
    }
    originPath: string
    unpackingPath: string
  }
} = {}

export type SavePath = (typeof savesPaths)[string]

export function getSaveId(path: string) {
  // "C:\Users\...\saves\game-414455342-1417407981.sav" -> "game-414455342-1417407981"
  // "game-414455342-1417407981.sav" -> "game-414455342-1417407981"
  // "game-414455342-1417407981" -> "game-414455342-1417407981"
  return basename(path).replace(".sav", "")
}

export async function getSavFiles(path: string) {
  // returns the absolute path of all the .sav files inside the path (directory)
  return (await readdir(path)).filter((file) => file.endsWith(".sav")).map((file) => join(path, file))
}

export async function unpackDefaultSaves() {
  const savFiles = await getSavFiles(FOM_SAVES_PATH)
  await rm(HOM_UNPACKING_PATH, { recursive: true, force: true })

  return Promise.all(savFiles.map((savePath) => unpackSave(savePath)))
}

export async function unpackSave(savePath: string) {
  const saveId = getSaveId(savePath)
  const unpackingPath = join(HOM_UNPACKING_PATH, saveId)

  console.log(`Unpacking ${savePath}`)
  try {
    await vaultc.unpack(savePath, unpackingPath)
  } catch (e) {
    console.error(`Failed to unpack ${savePath}. The error has occured either from the unpacking process or vaultc`)
    throw e
  }

  // @ts-ignore
  savesPaths[saveId] = { json: {} }

  savesPaths[saveId].originPath = savePath
  savesPaths[saveId].unpackingPath = unpackingPath
  savesPaths[saveId].saveId = saveId

  jsonFilenames.forEach((jsonName) => {
    savesPaths[saveId].json[jsonName] = join(unpackingPath, `${jsonName}.json`)
  })

  return savesPaths[saveId]
}

export async function packSave(saveId: string, { shouldBringOnTop = false }: { shouldBringOnTop: boolean }) {
  const savePaths = savesPaths[saveId]
  console.log(`packing save ${saveId} back to origin: ${savePaths.originPath}...`)
  // it changes the `last_played` for it to show first in game. It compares the save's `last_played` with the default saves' `last_played`
  if (shouldBringOnTop) {
    console.log(`bringing save to top`)
    const longestLastPlayedValue = Math.max(
      ...(await Promise.all(
        Object.entries(savesPaths).map(async ([_, _savePaths]) => {
          const info = InfoSchema.parse(await readJson(_savePaths.json.info))
          return info.last_played
        })
      ))
    )

    const parsedInfo = InfoSchema.parse(await readJson(savePaths.json.info))
    const currentLastPlayed = parsedInfo.last_played
    if (currentLastPlayed <= longestLastPlayedValue) {
      const updatedInfo = updateObjectValue(parsedInfo, { keyPath: "last_played", value: longestLastPlayedValue + 0.00000000001 })
      await writeJson(savePaths.json.info, InfoSchema.parse(updatedInfo))
    }
  }

  await vaultc.pack(savePaths.unpackingPath, savePaths.originPath)
  console.log(`packing complete`)
}

export async function backupSaves(backupPath: string) {
  await mkdir(backupPath, { recursive: true })

  const savPaths = await getSavFiles(FOM_SAVES_PATH)
  let count = 0
  for (const savePath of savPaths) {
    ++count
    await copyFile(savePath, path.join(backupPath, path.basename(savePath)))
  }

  return { backupPath, savesCopied: count }
}

// === generic utils ===
export async function readJson<T extends {}>(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf-8")) as T
}

export async function writeJson<T extends object>(filePath: string, obj: T) {
  if (isJsonSerializable(obj)) {
    await writeFile(filePath, JSON.stringify(obj, null, 2), "utf-8")
  } else {
    throw new Error("Invalid JSON passed. Didn't write to file to prevent any issues.")
  }
}

export function isJsonSerializable(data: unknown) {
  try {
    JSON.stringify(data)
    return true
  } catch {
    return false
  }
}

export async function directoryExists(directoryPath: string) {
  try {
    await access(directoryPath)
    return true
  } catch {
    return false
  }
}

export async function safeExecFile(file: string, args: string[], options = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(file, args, options, (error, stdout, stderr) => {
      if (error) return reject(error)
      if (stderr) console.error(`execFile error: ${stderr}`)
      resolve(stdout)
    })

    const timeout = setTimeout(() => {
      console.error(`Timeout on execFile for args: ${args.join(" ")}`)
      child.kill()
      reject(new Error("Process timeout"))
    }, 8000)

    child.on("close", () => clearTimeout(timeout))
  })
}

type ObjectUpdate = {
  keyPath: string
  value: any
}

export function updateObjectValue(obj: object, updates: ObjectUpdate | ObjectUpdate[]) {
  const newObj = JSON.parse(JSON.stringify(obj))

  const updatesArray = Array.isArray(updates) ? updates : [updates]

  updatesArray.forEach(({ keyPath, value }) => {
    const keys = keyPath.split(".")

    let current = newObj

    for (let i = 0; i < keys.length - 1; i++) {
      let key = keys[i]

      if (!current[key]) {
        current[key] = {}
      }

      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  })

  return newObj
}
