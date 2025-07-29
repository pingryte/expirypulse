"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import DomainStatusTable from "@/components/DomainStatusTable"

type DomainResult = {
  domain: string
  sslExpiry: string | null
  whoisExpiry: string | null
}

export default function Home() {
  const [domain, setDomain] = useState("")
  const [results, setResults] = useState<DomainResult[]>([])

  const handleAddDomain = async () => {
    const trimmed = domain.trim().toLowerCase()

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed)) {
      toast.error("Invalid domain format")
      return
    }

    toast.loading("Checking expiry info...")

    try {
      const res = await fetch("/api/check-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmed }),
      })

      if (!res.ok) throw new Error("Check failed")

      const data = await res.json()

      setResults((prev) => [
        ...prev.filter((r) => r.domain !== trimmed), // overwrite if exists
        { domain: trimmed, sslExpiry: data.sslExpiry, whoisExpiry: data.whoisExpiry },
      ])

      toast.success(`✅ SSL expires on ${data.sslExpiry}`)
      setDomain("")
    } catch (err) {
      toast.error("❌ Failed to check domain")
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* Add Domain UI */}
        <div className="flex flex-col gap-2 w-full max-w-md">
          <h2 className="text-xl font-semibold">Add a Domain</h2>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button onClick={handleAddDomain}>Add</Button>
          </div>
        </div>

        {/* ✅ Domain results table */}
        {results.length > 0 && (
          <div className="w-full mt-8">
            <DomainStatusTable results={results} />
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* ... unchanged footer links ... */}
      </footer>
    </div>
  )
}
