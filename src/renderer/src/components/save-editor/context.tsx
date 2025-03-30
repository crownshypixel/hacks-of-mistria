import { createContext, useContext, useRef } from "react"
import { createEditorStore, EditorData, EditorStoreState } from "src/store"
import { useStore } from "zustand"
import { useShallow } from "zustand/shallow"

export const EditorStoreContext = createContext<ReturnType<typeof createEditorStore> | null>(null)

export function EditorStoreProvider({ children, initialData }: { children: React.ReactNode; initialData: EditorData }) {
  const storeRef = useRef<ReturnType<typeof createEditorStore>>(null)
  if (!storeRef.current) {
    storeRef.current = createEditorStore(initialData)
  }

  return <EditorStoreContext.Provider value={storeRef.current}>{children}</EditorStoreContext.Provider>
}

export function useEditorStore<T>(selector: (state: EditorStoreState) => T): T {
  const store = useContext(EditorStoreContext)
  if (!store) {
    throw new Error("useEditorStore must be used within an EditorStoreProvider")
  }

  return useStore(store, useShallow(selector))
}
