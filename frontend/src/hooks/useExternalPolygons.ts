import { useSuspenseQuery } from "@tanstack/react-query"

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

export const useExternalPolygons = () =>
  useSuspenseQuery({
    queryKey: ["external-polygons"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/aip`)
      if (!res.ok) throw new Error("Failed to fetch external polygons")
      return res.json()
    },
  })
