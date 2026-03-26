import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureApi } from "@ddd/api"

import "./index.css"
import Router from "./routes/index.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

configureApi(import.meta.env.VITE_API_URL)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  </StrictMode>
)
