"use client"

import { useState, useCallback } from "react"

export function useFavorites(initialFavorites: number[] = []) {
  const [favorites, setFavorites] = useState<number[]>(initialFavorites)

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }, [])

  const addFavorite = useCallback((id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id))
  }, [])

  const isFavorite = useCallback(
    (id: number) => {
      return favorites.includes(id)
    },
    [favorites],
  )

  return {
    favorites,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}
