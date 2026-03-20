import { NextResponse } from "next/server"
import { db } from "@/utils/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET() {
  try {
    const docRef = doc(db, "daily-jobs", "heYcdbo5cq8vOlROMhXa")
    const docSnap = await getDoc(docRef)
    console.log("running")
    if (docSnap.exists()) {
      console.log(docSnap)
      return NextResponse.json(docSnap.data())
    } else {
      return NextResponse.json({ error: "Document does not exist" })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
