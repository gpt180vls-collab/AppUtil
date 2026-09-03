import { useEffect } from 'react'
import { useStore } from '../store'
import { Loader, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'

export default function ChatTab() {
  const { chatMessages, selectedProject, loadChatMessages } = useStore()

  useEffect(() => {
    loadChatMessages()
  }, [selectedProject])

  if (!selectedProject) {
    return (
      <div className="p-4 text-center text-gray-500 py-8">
        <p>Selecione um projeto primeiro</p>
      </div>
    )
  }

  const sorted = [...chatMessages].sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold mb-4">Chat de Capturas</h2>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>Nenhuma captura ainda</p>
          <p className="text-sm mt-2">Abra a câmera e use o botão "Capturar" para adicionar conteúdo aqui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(msg => (
            <div key={msg.id} className="space-y-2">
              {/* Foto capturada */}
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-primary text-white rounded-lg rounded-tr-none p-2">
                  <img src={msg.image} alt="Captura" className="rounded max-h-48 w-full object-cover" />
                  <p className="text-xs opacity-75 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Resposta do Claude */}
              <div className="flex justify-start">
                <div className="max-w-[75%] bg-white border border-gray-200 rounded-lg rounded-tl-none p-3">
                  {msg.status === 'processing' && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader size={16} className="animate-spin" />
                      Analisando com Claude...
                    </div>
                  )}

                  {msg.status === 'error' && (
                    <div className="flex items-start gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{msg.error || 'Erro ao processar a captura'}</span>
                    </div>
                  )}

                  {msg.status === 'done' && msg.resultType === 'instruction' && (
                    <div>
                      <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold mb-1">
                        <CheckCircle size={16} />
                        📖 Instrução salva
                      </div>
                      <p className="text-sm text-gray-700">{msg.summary}</p>
                    </div>
                  )}

                  {msg.status === 'done' && msg.resultType === 'quiz' && (
                    <div>
                      <div className="flex items-center gap-2 text-orange-700 text-sm font-semibold mb-1">
                        📝 Pergunta detectada
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{msg.summary}</p>
                      {msg.answer ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <p className="text-sm font-semibold text-green-700">💡 Resposta: {msg.answer}</p>
                          {msg.explanation && (
                            <p className="text-xs text-green-600 mt-1">{msg.explanation}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Não foi possível responder automaticamente (adicione instruções ao projeto para dar contexto)</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
