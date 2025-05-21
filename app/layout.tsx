import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SuitSupply",
  description: "SuitSupply Returns Flow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 min-h-screen">
        <div className="mx-auto max-w-[1440px] w-full">{children}</div>
      </body>
    </html>
  )
}
