"use client"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/utils/firebase"
import React, { useState, useEffect } from "react"
import { AuthProvider } from "@/context/AuthContext"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        <AuthProvider>
          <Navbar />
          <ThemeProvider>{children}</ThemeProvider>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
