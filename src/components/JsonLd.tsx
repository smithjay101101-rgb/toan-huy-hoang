import { Head } from 'vite-react-ssg'

/** Inject a JSON-LD block into the document head as static HTML. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  )
}
