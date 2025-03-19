import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  main: {
    resolve: {
      alias: {
        main: path.resolve("src/main"),
        shared: path.resolve("src/shared"),
        schema: path.resolve("src/schema"),
        root: path.resolve("./")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        shared: path.resolve("src/shared")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        src: path.resolve("src/renderer/src"),
        shared: path.resolve("src/shared")
      }
    },
    plugins: [react()]
  }
})
