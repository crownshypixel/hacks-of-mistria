import { defineConfig, defaultConfig, createSystem } from "@chakra-ui/react"

const config = defineConfig({
  cssVarsRoot: ":where(html)",
  globalCss: {
    "*::selection": {
      bg: "rose.500",
      color: "white"
    },
    "*, *::before, *::after": {
      fontFamily: "inherit",
      borderRadius: "0 !important"
    },
    "body": {
      fontFamily: "mistria, system-ui, sans-serif",
      fontSize: "1.05rem"
    },
    "img": {
      imageRendering: "pixelated"
    }
  },
  theme: {
    tokens: {
      colors: {
        rose: {
          50: { value: "#fff1f2" },
          100: { value: "#ffe4e6" },
          200: { value: "#fecdd3" },
          300: { value: "#fda4af" },
          400: { value: "#fb7185" },
          500: { value: "#f43f5e" },
          600: { value: "#e11d48" },
          700: { value: "#be123c" },
          800: { value: "#9f1239" },
          900: { value: "#881337" },
          950: { value: "#4c0519" }
        }
      }
    },
    semanticTokens: {
      colors: {
        rose: {
          solid: { value: "{colors.rose.500}" },
          contrast: { value: "{colors.rose.100}" },
          fg: { value: "{colors.rose.700}" },
          muted: { value: "{colors.rose.100}" },
          subtle: { value: "{colors.rose.200}" },
          emphasized: { value: "{colors.rose.300}" },
          focusRing: { value: "{colors.rose.500}" }
        }
      }
    }
  }
})

export const systemValue = createSystem(config, defaultConfig)
