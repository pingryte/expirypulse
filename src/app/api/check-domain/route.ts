import { NextResponse } from "next/server"
import tls from "tls"
import whois from "whois-json"

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 })
    }

    const sslExpiry = await getSSLCertExpiry(domain)
    const whoisExpiry = await getWhoisExpiry(domain)

    return NextResponse.json({
      domain,
      sslExpiry,
      whoisExpiry,
      status: "ok",
    })
  } catch (err) {
    console.error("Error checking domain:", err)
    return NextResponse.json({ error: "Failed to check domain" }, { status: 500 })
  }
}

async function getSSLCertExpiry(domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, timeout: 5000 },
      () => {
        const cert = socket.getPeerCertificate()
        socket.end()

        if (!cert || !cert.valid_to) return reject(new Error("No certificate found"))

        const expiry = new Date(cert.valid_to).toISOString().split("T")[0]
        resolve(expiry)
      }
    )

    socket.on("error", (err) => reject(err))
    socket.on("timeout", () => {
      socket.destroy()
      reject(new Error("TLS timeout"))
    })
  })
}

async function getWhoisExpiry(domain: string): Promise<string | null> {
  console.log("🔍 Starting WHOIS check for:", domain)
  try {
    const data = await whois(domain)
    console.log("✅ WHOIS data received:", data)

    const expiry =
      data["Registry Expiry Date"] ||
      data["Registrar Registration Expiration Date"] ||
      data["Expiration Date"]

    if (!expiry) return null

    const parsedDate = new Date(expiry)
    return isNaN(parsedDate.getTime())
      ? null
      : parsedDate.toISOString().split("T")[0]
  } catch (err) {
    console.warn("⚠️ WHOIS error for domain:", domain, err)
    return null
  }
}
