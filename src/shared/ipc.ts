import { createIpcSlice, combineIpcs } from "interprocess"
import { packSave, unpackAllSaves, unpackSave } from "main/vault"
import { Updater, type UpdateType } from "main/updates"

type BaseActionData = { saveId: string }

type IpcData<K extends string = never, V = never> = BaseActionData &
  (K extends never
    ? {}
    : {
        [key in K]: V
      })

const vaultSlice = createIpcSlice({
  main: {
    async pack(_, { saveId, shouldBringOnTop }: IpcData<"shouldBringOnTop", boolean>) {
      return packSave(saveId, shouldBringOnTop)
    },
    async unpack(_, { saveId }: BaseActionData) {
      return unpackSave(saveId)
    },
    async unpackAll() {
      return unpackAllSaves()
    }
  }
})

const updateSlice = createIpcSlice({
  main: {
    async update<T extends UpdateType>(
      _: Electron.IpcMainInvokeEvent,
      { type, saveId, data }: { saveId: string; type: T; data: Parameters<(typeof Updater)[T]>[1] }
    ) {
      // @ts-ignore
      return Updater[type](saveId, data)
    }
  }
})

export const { exposeApiToGlobalWindow, ipcMain, ipcRenderer } = combineIpcs(vaultSlice, updateSlice)
