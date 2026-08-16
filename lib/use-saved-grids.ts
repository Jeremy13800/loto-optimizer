"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratedGrid } from "./types";

export interface SavedGrid {
  id: string;
  grid: GeneratedGrid;
  savedAt: string;
  label?: string;
}

const STORAGE_KEY = "loto_saved_grids";
const MAX_SAVED = 50;

export function useSavedGrids() {
  const [savedGrids, setSavedGrids] = useState<SavedGrid[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedGrids(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (grids: SavedGrid[]) => {
    setSavedGrids(grids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grids));
    } catch {}
  };

  const saveGrid = useCallback(
    (grid: GeneratedGrid, label?: string) => {
      const entry: SavedGrid = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        grid,
        savedAt: new Date().toISOString(),
        label,
      };
      setSavedGrids((prev) => {
        const next = [entry, ...prev].slice(0, MAX_SAVED);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const deleteGrid = useCallback((id: string) => {
    setSavedGrids((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    persist([]);
  }, []);

  return { savedGrids, saveGrid, deleteGrid, clearAll };
}
