declare module "whois-json" {
  function whois(domain: string): Promise<Record<string, any>>
  export = whois
}
