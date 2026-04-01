import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureApi } from "@ddd/api"

import "./index.css"
import Router from "./pages/index.tsx"
import { ThemeProvider } from "@/app/providers/ThemeProvider.tsx"

configureApi(import.meta.env.VITE_API_URL)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  </StrictMode>
)
