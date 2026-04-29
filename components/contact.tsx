"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { Send, Mail, Phone, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        alert("Your message has been sent successfully.")
        e.currentTarget.reset()
      } else {
        alert(result.error || "Failed to send your message.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: Mail, label: "Email", value: "hello@novaedge.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: MapPin, label: "Location", value: "San Francisco, CA" },
  ]

  return (
    <section id="contact" ref={sectionRef} className="relative overflow-hidden py-12 md:py-16">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            )}
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              Get In Touch
            </span>
            <h2 className="mb-6 text-balance text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              {"Let's Build Something Great Together"}
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
              Ready to transform your business? Reach out to us and discover how
              NovaEdge Solutions can help you achieve your goals.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-4 transition-all duration-500",
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  )}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className="font-medium text-foreground">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-700",
              isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-border bg-card p-8 shadow-xl"
            >
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="rounded-xl border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className="rounded-xl border-border focus:border-primary focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help?"
                    className="rounded-xl border-border focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your project..."
                    className="min-h-[150px] resize-none rounded-xl border-border focus:border-primary focus:ring-primary/20"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-primary py-6 text-lg text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message
                      <Send className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
