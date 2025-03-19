import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { z } from "zod"

const env = z
  .object({
    NODE_ENV: z.enum(["development", "production"])
  })
  .parse(process.env)

export const IS_DEV = env.NODE_ENV === "development"
export const IS_PROD = env.NODE_ENV === "production"
export const ROOT_PATH = path.join(__dirname, "..", "..")
export const APPDATA_PATH = path.join(os.homedir(), "AppData")

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
