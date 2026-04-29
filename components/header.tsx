'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#why-us", label: "Why Us" },
    { href: "/blog", label: "Blog" },
  ]

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-out',
        isScrolled
          ? 'border-b border-border/50 bg-card/80 py-3 shadow-lg backdrop-blur-xl dark:border-cyan-500/10 dark:bg-card/60 dark:shadow-[0_4px_30px_rgba(6,182,212,0.1)]'
          : 'bg-transparent py-4'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110">
                <div className="w-2 h-2 bg-primary-foreground rounded-sm" />
              </div>
              <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-primary/30" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">NOVA</span>
              <span className="text-primary">EDGE</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 md:hidden',
            isMobileMenuOpen ? 'mt-4 max-h-64' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-lg dark:border dark:border-cyan-500/20 dark:bg-card/90 dark:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3">
              <ThemeToggle />
              <Button
                asChild
                className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Link href="/get-started">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
