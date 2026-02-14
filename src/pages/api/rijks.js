export const runtime = 'edge';

const fetch = require('node-fetch')

const API_ENDPOINT = (query, page = 1) =>
  `https://www.rijksmuseum.nl/api/en/collection?key=${process.env.RIJKS_TOKEN}&q=${query}&imgonly=true&ps=100`

exports.rijks = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const publicImages = json.artObjects.filter((item) => !!item.permitDownload)

    return publicImages.map((item) => ({
      title: item.title,
      image: item.webImage.url,
      url: item.links.web,
    }))
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  if (!process.env.RIJKS_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    }
  }

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const data = await exports.rijks(query)

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

export default async function handler(req, res) {
  const { q: query } = req.query

  if (!process.env.RIJKS_TOKEN) {
    return res.status(200).json([])
  }

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const data = await exports.rijks(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
