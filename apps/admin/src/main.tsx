import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureApi } from "@ddd/api"
import { Toast } from "@heroui/react"

import "./index.css"
import Router from "./pages/index.tsx"
import { QueryProvider } from "@/app/providers/QueryProvider.tsx"
import { ThemeProvider } from "@/app/providers/ThemeProvider.tsx"

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error("VITE_API_URL is not set")
configureApi(apiUrl, {
  onUnauthorized: () => {
    window.location.replace("/");
  },
})

async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === "true") {
    const { worker } = await import("./mocks/browser")
    return worker.start({ onUnhandledRequest: "bypass" })
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>
        <ThemeProvider>
          <Router />
          <Toast.Provider placement="top end" />
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>
  )
})
