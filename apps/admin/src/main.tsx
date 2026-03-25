import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureApi } from "@ddd/api"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

configureApi(import.meta.env.VITE_API_URL)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
