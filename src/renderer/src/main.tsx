import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "src/app.jsx"
import { Provider as ChakraProvider } from "src/components/custom/provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { systemValue } from "src/theme"
import "src/global.css"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider systemValue={systemValue}>
        <App />
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
