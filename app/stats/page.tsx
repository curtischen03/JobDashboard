import StatsPage from "@/pages/statsPage"
import ProtectedRoute from "@/context/ProtectedRoute"
export default function Stats() {
  return (
    <ProtectedRoute>
      <StatsPage />
    </ProtectedRoute>
  )
}
