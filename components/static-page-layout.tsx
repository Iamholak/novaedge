import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function StaticPageLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:gap-6">
          <Link href="/" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
            {description ? <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 md:py-6">
        <div className="prose max-w-none space-y-5 leading-relaxed text-foreground">
          {children}
        </div>
      </main>
    </div>
  )
}
