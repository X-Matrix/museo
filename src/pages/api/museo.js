export const runtime = 'edge';

import { aiChicago } from './ai-chicago'
import { artsmia } from './artsmia'
import { useum } from './useum'
import { harvard } from './harvard'
import { nypl } from './nypl'
import { rijks } from './rijks'
import { cleveland } from './cleveland'

const interleave = ([x, ...xs], ys) => (x ? [x, ...interleave(ys, xs)] : ys)

export default async function handler(req) {
  const url = new URL(req.url, `http://${req.headers.get('host')}`)
  const query = url.searchParams.get('q')
  // const sources = [aiChicago, artsmia, harvard, nypl, rijks, cleveland]
  const sources = [aiChicago, artsmia, useum, harvard, nypl, rijks]

  try {
    if (!query) {
      return new Response(JSON.stringify({ error: 'Specify a query parameter' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const results = await Promise.allSettled(
      sources.map((source) => source(query))
    )

    // 只取成功的结果，并优先把 useum 的结果放到最前面
    const fulfilled = results
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.status === 'fulfilled')

    const useumIndex = sources.indexOf(useum)
    let orderedArrays = []

    if (useumIndex !== -1) {
      const useumEntry = fulfilled.find(({ i }) => i === useumIndex)
      if (useumEntry) {
        orderedArrays.push(useumEntry.r.value)
      }
      fulfilled.forEach(({ r, i }) => {
        if (i !== useumIndex) orderedArrays.push(r.value)
      })
    } else {
      orderedArrays = fulfilled.map(({ r }) => r.value)
    }

    const data = orderedArrays.reduce((acc, arr) => interleave(acc, arr), [])

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
