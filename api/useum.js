const fetch = require('node-fetch')

const LOG = (...args) => console.log(new Date().toISOString(), ...args)
const ERROR = (...args) => console.error(new Date().toISOString(), ...args)

const API_ENDPOINT = (query, pageNum = 1, pageSize = 20, free = false) =>
  `https://apy.useum.org/artwork?pageNum=${pageNum}&pageSize=${pageSize}&free=${free}&search_phrase=${encodeURIComponent(
    query
  )}`

exports.useum = async (query, pageNum = 1, pageSize = 6) => {
  try {
    const url = API_ENDPOINT(query, pageNum, pageSize)
    LOG('useum: fetching', { url, pageNum, pageSize })
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://useum.org/',
      Origin: 'https://useum.org',
      Connection: 'keep-alive',
      'Accept-Encoding': 'gzip,deflate,br',
    }

    const options = { headers }

    // Optional: support proxy via PROXY_URL / HTTPS_PROXY / HTTP_PROXY env var
    try {
      const proxyUrl = process.env.PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      if (proxyUrl) {
        try {
          const HttpsProxyAgent = require('https-proxy-agent')
          options.agent = new HttpsProxyAgent(proxyUrl)
          LOG('useum: using proxy', proxyUrl)
        } catch (err) {
          LOG('useum: https-proxy-agent not installed, skipping proxy', err && err.message)
        }
      }
    } catch (err) {
      // ignore
    }

    // Forward the request through the 1cup proxy to avoid Cloudflare blocks
    // Token MUST be set as a Cloudflare environment variable
    const proxyToken = process.env.WEB_PROXY_TOKEN || process.env.PROXY_TOKEN || process.env.CLOUDFLARE_TOKEN
    if (!proxyToken) {
      ERROR('useum: WEB_PROXY_TOKEN environment variable is not set')
      return []
    }
    const proxyBase = `https://web-proxy.1cup.cafe/?token=${encodeURIComponent(proxyToken)}&u=`
    const proxyUrl = proxyBase + encodeURIComponent(url)
    LOG('useum: fetching via proxy', { proxyUrl })
    const response = await fetch(proxyUrl, options)
    LOG('useum: response status', response.status)

    if (!response.ok) {
      const text = await response.text().catch(() => null)
      ERROR('useum: non-ok response', { status: response.status, body: text })

      // On non-OK responses (e.g. Cloudflare 403), return empty result
      // so this source doesn't break aggregated responses from other sources.
      return []
    }

    const json = await response.json()
    LOG('useum: fetched json type', Array.isArray(json) ? 'array' : typeof json)
    LOG('useum: fetched json', json)

    // The API can return either an array or an object with a `results`/`data` array.
    let items = []
    if (Array.isArray(json)) {
      items = json
    } else if (Array.isArray(json.results)) {
      items = json.results
    } else if (Array.isArray(json.data)) {
      items = json.data
    }

    if (!Array.isArray(items) || items.length === 0) return []

    // Map useum items to the same shape as other APIs (ai-chicago)
    // Mapping (chicago -> useum):
    // title  -> artwork_title
    // image  -> artwork_max240w_url
    // url    -> https://www.useum.org/{exhibit_useum_url}
    const mapped = items.map((item) => {
      const title = item.artwork_title || item.title || ''
      const image = item.artwork_max240w_url || item.image || ''
      const exhibit = item.exhibit_useum_url || item.exhibit_useum_url || ''
      const url = exhibit ? `https://www.useum.org/artwork/${exhibit}` : (item.url || '')

      return {
        title,
        image,
        url,
      }
    })

    LOG('useum: returning mapped items, length', mapped.length)
    return mapped
  } catch (error) {
    ERROR('useum: fetch error', error && (error.stack || error))
    return []
  }
}

exports.handler = async (event, context) => {
  const params = event.queryStringParameters || {}
  const query = params.q || params.search_phrase
  const pageNum = params.pageNum ? parseInt(params.pageNum, 10) : 1
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 6

  try {
    if (!query) {
      throw 'Specify a query parameter (q or search_phrase)'
    }

    LOG('handler: incoming', { query, pageNum, pageSize })
    const data = await exports.useum(query, pageNum, pageSize)
    LOG('handler: got data', { length: Array.isArray(data) ? data.length : 'unknown' })

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    ERROR('handler: error', error && (error.stack || error))

    // If the error is due to missing query parameter, return 422.
    const message = String(error)
    if (message && message.includes('Specify a query parameter')) {
      return {
        statusCode: 422,
        body: message,
      }
    }

    // For other errors, return empty array so other sources aren't affected.
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }
}
