"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

export function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    clients_served: 500,
    success_rate: 98,
    team_experts: 50,
    years_excellence: 10,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const result = await response.json()
        
        if (Array.isArray(result.data) && result.data.length > 0) {
          // Convert array to object
          const statsObj = result.data.reduce((acc: any, stat: any) => {
            acc[stat.stat_key] = stat.value
            return acc
          }, {})
          setStats(statsObj)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    fetchStats()
    return () => observer.disconnect()
  }, [])

  const highlights = [
    "Data-driven strategies for measurable growth",
    "Expert team with 10+ years of experience",
    "Customized solutions for every business",
    "Proven track record with 500+ clients",
  ]

  return (
    <section id="about" ref={sectionRef} className="relative py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: Image/Visual */}
          <div 
            className={cn(
              "relative transition-all duration-700",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            )}
          >
            <div className="relative">
              {/* Main visual card */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-xl md:p-8">
                <div className="grid grid-cols-2 gap-4">
                  {/* Stat cards */}
                  <div className="rounded-lg bg-muted p-5 transition-colors duration-300 hover:bg-primary/10">
                    <div className="text-4xl font-bold text-primary mb-2">{stats.clients_served}+</div>
                    <div className="text-sm text-muted-foreground">Clients Served</div>
                  </div>
                  <div className="rounded-lg bg-muted p-5 transition-colors duration-300 hover:bg-primary/10">
                    <div className="text-4xl font-bold text-primary mb-2">{stats.success_rate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="rounded-lg bg-muted p-5 transition-colors duration-300 hover:bg-primary/10">
                    <div className="text-4xl font-bold text-primary mb-2">{stats.team_experts}+</div>
                    <div className="text-sm text-muted-foreground">Team Experts</div>
                  </div>
                  <div className="rounded-lg bg-muted p-5 transition-colors duration-300 hover:bg-primary/10">
                    <div className="text-4xl font-bold text-primary mb-2">{stats.years_excellence}+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Content */}
          <div 
            className={cn(
              "transition-all duration-700",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase text-primary">
              About Us
            </span>
            <h2 className="mb-5 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl text-balance">
              A Cutting-Edge Firm Built for Growth
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              NovaEdge Solutions is a cutting-edge firm specializing in marketing, finance, 
              and design solutions. We deliver innovative strategies, creative designs, 
              and smart financial insights to help businesses grow, optimize operations, 
              and stand out in a competitive market.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our focus is on blending creativity with analytics to provide tailored solutions 
              that drive measurable results for our clients.
            </p>

            {/* Highlights */}
            <ul className="space-y-4">
              {highlights.map((item, index) => (
                <li 
                  key={index}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
