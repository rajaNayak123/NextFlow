import { ClerkProvider } from '@clerk/nextjs'
import { Outfit } from 'next/font/google'
import './globals.css'
import ConsoleLogger from '@/components/ConsoleLogger'

const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={outfit.className}>
          <ConsoleLogger />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
