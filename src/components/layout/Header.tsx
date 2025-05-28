"use client"

import React from "react"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  title: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export function Header({ title, showBack = false, rightElement }: HeaderProps) {
  const router = useRouter()

  return (
    <div className="h-16 bg-[#c8d5c8] flex items-center px-4">
      {showBack ? (
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#5a9b5a]" />
        </button>
      ) : (
        <div className="w-10"></div>
      )}

      <h1 className="flex-1 text-center text-[#5a9b5a] font-semibold">{title}</h1>

      <div className="w-10 flex justify-end">{rightElement}</div>
    </div>
  )
}
