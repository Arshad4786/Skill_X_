"use client"

import { useState, useCallback } from "react"

interface FilterState {
  [key: string]: any
}

export function useFilters(initialFilters: FilterState = {}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some((value) => value !== undefined && value !== "" && value !== null)
  }, [filters])

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
    hasActiveFilters,
  }
}
