# Guides (blog) — Airtable setup

The Guides section reads a separate Airtable table at build time. Until the
table exists, the site shows 3 placeholder guides automatically.

## 1. Create the `Guides` table

In the existing base (`appZ9wP5ZlerVW3z8`), add a new table named **`Guides`**
(its own tab, separate from Listings). Add these fields with these exact names:

| Field | Type | Notes |
|---|---|---|
| `Slug` | Single line text | Unique, lowercase kebab-case. The URL segment. Leave blank to auto-generate from `Title_EN`. |
| `Slug_VI` `Slug_RU` `Slug_KO` | Single line text | Optional localized URL slugs (keyworded URLs per language for SEO). Blank = that language uses `Slug`. |
| `Status` | Single select | Options: `Draft`, `Published`. Only `Published` is built. |
| `Category` | Single select | Options: `Neighborhood Guides`, `Buying Process`, `Investment`, `Lifestyle`, `Legal`. |
| `Title_EN` `Title_VI` `Title_RU` `Title_KO` | Single line text | One per language. |
| `Excerpt_EN` `Excerpt_VI` `Excerpt_RU` `Excerpt_KO` | Long text | Card preview + meta description fallback. |
| `Body_EN` `Body_VI` `Body_RU` `Body_KO` | Long text | Article body in **Markdown**. |
| `Meta_Title_EN` `_VI` `_RU` `_KO` | Single line text | Optional SEO title override. Falls back to `Title_*`. |
| `Meta_Description_EN` `_VI` `_RU` `_KO` | Long text | Optional SEO description override. Falls back to `Excerpt_*`. |
| `Cover_Image` | Attachment | Optional. Small card thumbnail + OG image. The index has no hero. |
| `Published_Date` | Date | Ordering + `datePublished`. |
| `Updated_Date` | Date | Sitemap `lastmod` + `dateModified`. Falls back to `Published_Date`. |
| `Featured` | Checkbox | Optional. Surfaces the guide first on the index. |
| `Author` | Single line text | Optional. Defaults to "Toan Huy Hoang". |
| `Old_URL` | Single line text | Optional. The article's URL on the previous website; the build generates a redirect from that old address to this guide (several allowed, comma-separated). |

`Body_*` fields have **rich text enabled**: bold, lists, links, and headings
render on the site (`##` + space = Heading 2, `###` = Heading 3; a heading can
be a link: `## [words](/vi/guides/slug)`). Internal links must start with `/`
(never a full domain) so the domain cutover cannot break them.

**Russian (`_RU`) is included** because the site has 4 locales (EN/VI/RU/KO).
Leave the RU fields blank if you do not have Russian copy; that guide simply
will not build a Russian page.

### Per-language rule (important for SEO)

A guide is built for a language only when **both** `Title_*` and `Body_*` are
filled for it. EN-only guide → only the EN page exists, and its hreflang lists
only EN. No empty or duplicated translated pages are ever generated.

## 2. Auto-rebuild automation (publish → site updates)

The site deploys from GitHub (not Cloudflare). The deploy workflow already
listens for a GitHub `repository_dispatch` event (`airtable-publish`). Set up
the automation in the `Guides` table:

1. Airtable → **Automations** → **Create automation**.
2. **Trigger:** "When a record matches conditions" → Table: `Guides` →
   Condition: `Status` is `Published`.
3. **Action:** "Run a script" → paste the script below.
4. Replace the placeholder token, then **turn the automation on**.

```js
// Paste a GitHub Personal Access Token with `repo` scope on toan-huy-hoang.
// Keep it private. Create at github.com/settings/tokens.
const GITHUB_TOKEN = 'PASTE_GITHUB_TOKEN_HERE'

await fetch('https://api.github.com/repos/smithjay101101-rgb/toan-huy-hoang/dispatches', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  body: JSON.stringify({ event_type: 'airtable-publish' }),
})
```

This fires on publish and on edits to already-published rows, and triggers a
rebuild in ~3 minutes. The same automation pattern works for the Listings table
(duplicate it there to auto-rebuild on listing publish too).

## 3. Optional env (only if you isolate guides in a new base)

By default the build reuses the listings token and base, reading the `Guides`
table. To put guides in a separate base instead, set in the deploy workflow:

- `AIRTABLE_GUIDES_BASE_ID` — the new base id
- `AIRTABLE_GUIDES_TABLE` — defaults to `Guides`
