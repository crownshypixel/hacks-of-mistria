import { create, createStore } from "zustand"
import { immer } from "zustand/middleware/immer"
import { useShallow } from "zustand/shallow"

// ===== APP STORE =====
export enum AppPage {
  Menu,
  GameSaves,
  SaveEditor,
  FarmEditor
}

export type ActiveSaveId = string | null
export type ActiveSavePath = string | null

export type AppStoreState = {
  appPage: AppPage
  setAppPage: (appPage: AppPage) => void
  activeSaveId: ActiveSaveId
  setActiveSaveId: (saveId: ActiveSaveId) => void
  activeSavePath: ActiveSavePath
  setActiveSavePath: (savePath: ActiveSavePath) => void
}

export const useAppStore = create<AppStoreState>((set) => ({
  appPage: AppPage.Menu,
  setAppPage: (appPage: AppPage) => set({ appPage }),
  activeSaveId: null,
  setActiveSaveId: (saveId: ActiveSaveId) => set({ activeSaveId: saveId }),
  activeSavePath: null,
  setActiveSavePath: (savePath: ActiveSavePath) => set({ activeSavePath: savePath })
}))

export const useAppPage = () => useAppStore(useShallow((s) => ({ appPage: s.appPage, setAppPage: s.setAppPage })))
export const useActiveSaveId = () =>
  useAppStore(useShallow((s) => ({ activeSaveId: s.activeSaveId, setActiveSaveId: s.setActiveSaveId })))
export const useActiveSavePath = () =>
  useAppStore(useShallow((s) => ({ activeSavePath: s.activeSavePath, setActiveSavePath: s.setActiveSavePath })))

// ===== EDITOR STORE =====
export type EditorData = NonNullable<Awaited<ReturnType<typeof window.api.invoke.getSaveEditingInfo>>>

export type EditorStoreState = {
  edits: EditorData
  setEdits: (updateFn: (draft: EditorData) => void) => void
  resetEdits: () => void
  resetOnly: (prop: keyof EditorData) => void
}

const cloneObject = (obj: object) => JSON.parse(JSON.stringify(obj))

export const createEditorStore = (initialData: EditorData) => {
  const safe = cloneObject(initialData)

  return createStore<EditorStoreState>()(
    immer((set) => ({
      edits: initialData,
      setEdits: (updateFn) =>
        set((state) => {
          updateFn(state.edits)
        }),
      resetEdits: () =>
        set((state) => {
          state.edits = cloneObject(safe)
        }),
      resetOnly: (prop) =>
        set((state) => {
          // @ts-ignore
          state.edits[prop] = cloneObject(safe[prop])
        })
    }))
  )
}
