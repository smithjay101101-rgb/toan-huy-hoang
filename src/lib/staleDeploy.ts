// Recovery for tabs that outlive a deploy. Every deploy replaces the hashed
// asset + loader-data files, so a page loaded BEFORE the deploy 404s when it
// lazy-loads a route chunk or fetches loader JSON on its next SPA navigation
// (Safari surfaces the JSON case as "The string did not match the expected
// pattern"). A hard reload fetches the freshly deployed HTML with the new
// hashes — full recovery. The timestamp guard stops a reload loop when the
// failure is NOT staleness (e.g. the network is actually down).
const KEY = 'thh-stale-reload'

export function reloadOnceForStaleDeploy(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < 15_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Storage unavailable (private mode quirks): reloading anyway is the
    // better failure mode; the loop risk is theoretical there.
  }
  window.location.reload()
  return true
}
