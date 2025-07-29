"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type DomainResult = {
  domain: string
  sslExpiry: string | null
  whoisExpiry: string | null
}

type Props = {
  results: DomainResult[]
}

function getStatusBadge(dateStr: string | null): JSX.Element {
  if (!dateStr) {
    return <Badge variant="destructive">❌ Failed</Badge>
  }

  const today = new Date()
  const expiryDate = new Date(dateStr)
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return <Badge variant="destructive">❌ Expired</Badge>
  } else if (diffDays < 30) {
    return <Badge variant="secondary">⚠️ Soon</Badge>
  } else {
    return <Badge variant="default">✅ OK</Badge>
  }
}

export default function DomainStatusTable({ results }: Props) {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>SSL Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>WHOIS Expiry</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.domain}>
              <TableCell className="font-medium">{r.domain}</TableCell>
              <TableCell>
                {r.sslExpiry ? (
                  r.sslExpiry
                ) : (
                  <a
                    href={`https://www.sslshopper.com/ssl-checker.html#hostname=${r.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-muted-foreground text-sm"
                  >
                    Check manually
                  </a>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(r.sslExpiry)}</TableCell>
              <TableCell>
                {r.whoisExpiry ? (
                  r.whoisExpiry
                ) : (
                  <a
                    href={`https://who.is/whois/${r.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-muted-foreground text-sm"
                  >
                    Check manually
                  </a>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(r.whoisExpiry)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
