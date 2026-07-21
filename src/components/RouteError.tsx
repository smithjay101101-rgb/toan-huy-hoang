import { useEffect, useState } from 'react'
import { useRouteError } from 'react-router-dom'
import { reloadOnceForStaleDeploy } from '@/lib/staleDeploy'

/**
 * Root errorElement. The only error this app hits in practice is a tab from a
 * previous deploy fetching loader data / route chunks that no longer exist
 * (every deploy replaces the hashed files) — one hard reload of the current
 * URL recovers completely, so try that first, invisibly. If we reloaded
 * seconds ago and still land here, show a quiet branded fallback instead of
 * React Router's stack-trace screen.
 */
export default function RouteError() {
  const error = useRouteError()
  const [reloading, setReloading] = useState(true)

  useEffect(() => {
    console.error('[route-error]', error)
    if (!reloadOnceForStaleDeploy()) setReloading(false)
  }, [error])

  if (reloading) return null
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: '#0d161e', color: '#eef0f0', fontFamily: "'Jost', sans-serif" }}
    >
      <div className="font-display text-[20px] font-semibold uppercase tracking-[0.28em]">
        Toan Huy Hoang
      </div>
      <p className="max-w-[36ch] text-[15px] font-light" style={{ color: 'rgba(238,240,240,0.7)' }}>
        Something went wrong loading this page.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="cursor-pointer bg-gold-2 px-[34px] py-[14px] text-[13px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-200 hover:bg-white"
      >
        Reload · Tải lại · Обновить · 새로고침
      </button>
    </div>
  )
}
