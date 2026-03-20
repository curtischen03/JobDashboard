import { NextResponse } from "next/server"
import { db } from "@/utils/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  try {
    const api_url = process.env.API_URL
    const api_key = process.env.API_KEY
    if (!api_url || !api_key) throw new Error("Missing env variables for api")
    const response = await fetch(api_url, {
      headers: {
        "x-api-key": api_key,
      },
    })
    const data = await response.json()
    const jobDocRef = doc(db, "daily-jobs", "heYcdbo5cq8vOlROMhXa")
    await setDoc(jobDocRef, {
      jobs: data.data,
      lastUpdated: serverTimestamp(),
    })
    return NextResponse.json({ success: "Data overwritten successfully" })
  } catch (e) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
