"use client"

import React, { useEffect, useState, useRef } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/utils/firebase"
import { useAuth } from "@/context/AuthContext"
//@ts-ignore
import CalendarHeatmap from "react-calendar-heatmap"
import { Tooltip } from "react-tooltip"
import "react-calendar-heatmap/dist/styles.css"
import "react-tooltip/dist/react-tooltip.css"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button" // Assuming you have shadcn button
import { Briefcase, Calendar, TrendingUp, ArrowRightToLine } from "lucide-react"
const toLocalISOString = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function StatsPage() {
  const { user } = useAuth()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [totalApplied, setTotalApplied] = useState(0)
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([])
  const [averageAppliesPerDay, setAverageAppliesPerDay] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const getYearRange = () => {
    const dates = []
    const end = new Date()
    const start = new Date()
    start.setFullYear(end.getFullYear() - 1)
    let curr = new Date(start)
    while (curr <= end) {
      dates.push(toLocalISOString(curr))
      curr.setDate(curr.getDate() + 1)
    }
    return { dates, start, end }
  }

  const jumpToToday = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const q = query(
          collection(db, "applied-jobs"),
          where("uid", "==", user.uid)
        )
        const querySnapshot = await getDocs(q)
        const docs = querySnapshot.docs
        setTotalApplied(docs.length)

        const firestoreGroups = docs.reduce(
          (acc: Record<string, number>, doc) => {
            const data = doc.data()
            if (!data.lastUpdated) return acc
            const dateStr = toLocalISOString(data.lastUpdated.toDate())
            acc[dateStr] = (acc[dateStr] || 0) + 1
            return acc
          },
          {}
        )

        const { dates } = getYearRange()
        const finalHeatmapData = dates.map((date) => ({
          date,
          count: firestoreGroups[date] || 0,
        }))
        setHeatmapData(finalHeatmapData)
        const activeDays = Object.keys(firestoreGroups).length
        setAverageAppliesPerDay(activeDays > 0 ? docs.length / activeDays : 0)
      } catch (e) {
        console.error("Error fetching stats:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => jumpToToday(), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const { dates, start: startDate, end: endDate } = getYearRange()

  if (isLoading)
    return (
      <div className="p-8 text-center font-medium text-muted-foreground">
        Analyzing your progress...
      </div>
    )

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Application Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalApplied} applications in the last year
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Total
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplied}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Avg / Active Day
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageAppliesPerDay.toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Active Days
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData.filter((d) => d.count > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Activity Heatmap</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="h-8 gap-2 text-xs md:hidden"
          >
            Today
            <ArrowRightToLine className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide overflow-x-auto pb-2 select-none"
          >
            <div className="min-w-[850px]">
              <CalendarHeatmap
                startDate={startDate}
                endDate={new Date(dates[dates.length - 1])}
                values={heatmapData}
                classForValue={(value: any) => {
                  if (!value || value.count === 0) return "color-empty"
                  if (value.count <= 3) return "color-scale-1"
                  if (value.count <= 6) return "color-scale-2"
                  if (value.count <= 10) return "color-scale-3"
                  return "color-scale-4"
                }}
                tooltipDataAttrs={(value: any) => {
                  const dateStr = value?.date
                    ? new Date(value.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : "No data"
                  return {
                    "data-tooltip-id": "heatmap-tooltip",
                    "data-tooltip-content": `${value?.count || 0} applications on ${dateStr}`,
                  }
                }}
                showWeekdayLabels={true}
              />
            </div>
          </div>
          <Tooltip id="heatmap-tooltip" />

          <div className="mt-4 flex flex-col items-center justify-between gap-4 text-[11px] text-muted-foreground sm:flex-row">
            <span className="hidden sm:inline">
              Learn how applications are counted
            </span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="h-[10px] w-[10px] rounded-[2px] border bg-white" />
              <div className="h-[10px] w-[10px] rounded-[2px] bg-[#9be9a8]" />
              <div className="h-[10px] w-[10px] rounded-[2px] bg-[#40c463]" />
              <div className="h-[10px] w-[10px] rounded-[2px] bg-[#30a14e]" />
              <div className="h-[10px] w-[10px] rounded-[2px] bg-[#216e39]" />
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
          stroke: none;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #9be9a8;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #40c463;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #30a14e;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #216e39;
        }
        .react-calendar-heatmap rect {
          rx: 2px;
          ry: 2px;
        }
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #727272;
        }
        .react-tooltip {
          background-color: #24292f !important;
          color: white !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          padding: 8px 12px !important;
          z-index: 50;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
