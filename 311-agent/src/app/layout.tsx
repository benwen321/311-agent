import type { Metadata } from 'next'
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Municipal Dashboard - 311 Issue Management',
  description: 'Modern municipal issue management system for tracking and resolving city infrastructure problems.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="h-full font-sans antialiased bg-gray-50">
                <div className="min-h-full flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}