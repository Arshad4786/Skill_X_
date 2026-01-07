"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, ChevronDown, X } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  type: "text" | "range" | "select" | "checkbox"
  value?: string | number | boolean
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  step?: number
}

interface FilterPanelProps {
  filters: FilterOption[]
  onFilterChange: (filterId: string, value: any) => void
  onReset?: () => void
}

export function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const activeFilters = filters.filter((f) => f.value !== undefined && f.value !== "")

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="gap-2 bg-transparent">
        <Filter className="w-4 h-4" />
        Filters
        {activeFilters.length > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {activeFilters.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/30">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="text-sm font-medium text-foreground mb-2 block">{filter.label}</label>

              {filter.type === "text" && (
                <Input
                  type="text"
                  value={filter.value as string}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  placeholder={`Search ${filter.label.toLowerCase()}...`}
                  className="bg-input border-border"
                />
              )}

              {filter.type === "range" && (
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                    value={filter.value as number}
                    onChange={(e) => onFilterChange(filter.id, Number.parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-foreground w-12">{filter.value}</span>
                </div>
              )}

              {filter.type === "select" && filter.options && (
                <select
                  value={filter.value as string}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === "checkbox" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.value as boolean}
                    onChange={(e) => onFilterChange(filter.id, e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">Enable {filter.label}</span>
                </label>
              )}
            </div>
          ))}

          {onReset && activeFilters.length > 0 && (
            <Button onClick={onReset} variant="outline" size="sm" className="w-full gap-2 bg-transparent">
              <X className="w-4 h-4" />
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
