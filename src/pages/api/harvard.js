export const runtime = 'edge';

const API_ENDPOINT = (query, page = 1) =>
  `https://api.harvardartmuseums.org/object?apikey=${process.env.HARVARD_TOKEN}&q=${query}&hasimage=1&size=100`

export const harvard = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const withImages = json.records.filter((item) => item.images.length > 0)

    return withImages.map((item) => ({
      title: item.title,
      image: item.images[item.images.length - 1].baseimageurl,
      url: item.url,
      artist: item.people?.[0]?.name || item.creditline || '',
      date: item.dated || item.datebegin ? String(item.datebegin) : '',
      museum: 'Harvard Art Museums',
      culture: item.culture || '',
    }))
  } catch (error) {
    return []
  }
}

export default async function handler(req, res) {
  const { q: query } = req.query

  if (!process.env.HARVARD_TOKEN) {
    return res.status(200).json([])
  }

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const data = await harvard(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
