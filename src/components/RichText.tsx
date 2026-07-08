import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Every page carries exactly one h1 (the listing/guide title), so headings
// coming from Airtable content are demoted: #/## -> h2, ### -> h3, and
// anything deeper -> h4. Content can never mint a second h1.
const COMPONENTS: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  h5: ({ children }) => <h4>{children}</h4>,
  h6: ({ children }) => <h4>{children}</h4>,
  // External links leave the site in a new tab; internal ones stay same-tab.
  a: ({ href, children }) => {
    const external = /^https?:\/\//i.test(href ?? '')
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
}

/**
 * Shared renderer for Airtable rich text (the API delivers it as Markdown):
 * listing long descriptions and guide bodies. Supports bold/italic, lists,
 * quotes, links, and demoted headings; raw HTML is stripped entirely
 * (skipHtml), so pasted markup or scripts can never render. Style at the
 * call site via className (the prose-cream typography theme).
 */
export default function RichText({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
