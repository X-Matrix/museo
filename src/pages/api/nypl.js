export const runtime = 'edge';

const API_ENDPOINT = (query) =>
  `http://api.repo.nypl.org/api/v2/items/search?q=${query}&publicDomainOnly=true&per_page=100`

const IMAGE_URL = (id) => `http://images.nypl.org/index.php?id=${id}&t=w`

export const nypl = async (query) => {
  try {
    const response = await fetch(API_ENDPOINT(query), {
      headers: {
        Authorization: `Token token="${process.env.NYPL_TOKEN}"`,
      },
    })

    const json = await response.json()

    if (!json.nyplAPI.response) {
      return []
    }

    if (Array.isArray(json.nyplAPI.response.result)) {
      return json.nyplAPI.response.result.map((item) => ({
        title: item.title,
        image: IMAGE_URL(item.imageID),
        url: item.itemLink,
        artist: item.creator || '',
        date: item.dateIssued || '',
        museum: 'New York Public Library',
        collection: item.collection || '',
      }))
    } else {
      return [json.nyplAPI.response.result].map((item) => ({
        title: item.title,
        image: IMAGE_URL(item.imageID),
        url: item.itemLink,
        artist: item.creator || '',
        date: item.dateIssued || '',
        museum: 'New York Public Library',
        collection: item.collection || '',
      }))
    }
  } catch (error) {
    return []
  }
}

export default async function handler(req, res) {
  const { q: query } = req.query

  if (!process.env.NYPL_TOKEN) {
    return res.status(200).json([])
  }

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const data = await nypl(query)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
