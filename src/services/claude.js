// Serviço de integração com Claude API

export const claudeService = {
  analyzeContent: async (content, apiKey) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'content',
          apiKey,
          content
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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'content',
          apiKey,
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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'image',
          apiKey,
          imageBase64
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
