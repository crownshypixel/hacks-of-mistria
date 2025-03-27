import { exposeApiToGlobalWindow } from "main/ipc"

const { key, api } = exposeApiToGlobalWindow()

declare global {
  interface Window {
    [key]: typeof api
  }
}
