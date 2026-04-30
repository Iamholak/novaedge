import { ErrorState } from "@/components/error-state"

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="This page moved out of range."
      description="The route you requested is not available. Return to the homepage and continue from a known path."
      actionLabel="Go Home"
      showBackLink={false}
    />
  )
}
