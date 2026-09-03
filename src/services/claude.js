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

      // O backend (/api/analyze) já retorna o JSON extraído da resposta do Claude
      return await response.json()
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
          type: 'raw',
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

      // O backend (/api/analyze) já retorna o JSON extraído da resposta do Claude
      return await response.json()
    } catch (error) {
      console.error('Error answering quiz:', error)
      return { answers: [] }
    }
  },

  // Responde uma única pergunta (usado no fluxo de captura via câmera)
  answerQuestion: async (questionText, courseContent, apiKey) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'raw',
          apiKey,
          content: `Você é um assistente de estudo. Com base no conteúdo do curso abaixo, responda a pergunta.

CONTEÚDO DO CURSO:
${courseContent || '(nenhum conteúdo de curso salvo ainda)'}

PERGUNTA:
${questionText}

Responda em JSON com este formato:
{
  "answer": "resposta direta e objetiva (ou a letra da alternativa correta, se for múltipla escolha)",
  "explanation": "breve explicação do porquê"
}

Baseie a resposta APENAS no conteúdo do curso fornecido. Se o conteúdo não for suficiente, diga isso na explicação.`
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error answering question:', error)
      return { answer: null, explanation: 'Erro ao obter resposta do Claude' }
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

      // O backend (/api/analyze) já retorna o JSON extraído da resposta do Claude
      const result = await response.json()

      // Limpar caracteres estranhos do texto
      if (result.text) {
        result.text = result.text
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .trim()
      }
      return result
    } catch (error) {
      console.error('Error analyzing image:', error)
      return { type: 'instruction', text: '', summary: '' }
    }
  }
}
