"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"
import "./globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error boundary triggered", {
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  return (
    <html lang="en">
      <body>
        <ErrorState
          code="500"
          title="NovaEdge hit a system fault."
          description="A critical page shell failed to render. Retry the request, or return home to continue browsing."
          onRetry={reset}
        />
      </body>
    </html>
  )
}
