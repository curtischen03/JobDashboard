"use client"
import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import {
  collection,
  addDoc,
  getDocs,
  where,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { usePathname } from "next/navigation"

export interface Job {
  id: string
  title: string
  employer_name: string
  apply_link: string
}

export interface JobTableProps {
  jobData: Job[]
}

export function JobTable({ jobData }: JobTableProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())

  const handleApply = async (id: string) => {
    if (appliedJobs.has(id)) return
    setAppliedJobs((prev) => new Set(prev).add(id))

    const clickedJob = jobData.find((job) => job.id === id)
    if (user && clickedJob) {
      try {
        await addDoc(collection(db, "applied-jobs"), {
          uid: user.uid,
          job_id: id,
          title: clickedJob.title,
          employer_name: clickedJob.employer_name,
          apply_link: clickedJob.apply_link,
          lastUpdated: serverTimestamp(),
        })
      } catch (e) {
        console.error("Error adding document: ", e)
      }
    }
  }

  useEffect(() => {
    const getUserJobIds = async () => {
      if (user) {
        const startOfYesterday = new Date()
        startOfYesterday.setDate(startOfYesterday.getDate() - 1)
        startOfYesterday.setHours(0, 0, 0, 0)

        const jobRef = collection(db, "applied-jobs")
        const q = query(
          jobRef,
          where("uid", "==", user.uid),
          where("lastUpdated", ">=", startOfYesterday)
        )

        const querySnapshot = await getDocs(q)
        const appliedJobIds = querySnapshot.docs.map((doc) => doc.data().job_id)
        setAppliedJobs(new Set(appliedJobIds))
      }
    }
    getUserJobIds()
  }, [user])

  return (
    <Table className="w-full table-auto table-fixed">
      <TableHeader className="hidden sm:table-header-group">
        <TableRow>
          <TableHead className="w-[45%] pl-5">Job</TableHead>
          <TableHead className="w-[35%] pl-5">Employer</TableHead>
          <TableHead className="pl-5 text-left">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobData.map((job) => {
          const isApplied = appliedJobs.has(job.id)
          return (
            <TableRow
              key={job.id}
              className={`flex flex-col border-b p-4 sm:table-row sm:p-0`}
            >
              {/* Job Title Cell */}
              <TableCell className="overflow-hidden p-0 font-bold sm:p-4 sm:font-medium">
                <span className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase sm:hidden">
                  Job Title
                </span>
                <div
                  className={`block w-full truncate ${isApplied && isHome ? "line-through" : ""}`}
                  title={job.title} // Shows full title on hover (desktop)
                >
                  {job.title}
                </div>
              </TableCell>

              {/* Employer Cell */}
              <TableCell className="mt-3 overflow-hidden p-0 sm:mt-0 sm:p-4">
                <span className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase sm:hidden">
                  Employer
                </span>
                <div className="truncate text-sm text-gray-600 sm:text-base sm:text-slate-900">
                  {job.employer_name}
                </div>
              </TableCell>

              {/* Button Cell */}
              <TableCell className="mt-4 flex flex-row flex-wrap p-0 sm:mt-0 sm:p-4 sm:text-right">
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleApply(job.id)}
                  className="block"
                >
                  <Button
                    className={`h-10 w-full text-sm font-semibold transition-all sm:w-auto ${
                      isApplied
                        ? "cursor-default bg-green-700 text-white hover:bg-green-500"
                        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {isApplied ? "Applied" : "Apply"}
                  </Button>
                </a>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
