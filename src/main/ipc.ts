// import {
//   unpackedSavesPathsCache,
//   updateJsonValue,
//   vaultc,
//   isNumber,
//   PronounsList,
//   translateCalendarTime,
//   getTestingDir,
//   readFomSaves,
//   getSaveIdFromPath,
//   deleteDirIfExists,
//   parseJsonFile,
//   unpackSaveToTemp,
//   unpackSavesToTemp,
//   Pronouns
// } from "./util"

// import { join } from "path"
// import { mkdir, copyFile, readdir } from "fs/promises"

// export const IPC = {
//   MEASURE_UNPACKING: "measure/unpacking",
//   UPDATE_SAVE: "update/save",
//   GET_SORTED_LOADING_SAVES: "get/sorted-loading-saves",
//   REFRESH_SAVES: "refresh/saves",
//   GET_SAVE_DATA: "get/save-data",
//   SET_NAME: "set/name",
//   SET_PRONOUNS: "set/pronouns",
//   SET_FARM_NAME: "set/farm-name",
//   SET_GOLD: "set/gold",
//   SET_ESSENCE: "set/essence",
//   SET_RENOWN: "set/renown",
//   SET_CALENDAR_TIME: "set/calendar-time",
//   SET_HEALTH: "set/health",
//   SET_STAMINA: "set/stamina",
//   SET_MANA: "set/mana",
//   SET_REWARD_INVENTORY: "set/reward-inventory",
//   SET_BIRTHDAY: "set/birthday",
//   SET_INVENTORY: "set/inventory"
// } as const

// export const channels = {
//   [IPC.MEASURE_UNPACKING]: handleMeasureUnpacking,
//   [IPC.UPDATE_SAVE]: handleUpdateSave,
//   [IPC.GET_SORTED_LOADING_SAVES]: handleGetSortedLoadingSaves,
//   [IPC.REFRESH_SAVES]: handleRefreshSaves,
//   [IPC.GET_SAVE_DATA]: handleGetSaveData,
//   [IPC.SET_NAME]: handleSetName,
//   [IPC.SET_PRONOUNS]: handleSetPronouns,
//   [IPC.SET_FARM_NAME]: handleSetFarmName,
//   [IPC.SET_GOLD]: handleSetGold,
//   [IPC.SET_ESSENCE]: handleSetEssence,
//   [IPC.SET_RENOWN]: handleSetRenown,
//   [IPC.SET_CALENDAR_TIME]: handleSetCalendarTime,
//   [IPC.SET_HEALTH]: handleSetHealth,
//   [IPC.SET_STAMINA]: handleSetStamina,
//   [IPC.SET_MANA]: handleSetMana,
//   [IPC.SET_REWARD_INVENTORY]: handleSetRewardInventory,
//   [IPC.SET_BIRTHDAY]: handleSetBirthday,
//   [IPC.SET_INVENTORY]: handleSetInventory
// }

// async function handleMeasureUnpacking(e: Electron.IpcMainInvokeEvent, amount: number) {
//   if (!isNumber(amount) || amount < 1) {
//     console.log(`[handleMeasureUnpacking]: Invalid amount ${amount}`)
//     return
//   }
//   const testingDir = getTestingDir()
//   const testSavePath = (await readFomSaves())[0]
//   const saveBasename = getSaveIdFromPath(testSavePath)

//   await mkdir(testingDir)

//   for (let i = 1; i <= amount; i++) {
//     await copyFile(testSavePath, join(testingDir, `${saveBasename}-${i}.sav`))
//   }

//   const startTime = process.hrtime()
//   const savesToUnpack = (await readdir(testingDir)).map((file) => join(testingDir, file))

//   for (const savePath of savesToUnpack) {
//     const unpackDir = join(testingDir, getSaveIdFromPath(savePath))
//     await vaultc.unpackSave(savePath, unpackDir)
//   }

//   const endTime = process.hrtime(startTime)
//   const measurement = endTime[0] + endTime[1] / 1e9 // Convert to seconds

//   await deleteDirIfExists(testingDir)

//   return measurement
// }

// async function handleGetSortedLoadingSaves(e: Electron.IpcMainInvokeEvent) {
//   console.log(`[handleGetSortedLoadingSaves]`)
//   const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

//   const sortedSavesByLastPlayed = await Promise.all(
//     unpackedSavesInfo.map(async (saveInfo) => {
//       const infoData = await parseJsonFile(saveInfo.jsonPaths.info)
//       const headerData = await parseJsonFile(saveInfo.jsonPaths.header)
//       return {
//         info: infoData,
//         header: headerData,
//         id: saveInfo.saveId,
//         autosave: saveInfo.saveId.includes("autosave")
//       }
//     })
//   )

//   sortedSavesByLastPlayed.sort((a, b) => b.info.last_played - a.info.last_played)

