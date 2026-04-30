"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error boundary triggered", {
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  return (
    <ErrorState
      code="500"
      title="Something interrupted this view."
      description="The page could not finish loading. Try again, or return home if the issue continues."
      onRetry={reset}
    />
  )
}
