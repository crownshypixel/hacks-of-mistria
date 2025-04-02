import path from "node:path"
import { HeaderSchema } from "schema/header"
import { PlayerSchema, Pronoun } from "schema/player"
import { InfoSchema } from "schema/info"
import { readJson, savesPaths, unpackSave, updateObjectValue, writeJson } from "main/util"
import { GamedataSchema } from "schema/gamedata"
import { PlayerInventory } from "schema/inventory"
import { app } from "electron"

export type SaveListInfo = Awaited<ReturnType<typeof getSaveListInfo>>
export type SaveEditingInfo = Awaited<ReturnType<typeof getSaveEditingInfo>>

export async function getDefaultSavesListInfo() {
  const saveIds = Object.keys(savesPaths)

  const savesInfo: { [saveId: string]: SaveListInfo } = {}

  for (const saveId of saveIds) {
    savesInfo[saveId] = await getSaveListInfo(saveId)
  }

  return savesInfo
}

export async function getSaveListInfo(saveId: string) {
  const savePaths = savesPaths[saveId]

  const { header, info } = savePaths.json

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
    lastPlayed: parsedInfo.last_played,
    saveId
  }
}

export async function getSaveEditingInfo(saveKey: string) {
  const isPath = saveKey.includes(path.sep)
  let saveId = saveKey
  if (isPath) {
    saveId = (await unpackSave(saveKey)).saveId
  }

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
    mana: parsedHeader.stats.mana_max,
    essence: parsedHeader.stats.essence,
    stamina: parsedHeader.stats.base_stamina,
    health: parsedHeader.stats.base_health,
    renown: parsedHeader.stats.renown,
    calendar: parsedHeader.calendar_time,
    birthday: parsedPlayer.birthday,
    clock: parsedHeader.clock_time,
    lastPlayed: parsedInfo.last_played,
    playerInventory: parsedPlayer.inventory,
    saveId
  }
}

export async function getAppVersion() {
  const currentVersion = app.getVersion()
  let latestVersion = currentVersion
  let updateExists = false

  const url = `https://raw.githubusercontent.com/crownshypixel/hacks-of-mistria/refs/heads/main/package.json`
  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.error("couldn't fetch latest version. Either github is down or user doesn't have internet access")
    }

    const packageJson = await res.text()
    const latest = packageJson["version"]

    if (latest) {
      latestVersion = latest
      const [latestMajor, latestMinor, latestPatch] = latest.split(".")
      const [currentMajor, currentMinor, currentPatch] = latest.split(".")

      if (latestMajor > currentMajor || latestMinor > currentMinor || latestPatch > currentPatch) {
        updateExists = true
      }
    }
  } catch (error) {
    console.error(`an error has occured`, error)
  }

  return { current: currentVersion, latest: latestVersion, updateExists }
}

export async function setGold(saveId: string, gold: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.gold", value: gold })
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.gold", value: gold })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setEssence(saveId: string, essence: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.essence", value: essence })
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.essence", value: essence })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setRenown(saveId: string, renown: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "stats.renown", value: renown })
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "stats.renown", value: renown })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setHealth(saveId: string, health: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const objectUpdates = [
    { keyPath: "stats.base_health", value: health },
    { keyPath: "stats.health_current", value: health }
  ]

  const updatedHeader = updateObjectValue(parsedHeader, objectUpdates)
  const updatedPlayer = updateObjectValue(parsedPlayer, objectUpdates)

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setStamina(saveId: string, stamina: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const objectUpdates = [
    { keyPath: "stats.base_stamina", value: stamina },
    { keyPath: "stats.stamina_current", value: stamina }
  ]

  const updatedHeader = updateObjectValue(parsedHeader, objectUpdates)
  const updatedPlayer = updateObjectValue(parsedPlayer, objectUpdates)

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setMana(saveId: string, mana: number) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const objectUpdates = [
    { keyPath: "stats.base_mana", value: mana },
    { keyPath: "stats.mana_current", value: mana }
  ]

  const updatedHeader = updateObjectValue(parsedHeader, objectUpdates)
  const updatedPlayer = updateObjectValue(parsedPlayer, objectUpdates)

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setFarmName(saveId: string, farmName: string) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "farm_name", value: farmName })
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "farm_name", value: farmName })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setPlayerName(saveId: string, playerName: string) {
  const savePaths = savesPaths[saveId]
  const { header, player } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedPlayer = PlayerSchema.parse(await readJson(player))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "name", value: playerName })
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "name", value: playerName })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setPronoun(saveId: string, pronoun: Pronoun) {
  const savePaths = savesPaths[saveId]
  const { player } = savePaths.json

  const parsedPlayer = PlayerSchema.parse(await readJson(player))
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "pronoun_choice", value: pronoun })

  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setCalendar(saveId: string, calendar: number) {
  const savePaths = savesPaths[saveId]
  const { header, gamedata } = savePaths.json

  const parsedHeader = HeaderSchema.parse(await readJson(header))
  const parsedGamedata = GamedataSchema.parse(await readJson(gamedata))

  const updatedHeader = updateObjectValue(parsedHeader, { keyPath: "calendar_time", value: calendar })
  const updatedGamedata = updateObjectValue(parsedGamedata, { keyPath: "date", value: calendar })

  await writeJson(header, HeaderSchema.parse(updatedHeader))
  await writeJson(gamedata, GamedataSchema.parse(updatedGamedata))
}

export async function setBirthday(saveId: string, birthday: number) {
  const savePaths = savesPaths[saveId]
  const { player } = savePaths.json

  const parsedPlayer = PlayerSchema.parse(await readJson(player))
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "birthday", value: birthday })

  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}

export async function setPlayerInventory(saveId: string, playerInventory: PlayerInventory) {
  const savePaths = savesPaths[saveId]
  const { player } = savePaths.json

  const parsedPlayer = PlayerSchema.parse(await readJson(player))
  const updatedPlayer = updateObjectValue(parsedPlayer, { keyPath: "inventory", value: playerInventory })

  await writeJson(player, PlayerSchema.parse(updatedPlayer))
}