//   return sortedSavesByLastPlayed
// }

// async function handleGetSaveData(e: Electron.IpcMainInvokeEvent, saveId: string) {
//   console.log(`[handleGetSaveData:${saveId}]`)
//   const saveInfo = unpackedSavesPathsCache.get(saveId)
//   if (!saveInfo) {
//     console.log(`[handleGetSaveData:${saveId}]: Couldn't find save in cache`)
//     return null
//   }

//   const headerData = await parseJsonFile(saveInfo.jsonPaths.header)
//   const playerData = await parseJsonFile(saveInfo.jsonPaths.player)
//   const gamedataData = await parseJsonFile(saveInfo.jsonPaths.gamedata)

//   return {
//     name: headerData.name,
//     farmName: headerData.farm_name,
//     pronouns: playerData.pronoun_choice,
//     gold: headerData.stats.gold,
//     essence: headerData.stats.essence,
//     renown: headerData.stats.renown,
//     calendarTime: headerData.calendar_time,
//     year: translateCalendarTime(headerData.calendar_time)[0],
//     season: translateCalendarTime(headerData.calendar_time)[1],
//     day: translateCalendarTime(headerData.calendar_time)[2],
//     health: headerData.stats.base_health,
//     stamina: headerData.stats.base_stamina,
//     mana: headerData.stats.mana_max,
//     rewardInventory: playerData.renown_reward_inventory,
//     inventory: playerData.inventory,
//     birthdaySeason: translateCalendarTime(playerData.birthday)[1],
//     birthdayDay: translateCalendarTime(playerData.birthday)[2],
//     maxMinesLevel: gamedataData.maximum_mines_level
//   }
// }

// async function handleSetCalendarTime(e: Electron.IpcMainInvokeEvent, saveId: string, calendarTime: number) {
//   console.log(`[handleSetCalendarTime:${saveId}]: Updating calendar time to ${calendarTime}`)

//   if (!isNumber(calendarTime)) {
//     console.log(`[handleSetCalendarTime:${saveId}]: Calendar time is not a number ${calendarTime}, won't update`)
//     return false
//   }

//   if (calendarTime % 86400 != 0) {
//     console.log(`[handleSetCalendarTime:${saveId}]: Calendar time ${calendarTime} is not a multiple of 86400, won't update`)
//     return false
//   }

//   const saveInfo = unpackedSavesPathsCache.get(saveId)
//   if (!saveInfo) {
//     console.log(`couldn't find save with id ${saveId} in cache`)
//     return false
//   }

//   const { jsonPaths } = saveInfo

//   await updateJsonValue(jsonPaths.header, "calendar_time", calendarTime)
//   await updateJsonValue(jsonPaths.gamedata, "date", calendarTime)
//   //TODO: IMPLEMENT DAY OF THE WEEK

//   return true
// }

// function handleSetRewardInventory(e: Electron.IpcMainInvokeEvent, saveId: string, inventory: unknown) {
//   console.log(`[handleSetRewardInventory:${saveId}]: Updating reward inventory`)

//   const saveInfo = unpackedSavesPathsCache.get(saveId)
//   if (!saveInfo) {
//     console.log(`couldn't find save with id ${saveId} in cache`)
//     return false
//   }

//   const { jsonPaths } = saveInfo
//   return updateJsonValue(jsonPaths.player, "renown_reward_inventory", inventory)
// }

// async function handleSetBirthday(e: Electron.IpcMainInvokeEvent, saveId: string, birthday: number) {
//   console.log(`[handleSetBirthday:${saveId}]: Updating birthday to ${birthday}`)

//   if (!isNumber(birthday)) {
//     console.log(`[handleSetBirthday:${saveId}]: birthday is not a number ${birthday}, won't update`)
//     return false
//   }

//   if (birthday % 86400 != 0) {
//     console.log(`[handleSetBirthday:${saveId}]: Birthday ${birthday} is not a multiple of 86400, won't update`)
//     return false
//   }

//   const saveInfo = unpackedSavesPathsCache.get(saveId)
//   if (!saveInfo) {
//     console.log(`couldn't find save with id ${saveId} in cache`)
//     return false
//   }

//   const { jsonPaths } = saveInfo

//   await updateJsonValue(jsonPaths.player, "birthday", birthday)

//   return true
// }

// async function handleSetInventory(e: Electron.IpcMainInvokeEvent, saveId: string, inventory: unknown) {
//   console.log(`[handleSetInventory:${saveId}]: Updating player's inventory`)

//   const saveInfo = unpackedSavesPathsCache.get(saveId)
//   if (!saveInfo) {
//     console.log(`couldn't find save with id ${saveId} in cache`)
//     return false
//   }

//   const { jsonPaths } = saveInfo
//   await updateJsonValue(jsonPaths.player, "inventory", inventory)
//   return true
// }
