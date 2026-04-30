"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, CheckCircle2, LineChart, Play, ShieldCheck, Sparkles, Target } from "lucide-react"
import { VideoModal } from "@/components/video-modal"

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [stats, setStats] = useState([
    { value: "500+", label: "Clients Served" },
    { value: "98%", label: "Success Rate" },
    { value: "50+", label: "Team Experts" },
    { value: "10+", label: "Years Experience" },
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20
      heroRef.current.style.setProperty("--mouse-x", `${x}px`)
      heroRef.current.style.setProperty("--mouse-y", `${y}px`)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        
        if (Array.isArray(result.data) && result.data.length > 0) {
          // Map API data to display format
          const statLabels: Record<string, string> = {
            clients_served: 'Clients Served',
            success_rate: 'Success Rate',
            team_experts: 'Team Experts',
            years_excellence: 'Years Experience',
          }
          
          const apiStats = result.data
            .filter((stat: any) => ['clients_served', 'success_rate', 'team_experts', 'years_excellence'].includes(stat.stat_key))
            .map((stat: any) => ({
              value: stat.stat_key === 'success_rate' ? `${stat.value}%` : `${stat.value}+`,
              label: statLabels[stat.stat_key] || stat.stat_key,
            }))
          
          if (apiStats.length > 0) {
            setStats(apiStats)
          }
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    fetchStats()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-background pt-20 pb-10 md:pt-24 md:pb-12"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_58%,rgba(20,184,166,0.08)_58%,rgba(20,184,166,0.08)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-teal-600" />
            Strategy, finance, and design under one roof
          </div>

          <h1 className="mb-5 max-w-4xl text-4xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
            <span className="text-foreground dark:text-cyan-50 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">We Make</span>
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 inline-block -rotate-1 transform rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 hover:rotate-0 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600 dark:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                Your Business
              </span>
            </span>
            <br />
            <span className="text-foreground dark:text-cyan-50 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">Better Than Others</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg animate-fade-in-up" style={{ animationDelay: "0.12s" }}>
            NovaEdge helps teams turn scattered marketing, finance, and design work into clear decisions, stronger customer experiences, and measurable growth.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.24s" }}>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-lg px-6 text-base shadow-lg shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Link href="/get-started">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-lg bg-background px-6 text-base"
              onClick={() => setIsVideoOpen(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              View Approach
            </Button>
          </div>

          <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: "0.36s" }}>
            {[
              ["Market clarity", Target],
              ["Financial control", ShieldCheck],
              ["Design execution", CheckCircle2],
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal-600" />
                <span>{label as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Modal */}
        <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

        <div className="relative animate-fade-in-up" style={{ animationDelay: "0.28s", transform: "translate(var(--mouse-x, 0), var(--mouse-y, 0))" }}>
          <div className="rounded-lg border border-border bg-card p-4 shadow-2xl shadow-foreground/10 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth console</p>
                <h2 className="text-lg font-bold text-foreground md:text-xl">NovaEdge operating view</h2>
              </div>
              <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Live plan
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1.5 text-2xl font-bold text-foreground md:text-3xl">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-foreground">Performance mix</span>
                </div>
                <span className="text-sm text-muted-foreground">90 day focus</span>
              </div>
              <div className="space-y-2.5">
                {[
                  ["Marketing momentum", "78%", "bg-teal-500"],
                  ["Financial confidence", "64%", "bg-sky-500"],
                  ["Experience quality", "86%", "bg-amber-500"],
                ].map(([label, width, color]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{width}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${color}`} style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-border bg-background p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Next recommendation</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Improve offer positioning before scaling paid acquisition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
