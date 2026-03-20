"use client"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { loggedIn, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !loggedIn) {
      router.push("/")
    }
  }, [loading, loggedIn, router])
  if (loading) return null
  return loggedIn ? <>{children}</> : null
}
