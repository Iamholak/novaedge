import { Contact } from '@/components/contact'

export const metadata = {
  title: 'Contact Us - NovaEdge Solutions',
  description: 'Get in touch with NovaEdge Solutions for inquiries and support.',
}

export default function ContactPage() {
  return (
    <>
      <div className="bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 md:text-4xl">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              Have questions? We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </header>

        {/* Contact Section */}
        <main>
          <Contact />
        </main>
      </div>
    </>
  )
}
