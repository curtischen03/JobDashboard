"use client"
import React, { useState, useEffect } from "react"
import { JobTable, Job } from "@/components/jobTable"
import { useAuth } from "@/context/AuthContext"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/utils/firebase"

export default function AppliedJobsPage() {
  const [jobData, setJobData] = useState<Job[]>([])
  const { user } = useAuth()
  useEffect(() => {
    const getUserJobs = async () => {
      if (user) {
        const jobsRef = collection(db, "applied-jobs")
        const q = query(jobsRef, where("uid", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const appliedJobs = querySnapshot.docs.map((doc) => {
          const docData = doc.data()
          return {
            id: docData.job_id,
            title: docData.title,
            employer_name: docData.employer_name,
            apply_link: docData.apply_link,
          }
        })
        setJobData(appliedJobs)
      }
    }
    getUserJobs()
  }, [])

  return (
    <div className="container mx-auto my-8">
      <h1 className="my-6 px-4 text-3xl font-bold">Applied Jobs</h1>
      {jobData.length == 0 && <h3 className="px-4 pb-4">No jobs applied to</h3>}
      <JobTable jobData={jobData} />
    </div>
  )
}
