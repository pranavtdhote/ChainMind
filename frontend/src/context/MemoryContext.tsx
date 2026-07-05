"use client";

import React, { createContext, useContext, useState } from "react";
import { IMemoryRecord } from "../services/memory.service";

interface MemoryContextType {
  memories: IMemoryRecord[];
  searchQuery: string;
  filterRole: string;
  viewMode: "grid" | "list";
  setSearchQuery: (query: string) => void;
  setFilterRole: (role: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  registerMemoryLocal: (memory: IMemoryRecord) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<IMemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const registerMemoryLocal = (newMemory: IMemoryRecord) => {
    setMemories((prev) => [newMemory, ...prev]);
  };

  return (
    <MemoryContext.Provider
      value={{
        memories,
        searchQuery,
        filterRole,
        viewMode,
        setSearchQuery,
        setFilterRole,
        setViewMode,
        registerMemoryLocal,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error("useMemory must be used within a MemoryProvider");
  }
  return context;
};
