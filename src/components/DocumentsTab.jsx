import { useState, useRef } from 'react'
import { useStore } from '../store'
import { Plus, Camera, FileUp, Trash2, Loader } from 'lucide-react'
import { claudeService } from '../services/claude'

export default function DocumentsTab() {
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const {
    documents,
    selectedProject,
    addDocument,
    deleteDocument,
    claudeApiKey,
    loadDocuments,
    setIsProcessing,
    isProcessing
  } = useStore()

  const handleAddDocument = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      alert('Preencha o conteúdo')
      return
    }

    try {
      setIsLoading(true)
      setIsProcessing(true)

      let analysis = {
        type: 'instruction',
        summary: content.substring(0, 60),
        confidence: 0.8
      }

      // Se tiver API key, analisar com Claude
      if (claudeApiKey) {
        analysis = await claudeService.analyzeContent(content, claudeApiKey)
      }

      // Adicionar documento ao projeto
      await addDocument({
        title: analysis.summary?.substring(0, 50) || 'Sem título',
        content,
        type: analysis.type,
        summary: analysis.summary,
        confidence: analysis.confidence
      })

      setContent('')
      setShowForm(false)
      await loadDocuments()
    } catch (error) {
      console.error('Error adding document:', error)
      alert('Erro ao processar o documento')
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsLoading(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
          const base64 = event.target?.result?.split(',')[1]
          if (base64 && claudeApiKey) {
            const analysis = await claudeService.analyzeImage(base64, claudeApiKey)
            setContent(analysis.text || '')
            setShowForm(true)
          }
        }
        reader.readAsDataURL(file)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsLoading(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
          const fileContent = event.target?.result || ''

          // Se é PDF ou arquivo binário, processar com Claude
          if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            if (claudeApiKey) {
              // Enviar para Claude processar o PDF
              const base64Content = fileContent.split(',')[1] || fileContent
              const analysis = await claudeService.analyzeImage(base64Content, claudeApiKey)
              setContent(analysis.text || '')
            } else {
              alert('Configure a API key do Claude para processar PDFs')
              return
            }
          } else {
            // Para arquivos de texto, usar diretamente
            setContent(fileContent)
          }
          setShowForm(true)
        }

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          reader.readAsDataURL(file)
        } else {
          reader.readAsText(file)
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!selectedProject) {
    return (
      <div className="p-4 text-center text-gray-500 py-8">
        <p>Selecione um projeto primeiro</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Instruções do Projeto</h2>

        {!showForm && (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-blue-600 transition"
              disabled={isProcessing}
            >
              <Plus size={24} />
              <span className="text-sm">Novo</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="bg-green-500 text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-green-600 transition disabled:opacity-50"
              disabled={isProcessing || !claudeApiKey}
              title={!claudeApiKey ? 'Configure a API key do Claude' : ''}
            >
              <Camera size={24} />
              <span className="text-sm">Câmera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-orange-500 text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-orange-600 transition"
              disabled={isLoading}
              title="Fazer upload de arquivo (PDF, DOCX, TXT, MD)"
            >
              <FileUp size={24} />
              <span className="text-sm">Arquivo</span>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAddDocument} className="space-y-4 mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cole o conteúdo da instrução ou quiz aqui..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={6}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setContent('')
                }}
                disabled={isLoading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma instrução ainda</p>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{doc.summary}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.type === 'quiz'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {doc.type === 'quiz' ? '📝 Quiz' : '📖 Instrução'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confiança: {(doc.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition ml-2"
                  title="Deletar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
