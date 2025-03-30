import { ChakraProvider, Theme } from "@chakra-ui/react"
import { ColorModeProvider } from "../primitives/color-mode"

export function Provider({ systemValue, ...props }) {
  return (
    <ChakraProvider value={systemValue}>
      <ColorModeProvider defaultTheme="dark">
        <Theme colorPalette="gray" bg="gray.950/20" appearance="dark" {...props} />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
