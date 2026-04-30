"use client"

import Link from "next/link"
import { ArrowLeft, Home, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  code: string
  title: string
  description: string
  actionLabel?: string
  onRetry?: () => void
  showBackLink?: boolean
  className?: string
}

export function ErrorState({
  code,
  title,
  description,
  actionLabel = "Return Home",
  onRetry,
  showBackLink = true,
  className,
}: ErrorStateProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center overflow-hidden bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,transparent_0%,transparent_56%,rgba(20,184,166,0.08)_56%,rgba(20,184,166,0.08)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 lg:order-1">
          <p className="mb-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
            NovaEdge system notice
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {onRetry ? (
              <Button onClick={onRetry} size="lg" className="h-12 rounded-lg px-6">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 rounded-lg px-6">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  {actionLabel}
                </Link>
              </Button>
            )}

            {showBackLink ? (
              <Button asChild variant="outline" size="lg" className="h-12 rounded-lg bg-background px-6">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Homepage
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <ErrorSignalSvg code={code} />
        </div>
      </section>
    </main>
  )
}

function ErrorSignalSvg({ code }: { code: string }) {
  return (
    <svg
      className="h-auto w-full max-w-[34rem]"
      viewBox="0 0 560 420"
      role="img"
      aria-labelledby="error-signal-title"
    >
      <title id="error-signal-title">Animated NovaEdge error signal illustration</title>
      <defs>
        <linearGradient id="error-panel" x1="64" x2="496" y1="60" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.95" />
          <stop offset="1" stopColor="#2563eb" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="error-line" x1="130" x2="430" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id="error-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.12 0 0 0 0 0.75 0 0 0 0 0.9 0 0 0 0.7 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="error-orbit">
        <circle cx="280" cy="210" r="165" fill="none" stroke="#38bdf8" strokeOpacity="0.18" strokeWidth="2" />
        <circle cx="280" cy="210" r="120" fill="none" stroke="#2563eb" strokeOpacity="0.18" strokeWidth="2" />
      </g>

      <g className="error-float" filter="url(#error-glow)">
        <rect x="92" y="78" width="376" height="264" rx="28" fill="url(#error-panel)" opacity="0.12" />
        <rect x="112" y="98" width="336" height="224" rx="22" fill="#020617" stroke="#38bdf8" strokeOpacity="0.42" />
        <path
          className="error-dash"
          d="M154 236 C202 150 239 296 282 210 C326 124 362 274 410 184"
          fill="none"
          stroke="#67e8f9"
          strokeLinecap="round"
          strokeWidth="9"
        />
        <line className="error-scan" x1="130" x2="430" y1="150" y2="150" stroke="url(#error-line)" strokeWidth="4" />
        <text
          x="280"
          y="188"
          fill="#f8fafc"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="68"
          fontWeight="800"
          letterSpacing="0"
          textAnchor="middle"
        >
          {code}
        </text>
        <text
          x="280"
          y="276"
          fill="#93c5fd"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="700"
          letterSpacing="3"
          textAnchor="middle"
        >
          ROUTE SIGNAL LOST
        </text>
      </g>

      <circle className="error-pulse" cx="122" cy="104" r="9" fill="#22d3ee" />
      <circle className="error-pulse error-delay-1" cx="438" cy="314" r="8" fill="#2563eb" />
      <circle className="error-pulse error-delay-2" cx="432" cy="106" r="6" fill="#14b8a6" />
    </svg>
  )
}
