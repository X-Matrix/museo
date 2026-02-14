export const runtime = 'edge';

const API_ENDPOINT = `http://apicollections.parismusees.paris.fr/graphql`

const graphqlQuery = (query) => `
  {
    nodeQuery(
      filter: {
        conditions: [
          {field: "title", value: "%park%", operator: LIKE},
          {field: "type", value: "oeuvre"},
          {field: "field_visuels", operator: IS_NOT_NULL},
          {field: "field_visuels.entity.field_image_libre", value: "1"}
        ]
      },
      limit: 100
    ) {
      entities {
        ... on NodeOeuvre {
          title
          url: absolutePath
          fieldVisuels {
            entity {
              url: publicUrl
            }
          }
        }
      }
    }
  }
`

export default async function handler(req, res) {
  const { q: query } = req.query

  if (!process.env.PARIS_TOKEN) {
    return res.status(200).json([])
  }

  try {
    if (!query) {
      return res.status(422).json({ error: 'Specify a query parameter' })
    }

    const responseBody = JSON.stringify({query: graphqlQuery(query)})

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': process.env.PARIS_TOKEN
      },
      body: responseBody
    })

    const json = await response.json()
    let data = []

    if (json.data && json.data.nodeQuery.entities) {
      data = json.data.nodeQuery.entities.map(item => ({
        title: item.title,
        image: item.fieldVisuels[0].entity.url,
        url: item.url
      }))
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: String(error) })
  }
}
