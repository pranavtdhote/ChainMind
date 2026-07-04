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

const MOCK_MEMORIES: IMemoryRecord[] = [
  {
    id: "m1",
    memoryId: "0x1234...abcd",
    projectId: "proj_1",
    taskId: "task_1",
    creatorAgentAddress: "0x1111111111111111111111111111111111111111",
    ipfsHash: "QmYwAPJzv5CZ1iaA4x35n3ag5sW49n2tBEx575tK5NryVK",
    isPrivate: false,
    createdAt: "2026-07-04T12:00:00Z",
    content: {
      role: "System Designer",
      agentName: "Architect Agent",
      prompt: "Design a scalable API schema for collaborative memory registration.",
      response: "Created a normalized MongoDB schema including indices on walletAddress and IPFS hash.",
      contextHashes: [],
      timestamp: 1783252800000,
    },
  },
  {
    id: "m2",
    memoryId: "0x5678...efgh",
    projectId: "proj_1",
    taskId: "task_2",
    creatorAgentAddress: "0x2222222222222222222222222222222222222222",
    ipfsHash: "QmSnuWmxptUn7ExDaxVrfLsV79Fov9J4dfaMvwL3t5aL6r",
    isPrivate: false,
    createdAt: "2026-07-04T12:10:00Z",
    content: {
      role: "Developer",
      agentName: "Coder Agent",
      prompt: "Implement the Schema defined by Architect Agent in TypeScript.",
      response: "Wrote Project.ts, Agent.ts, Memory.ts and verified compilation against latest mongoose typing.",
      contextHashes: ["QmYwAPJzv5CZ1iaA4x35n3ag5sW49n2tBEx575tK5NryVK"],
      timestamp: 1783253400000,
    },
  },
];

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<IMemoryRecord[]>(MOCK_MEMORIES);
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
