export const runtime = 'edge';

const API_ENDPOINT = (query, page = 1) =>
  `https://www.rijksmuseum.nl/api/en/collection?key=${process.env.RIJKS_TOKEN}&q=${query}&imgonly=true&ps=100`

export const rijks = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query))
    const json = await response.json()

    const publicImages = json.artObjects.filter((item) => !!item.permitDownload)

    return publicImages.map((item) => ({
      title: item.title,
      image: item.webImage.url,
      url: item.links.web,
      artist: item.principalOrFirstMaker || item.principalMaker || '',
      date: item.dating?.presentingDate || '',
      museum: 'Rijksmuseum',
    }))
  } catch (error) {
    return []
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

    const data = await rijks(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
