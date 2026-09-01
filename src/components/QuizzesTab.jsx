import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { CheckCircle, AlertCircle, Loader, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { claudeService } from '../services/claude'

export default function QuizzesTab() {
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const [isAnswering, setIsAnswering] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})

  const {
    documents,
    quizzes,
    selectedProject,
    addQuiz,
    updateQuizAnswers,
    deleteDocument,
    claudeApiKey,
    loadQuizzes,
    setIsProcessing
  } = useStore()

  useEffect(() => {
    loadQuizzes()
  }, [selectedProject])

  const handleAutoAnswer = async (quiz) => {
    if (!claudeApiKey) {
      alert('Configure a API key do Claude')
      return
    }

    try {
      setIsAnswering(quiz.id)
      setIsProcessing(true)

      // Encontrar instruções relacionadas
      const courseContent = documents
        .filter(d => d.type === 'instruction')
        .map(d => d.content)
        .join('\n\n---\n\n')

      // Extrair perguntas do quiz
      const questions = parseQuizContent(quiz.content)

      // Obter respostas com Claude
      const result = await claudeService.answerQuiz(questions, courseContent, claudeApiKey)

      // Salvar respostas
      if (result.answers && result.answers.length > 0) {
        const answersMap = {}
        result.answers.forEach(answer => {
          answersMap[answer.questionIndex] = {
            answer: answer.answer,
            explanation: answer.explanation
          }
        })
        await updateQuizAnswers(quiz.id, answersMap)
        await loadQuizzes()
      }
    } catch (error) {
      console.error('Error answering quiz:', error)
      alert('Erro ao responder o quiz')
    } finally {
      setIsAnswering(null)
      setIsProcessing(false)
    }
  }

  const parseQuizContent = (content) => {
    // Simples parsing de perguntas
    // Melhorado com análise mais robusta
    const lines = content.split('\n')
    const questions = []
    let currentQuestion = null

    lines.forEach(line => {
      if (/^\d+\.|^[A-Z]\)/.test(line.trim())) {
        if (currentQuestion) {
          questions.push(currentQuestion)
        }
        currentQuestion = {
          text: line.replace(/^\d+\.|^[A-Z]\)/, '').trim(),
          options: []
        }
      } else if (currentQuestion && /^[a-d]\)/.test(line.trim())) {
        currentQuestion.options.push(line.replace(/^[a-d]\)/, '').trim())
      }
    })

    if (currentQuestion) {
      questions.push(currentQuestion)
    }

    return questions
  }

  if (!selectedProject) {
    return (
      <div className="p-4 text-center text-gray-500 py-8">
        <p>Selecione um projeto primeiro</p>
      </div>
    )
  }

  // Filtrar documentos que são quizzes
  const quizDocuments = documents.filter(d => d.type === 'quiz')

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold mb-4">Quizzes Detectados</h2>

      {quizDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
          <p>Nenhum quiz detectado</p>
          <p className="text-sm mt-2">Adicione instruções que contenham quizzes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quizDocuments.map(doc => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandedQuiz(expandedQuiz === doc.id ? null : doc.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-gray-600">{doc.summary}</p>
                  </div>
                </div>
                {expandedQuiz === doc.id ? (
                  <ChevronUp size={20} className="text-primary" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {expandedQuiz === doc.id && (
                <div className="border-t p-4 space-y-4 bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
                      {doc.content}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAutoAnswer(doc)}
                      disabled={isAnswering === doc.id || !claudeApiKey}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                    >
                      {isAnswering === doc.id ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Respondendo...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Responder com IA
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition"
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {doc.isAnswered && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-700 mb-2">✅ Respondido</p>
                      <div className="text-sm space-y-1">
                        {Object.entries(doc.answers || {}).map(([qIdx, answer]) => (
                          <div key={qIdx} className="text-green-600">
                            Q{parseInt(qIdx) + 1}: {answer.answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
