import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { z } from "zod"
import { execFile } from "node:child_process"
// import { app } from "electron"

const env = z
  .object({
    NODE_ENV: z.enum(["development", "production"])
  })
  .parse(process.env)

export const IS_DEV = env.NODE_ENV === "development"
export const IS_PROD = env.NODE_ENV === "production"
export const ROOT_PATH = path.join(__dirname, "..", "..")
export const APPDATA_PATH = path.join(os.homedir(), "AppData")

export const HOM_USERDATA_PATH = path.join(APPDATA_PATH, "Roaming", "hacks-of-mistria")
export const HOM_GAMEDATA_PATH = path.join(HOM_USERDATA_PATH, "gamedata")

// base on anna's exported ids (https://github.com/AnnaNomoly/mistria-notes/tree/main/game_data/)
// export const HOM_ITEM_IDS_PATH = path.join(HOM_DATA_PATH, "items.json")
// export const HOM_COSMETIC_IDS_PATH = path.join(HOM_DATA_PATH, "cosmetics.json")
// export const HOM_FURNITURE_IDS_PATH = path.join(HOM_DATA_PATH, "furniture_recipes.json")
// export const HOM_COOKING_IDS_PATH = path.join(HOM_DATA_PATH, "cooking_recipes.json")
// export const OFFLINE_DATA_PATH = path.join(ROOT_PATH, "gamedata")

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
    }, 5000)

    child.on("close", () => clearTimeout(timeout))
  })
}

type ObjectUpdate = {
  keyPath: string
  value: any
}

export function updateObjectValue(obj: object, updates: ObjectUpdate | ObjectUpdate[]) {
  const newObj = structuredClone(obj)

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
