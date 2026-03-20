import AppliedJobsPage from "@/pages/appliedJobsPage"
import ProtectedRoute from "@/context/ProtectedRoute"

export default function AppliedJobs() {
  return (
    <ProtectedRoute>
      <AppliedJobsPage />
    </ProtectedRoute>
  )
}
