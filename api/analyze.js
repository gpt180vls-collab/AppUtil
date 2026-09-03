export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey, type, content, imageBase64 } = req.body

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' })
  }

  try {
    const body = {
      model: 'claude-opus-5',
      max_tokens: type === 'image' ? 2048 : 1024,
      messages: []
    }

    if (type === 'image') {
      body.messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: `Extraia o texto desta imagem/documento com cuidado para preservar a formatação e caracteres especiais.

Identifique se contém:
- Uma INSTRUÇÃO (tutorial, aula, conteúdo educativo)
- Um QUIZ (perguntas com alternativas)

Responda APENAS em JSON válido (sem markdown, sem comentários):
{
  "type": "instruction ou quiz",
  "text": "texto extraído completo e limpo",
  "summary": "resumo breve (até 50 caracteres)"
}

IMPORTANTE: Limpe caracteres estranhos e normalize o texto.`
          }
        ]
      })
    } else if (type === 'content') {
      body.messages.push({
        role: 'user',
        content: `Analise este conteúdo e identifique se é uma instrução (tutorial/manual) ou um quiz (perguntas/teste).

Responda em JSON com este formato:
{
  "type": "instruction" ou "quiz",
  "confidence": 0.0 a 1.0,
  "summary": "resumo breve",
  "questions": [] // apenas se for quiz
}

Conteúdo:
${content}`
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({ error: errorData.error?.message || 'API error' })
    }

    const data = await response.json()
    const text = data.content[0].text

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]))
    }

    return res.json({ type: 'instruction', confidence: 0.5, summary: content || 'Conteúdo detectado' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
