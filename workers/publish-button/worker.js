// "Update website" button for Airtable's FREE plan.
//
// Airtable paywalls the button's "Run script" action (it needs the Scripting
// extension). "Open URL" is free, so the button opens this Worker instead,
// and the Worker fires the same GitHub trigger the old script did
// (repository_dispatch "airtable-poll" -> fingerprint-gated rebuild).
//
// Secrets (set with `npx wrangler secret put <NAME>` in this folder):
//   GITHUB_TOKEN  fine-grained PAT, repo toan-huy-hoang only, Contents: Read and write
//   BUTTON_KEY    long random string; must match ?key= in the Airtable button URL
//
// Worst case if the link leaks: someone triggers a rebuild. A rebuild with no
// content change publishes nothing (the workflow skips identical content).

const REPO = 'smithjay101101-rgb/toan-huy-hoang'
const COOLDOWN_SECONDS = 60 // double-clicks must not stack deploys (best effort, per isolate)
let lastFired = 0

function page(title, body, status = 200) {
  return new Response(
    `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;background:#0d161e;color:#eef0f0;display:flex;
min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;text-align:center}
h1{font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#d4b46a;margin:0 0 18px}
p{font-size:16px;line-height:1.6;max-width:36ch;margin:6px auto;opacity:.85}</style></head>
<body><div><h1>Toan Huy Hoang</h1>${body}</div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  )
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (!env.BUTTON_KEY || url.searchParams.get('key') !== env.BUTTON_KEY) {
      return page('Not found', '<p>Not found.</p>', 404)
    }
    const now = Date.now() / 1000
    if (now - lastFired < COOLDOWN_SECONDS) {
      return page('Đang cập nhật', `<p><b>Đã nhận yêu cầu cập nhật rồi.</b> Website sẽ cập nhật trong vòng khoảng 1 giờ.</p>
        <p style="font-size:14px">Update already requested — live within about an hour.</p>`)
    }
    const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'publish-button-worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'airtable-poll' }),
    })
    if (res.status === 204) {
      lastFired = now
      return page('Đang cập nhật', `<p><b>Đã bắt đầu cập nhật website ✓</b></p>
        <p>Thay đổi sẽ hiển thị trong vòng khoảng 1 giờ. Chị có thể đóng tab này.</p>
        <p style="margin-top:18px;font-size:14px">Website update started — live within about an hour. You can close this tab.</p>`)
    }
    return page('Lỗi', `<p><b>Chưa cập nhật được (lỗi ${res.status}).</b></p>
      <p>Vui lòng thử lại sau vài phút hoặc báo cho Nicholas.</p>
      <p style="margin-top:18px;font-size:14px">Update could not start (error ${res.status}).</p>`, 502)
  },
}
