import { exposeApiToGlobalWindow } from "shared/ipc"

const { key, api } = exposeApiToGlobalWindow()

declare global {
  interface Window {
    [key]: typeof api
  }
}
