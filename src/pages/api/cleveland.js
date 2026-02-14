export const runtime = 'edge';

const API_ENDPOINT = (query) =>
  `https://openaccess-api.clevelandart.org/api/artworks/?q=${query}&has_image=1&limit=100&cc0`

export const cleveland = async (query) => {
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
      artist: item.creators?.[0]?.description || item.creators?.[0]?.biography || '',
      date: item.creation_date || item.creation_date_earliest ? String(item.creation_date_earliest) : '',
      museum: 'The Cleveland Museum of Art',
      culture: item.culture?.[0] || '',
      medium: item.technique || '',
    }))
  } catch (error) {
    return []
  }
}

export default async function handler(req, res) {
  const { q: query } = req.query

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const data = await cleveland(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
