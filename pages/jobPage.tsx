"use client"
import React, { useState, useEffect } from "react"
import { JobTable } from "@/components/jobTable"
import { useAuth } from "@/context/AuthContext"

interface RawJob {
  job_id: string
  job_title: string
  employer_name: string
  job_apply_link: string
}

export default function JobPage() {
  const [fullJobData, setFullJobData] = useState<RawJob[]>([])
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const { loggedIn } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs")
        const result = await response.json()
        setFullJobData(result.jobs || [])
        if (result.lastUpdated) {
          const date = new Date(result.lastUpdated.seconds * 1000)
          setUpdatedAt(date.toLocaleString())
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      }
    }
    fetchJobs()
  }, [])

  const jobData = fullJobData.map((job) => ({
    id: job.job_id,
    title: job.job_title,
    employer_name: job.employer_name,
    apply_link: job.job_apply_link,
  }))

  return (
    <div className="container mx-auto my-8">
      <header className="mb-8">
        <h1 className="my-6 px-4 text-3xl font-bold">Applied Jobs</h1>
        {updatedAt && (
          <p className="mt-2 px-4 text-xs text-gray-500 italic md:text-sm">
            Last updated: {updatedAt} PST
          </p>
        )}
      </header>

      {!loggedIn && !loading && (
        <h2 className="text-grey-700 px-4 pb-4 text-lg font-semibold md:text-xl">
          Log In to Track Job Progress
        </h2>
      )}

      <JobTable jobData={jobData} />
    </div>
  )
}
