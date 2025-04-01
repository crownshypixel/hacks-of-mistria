import { createInterprocess } from "interprocess"
import { dialog } from "electron/main"
import { backupSaves, packSave, unpackDefaultSaves, unpackSave } from "./util"
import {
  getDefaultSavesListInfo,
  getSaveEditingInfo,
  getSaveListInfo,
  setBirthday,
  setCalendar,
  setEssence,
  setFarmName,
  setGold,
  setHealth,
  setMana,
  setPlayerInventory,
  setPlayerName,
  setPronoun,
  setRenown,
  setStamina
} from "./vault"
import { fetchVersionGamedata, getGamedataVersionList, Version } from "./gamedata"
import { Pronoun } from "schema/player"
import { PlayerInventory } from "schema/inventory"

export const { exposeApiToGlobalWindow, ipcMain, ipcRenderer } = createInterprocess({
  main: {
    unpackSaveFromPath: unpackSaveFromPathIpcHandler,
    unpackDefaultSaves: unpackDefaultSavesIpcHandler,
    packSave: packSaveIpcHandler,
    backupDefaultSaves: backupDefaultSavesIpcHandler,
    pickSavFile: pickSavFileIpcHandler,
    pickDirectory: pickDirectoryIpcHandler,
    getDefaultSavesListInfo: getDefaultSavesListInfoIpcHandler,
    getSaveListInfo: getSaveListInfoIpcHandler,
    getSaveEditingInfo: getSaveEditingInfoIpcHandler,
    getGamedata: getGamedataIpcHandler,
    getGamedataVersions: getGamedataVersionsIpcHandler,
    setGold: setGoldIpcHandler,
    setEssence: setEssenceIpcHandler,
    setRenown: setRenownIpcHandler,
    setHealth: setHealthIpcHandler,
    setStamina: setStaminaIpcHandler,
    setMana: setManaIpcHandler,
    setFarmName: setFarmNameIpcHandler,
    setPlayerName: setPlayerNameIpcHandler,
    setPronoun: setPronounIpcHandler,
    setCalendar: setCalendarIpcHandler,
    setBirthday: setBirthdayIpcHandler,
    setPlayerInventory: setPlayerInventoryIpcHandler
  }
})

function unpackSaveFromPathIpcHandler(_, { savePath }: { savePath: string }) {
  return unpackSave(savePath)
}

function unpackDefaultSavesIpcHandler() {
  return unpackDefaultSaves()
}

function packSaveIpcHandler(_, { saveId, shouldBringOnTop }: { saveId: string; shouldBringOnTop: boolean }) {
  return packSave(saveId, { shouldBringOnTop })
}

async function backupDefaultSavesIpcHandler() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ["openDirectory"] })
  if (canceled) return null
  return backupSaves(filePaths[0])
}

async function pickSavFileIpcHandler() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select the save (.sav file) you want to load",
    filters: [
      { name: "SAV Files", extensions: ["sav"] },
      { name: "All Files", extensions: ["*"] }
    ],
    properties: ["openFile"]
  })
  if (canceled) return null
  return filePaths[0]
}

async function pickDirectoryIpcHandler() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ["openDirectory"] })
  if (canceled) return null
  return filePaths[0]
}

function getDefaultSavesListInfoIpcHandler() {
  return getDefaultSavesListInfo()
}

function getSaveListInfoIpcHandler(_, saveId: string) {
  return getSaveListInfo(saveId)
}

function getSaveEditingInfoIpcHandler(_, saveId: string) {
  return getSaveEditingInfo(saveId)
}

function getGamedataIpcHandler(_, version: Version) {
  return fetchVersionGamedata(version)
}

function getGamedataVersionsIpcHandler() {
  return getGamedataVersionList()
}

function setGoldIpcHandler(_, { saveId, gold }: { saveId: string; gold: number }) {
  return setGold(saveId, gold)
}

function setEssenceIpcHandler(_, { saveId, essence }: { saveId: string; essence: number }) {
  return setEssence(saveId, essence)
}

function setRenownIpcHandler(_, { saveId, renown }: { saveId: string; renown: number }) {
  return setRenown(saveId, renown)
}

function setHealthIpcHandler(_, { saveId, health }: { saveId: string; health: number }) {
  return setHealth(saveId, health)
}

function setStaminaIpcHandler(_, { saveId, stamina }: { saveId: string; stamina: number }) {
  return setStamina(saveId, stamina)
}

function setManaIpcHandler(_, { saveId, mana }: { saveId: string; mana: number }) {
  return setMana(saveId, mana)
}

function setFarmNameIpcHandler(_, { saveId, farmName }: { saveId: string; farmName: string }) {
  return setFarmName(saveId, farmName)
}

function setPlayerNameIpcHandler(_, { saveId, playerName }: { saveId: string; playerName: string }) {
  return setPlayerName(saveId, playerName)
}

function setPronounIpcHandler(_, { saveId, pronoun }: { saveId: string; pronoun: Pronoun }) {
  return setPronoun(saveId, pronoun)
}

function setCalendarIpcHandler(_, { saveId, calendar }: { saveId: string; calendar: number }) {
  return setCalendar(saveId, calendar)
}

function setBirthdayIpcHandler(_, { saveId, birthday }: { saveId: string; birthday: number }) {
  return setBirthday(saveId, birthday)
}

function setPlayerInventoryIpcHandler(_, { saveId, playerInventory }: { saveId: string; playerInventory: PlayerInventory }) {
  return setPlayerInventory(saveId, playerInventory)
}
