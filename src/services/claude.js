// Serviço de integração com Claude API

export const claudeService = {
  analyzeContent: async (content, apiKey) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 1024,
          messages: [
            {
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
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return { type: 'instruction', confidence: 0.5, summary: content }
    } catch (error) {
      console.error('Error analyzing content:', error)
      return { type: 'instruction', confidence: 0, summary: content }
    }
  },

  answerQuiz: async (questions, courseContent, apiKey) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `Você é um assistente de estudo. Com base no seguinte conteúdo do curso, responda as perguntas do quiz.

CONTEÚDO DO CURSO:
${courseContent}

PERGUNTAS DO QUIZ:
${questions.map((q, i) => `${i + 1}. ${q.text}\n${q.options ? q.options.map((o, j) => `   ${String.fromCharCode(97 + j)}) ${o}`).join('\n') : ''}`).join('\n\n')}

Responda em JSON com este formato:
{
  "answers": [
    {
      "questionIndex": 0,
      "answer": "resposta ou letra (a/b/c/d)",
      "explanation": "breve explicação"
    }
  ]
}

Baseie as respostas APENAS no conteúdo fornecido acima.`
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return { answers: [] }
    } catch (error) {
      console.error('Error answering quiz:', error)
      return { answers: [] }
    }
  },

  analyzeImage: async (imageBase64, apiKey) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 2048,
          messages: [
            {
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
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content[0].text

      // Tentar extrair JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        // Limpar caracteres estranhos do texto
        if (result.text) {
          result.text = result.text
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim()
        }
        return result
      }

      return { type: 'instruction', text: '', summary: '' }
    } catch (error) {
      console.error('Error analyzing image:', error)
      return { type: 'instruction', text: '', summary: '' }
    }
  }
}
