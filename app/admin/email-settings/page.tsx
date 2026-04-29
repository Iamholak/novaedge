'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type EmailSettings = {
  provider: 'resend' | 'smtp'
  fromEmail: string
  adminNotificationEmail: string
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
}

const defaultSettings: EmailSettings = {
  provider: 'resend',
  fromEmail: 'noreply@novaedge.com',
  adminNotificationEmail: 'hello@novaedge.com',
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPassword: '',
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/email-settings')
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || 'Failed to load email settings')
        }

        const data = await response.json()
        setSettings({ ...defaultSettings, ...data.data })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load email settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/email-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save email settings')
      }

      alert('Email settings saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save email settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading email settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Email Settings</h1>
            <p className="text-muted-foreground">
              Use Resend or switch to your own SMTP provider.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-card p-6">
            <label className="mb-4 block text-sm font-medium text-foreground">Email Provider</label>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left transition ${
                  settings.provider === 'resend'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
                onClick={() => setSettings({ ...settings, provider: 'resend' })}
              >
                <div className="font-semibold text-foreground">Resend</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Uses `RESEND_API_KEY` from environment variables.
                </p>
              </button>
              <button
                type="button"
                className={`rounded-2xl border p-5 text-left transition ${
                  settings.provider === 'smtp'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
                onClick={() => setSettings({ ...settings, provider: 'smtp' })}
              >
                <div className="font-semibold text-foreground">Custom SMTP</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Store your SMTP host, user, port, and encrypted password.
                </p>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">From Email</label>
                <Input
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                  placeholder="noreply@novaedge.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Admin Notification Email
                </label>
                <Input
                  value={settings.adminNotificationEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, adminNotificationEmail: e.target.value })
                  }
                  placeholder="hello@novaedge.com"
                />
              </div>
            </div>
          </div>

          {settings.provider === 'smtp' ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">SMTP Host</label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    placeholder="smtp.your-provider.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">SMTP Port</label>
                  <Input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPort: Number(e.target.value) || 587 })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">SMTP User</label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                    placeholder="mailer@your-provider.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    SMTP Password
                  </label>
                  <Input
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                    placeholder="Enter new password or keep masked value"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm text-foreground md:col-span-2">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpSecure: e.target.checked })
                    }
                  />
                  Use secure SMTP (SSL/TLS)
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex gap-4">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="flex-1 rounded-xl py-6"
            >
              {isSaving ? 'Saving...' : 'Save Email Settings'}
            </Button>
            <Link href="/admin/dashboard" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl py-6">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
