import { createInterprocess } from "interprocess"
import {
  backupSaves,
  fetchVersionGamedata,
  getAllSavesInfo,
  getGamedataVersionList,
  getSingleSaveInfo,
  packSave,
  unpackAllSaves,
  unpackSave
} from "main/vault"
import { Updater, type UpdateType } from "main/updates"
import { dialog } from "electron/main"

type BaseActionData = { saveId: string }

type IpcData<K extends string = never, V = never> = BaseActionData &
  (K extends never
    ? {}
    : {
        [key in K]: V
      })

export const { exposeApiToGlobalWindow, ipcMain, ipcRenderer } = createInterprocess({
  main: {
    async pack(_, { saveId, shouldBringOnTop }: IpcData<"shouldBringOnTop", boolean>) {
      return packSave(saveId, shouldBringOnTop)
    },
    async unpack(_, { saveId }: BaseActionData) {
      return unpackSave(saveId)
    },
    async unpackAll() {
      return unpackAllSaves()
    },
    async backup() {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"]
      })

      if (canceled) {
        return null
      }

      const backupDirectory = filePaths[0]

      return backupSaves(backupDirectory)
    },
    async update<T extends UpdateType>(
      _: Electron.IpcMainInvokeEvent,
      { type, saveId, data }: BaseActionData & { type: T; data: Parameters<(typeof Updater)[T]>[1] }
    ) {
      // @ts-ignore
      return Updater[type](saveId, data)
    },
    async getAllSavesInfo() {
      return getAllSavesInfo()
    },
    async getSaveInfo(_, saveId: string) {
      return getSingleSaveInfo(saveId)
    },
    async getVersionGamedata(_, version: `v${number}.${number}`) {
      return fetchVersionGamedata(version)
    },
    async getGamedataVersions(_) {
      return getGamedataVersionList()
    }
  }
})
