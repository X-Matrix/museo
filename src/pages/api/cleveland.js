export const runtime = 'edge';

const fetch = require('node-fetch')

const API_ENDPOINT = (query) =>
  `https://openaccess-api.clevelandart.org/api/artworks/?q=${query}&has_image=1&limit=100&cc0`

exports.cleveland = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    if (!response.ok) {
      throw 'Query to Cleveland API failed'
    }

    const json = await response.json()

    return json.data.map((item) => ({
      title: item.title,
      image: item.images.web.url,
      url: item.url,
    }))
  } catch (error) {
    return []
  }
}

exports.handler = async (event, context) => {
  const query = event.queryStringParameters.q

  try {
    if (!query) {
      throw 'Specify a query parameter'
    }

    const data = await exports.cleveland(query)

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

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const data = await exports.cleveland(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
