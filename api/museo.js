const { aiChicago } = require('./ai-chicago')
const { artsmia } = require('./artsmia')
const { useum } = require('./useum')
const { harvard } = require('./harvard')
const { nypl } = require('./nypl')
const { rijks } = require('./rijks')
const { cleveland } = require('./cleveland')

const interleave = ([x, ...xs], ys) => (x ? [x, ...interleave(ys, xs)] : ys)

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q
  // const sources = [aiChicago, artsmia, harvard, nypl, rijks, cleveland]
  const sources = [aiChicago, artsmia, useum, harvard, nypl, rijks]

  try {
    if (!query) {
      throw 'Specify a query parameter'
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

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 422,
      body: String(error),
    }
  }
}
