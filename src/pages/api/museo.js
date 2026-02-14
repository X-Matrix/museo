export const runtime = 'edge';

const { aiChicago } = require('./ai-chicago')
const { artsmia } = require('./artsmia')
const { useum } = require('./useum')
const { harvard } = require('./harvard')
const { nypl } = require('./nypl')
const { rijks } = require('./rijks')
const { cleveland } = require('./cleveland')

const interleave = ([x, ...xs], ys) => (x ? [x, ...interleave(ys, xs)] : ys)

export default async function handler(req, res) {
  const { q: query } = req.query
  // const sources = [aiChicago, artsmia, harvard, nypl, rijks, cleveland]
  const sources = [aiChicago, artsmia, useum, harvard, nypl, rijks]

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
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

    return res.status(200).json(data)
  } catch (error) {
    return res.status(422).json({ error: String(error) })
  }
}
