import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { claudeService } from '../services/claude'
import { X, Loader, Maximize2, Minimize2, Camera } from 'lucide-react'

export default function CameraMonitor() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendingStream, setPendingStream] = useState(null)

  const {
    selectedProject,
    claudeApiKey,
    documents,
    addDocument,
    loadDocuments,
    addChatMessage,
    updateChatMessage,
    setCurrentTab,
    setIsProcessing: setAppProcessing
  } = useStore()

  // Iniciar câmera
  const startCamera = async () => {
    try {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        })
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      // Guardar stream em estado e setar isActive
      // O useEffect vai conectar ao ref quando estiver pronto
      setPendingStream(stream)
      setIsActive(true)
      console.log('Stream obtido, aguardando conexão ao ref')
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert(`Erro ao acessar câmera:\n\n${error.name}: ${error.message}\n\nPermita acesso nas configurações do seu navegador/dispositivo.`)
      setIsActive(false)
    }
  }

  // useEffect para conectar stream ao ref quando estiver pronto
  useEffect(() => {
    if (pendingStream && videoRef.current && isActive) {
      try {
        videoRef.current.srcObject = pendingStream
        console.log('Stream conectado ao ref com sucesso')
        setPendingStream(null)
      } catch (error) {
        console.error('Erro ao conectar stream:', error)
        alert(`Erro ao iniciar câmera: ${error.message}`)
        setIsActive(false)
      }
    }
  }, [pendingStream, isActive])

  // Listener para pau de selfie Bluetooth (simula Volume+ ou Enter)
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event) => {
      // Pau de selfie Bluetooth simula Volume+ (VolumeUp), Enter, ou Space
      if (event.key === 'VolumeUp' || event.key === '+' || event.keyCode === 13 || event.keyCode === 32 || event.key === ' ') {
        event.preventDefault()
        captureFrameFromCamera()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, isProcessing, claudeApiKey, selectedProject, documents])

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsActive(false)
  }

  const captureFrameFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current || !claudeApiKey || !selectedProject || isProcessing) {
      const missing = []
      if (!videoRef.current) missing.push('vídeo')
      if (!canvasRef.current) missing.push('canvas')
      if (!claudeApiKey) missing.push('API key')
      if (!selectedProject) missing.push('projeto')
      if (missing.length > 0) {
        alert(`❌ Faltam: ${missing.join(', ')}`)
      }
      return
    }

    let chatMsg = null

    try {
      setIsProcessing(true)
      setAppProcessing(true)

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      if (!context) {
        alert('❌ Erro: canvas context não disponível')
        return
      }

      context.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const imageBase64 = dataUrl.split(',')[1]

      if (!imageBase64) {
        alert('❌ Erro: não conseguiu converter para base64')
        return
      }

      // Adiciona a captura no chat imediatamente (estado "processando")
      chatMsg = await addChatMessage({
        image: dataUrl,
        status: 'processing'
      })

      // Analisar com Claude
      const analysis = await claudeService.analyzeImage(imageBase64, claudeApiKey)

      if (!analysis.text || analysis.text.length <= 20) {
        await updateChatMessage(chatMsg.id, {
          status: 'error',
          error: 'Não foi possível identificar conteúdo na imagem'
        })
        return
      }

      if (analysis.type === 'quiz') {
        // Salvar como quiz/pergunta
        await addDocument({
          title: analysis.summary?.substring(0, 50) || 'Pergunta capturada',
          content: analysis.text,
          type: 'quiz',
          summary: analysis.summary,
          confidence: analysis.confidence || 0.85
        })
        await loadDocuments()

        // Responder automaticamente usando as instruções já salvas como contexto
        const courseContent = documents
          .filter(d => d.type === 'instruction')
          .map(d => d.content)
          .join('\n\n---\n\n')

        const result = await claudeService.answerQuestion(analysis.text, courseContent, claudeApiKey)

        await updateChatMessage(chatMsg.id, {
          status: 'done',
          resultType: 'quiz',
          summary: analysis.summary,
          answer: result.answer,
          explanation: result.explanation
        })
      } else {
        // Salvar como instrução/conteúdo
        await addDocument({
          title: analysis.summary?.substring(0, 50) || 'Conteúdo capturado',
          content: analysis.text,
          type: analysis.type || 'instruction',
          summary: analysis.summary,
          confidence: analysis.confidence || 0.85
        })
        await loadDocuments()

        await updateChatMessage(chatMsg.id, {
          status: 'done',
          resultType: 'instruction',
          summary: analysis.summary
        })
      }

      // Notificação
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('✅ Captura processada!', {
            body: analysis.type === 'quiz' ? 'Pergunta respondida no chat' : 'Instrução salva',
            tag: 'content-detection'
          })
        }
      } catch (notifError) {
        console.log('Notificação não suportada')
      }
    } catch (error) {
      console.error('❌ Erro ao capturar frame:', error)
      if (chatMsg) {
        await updateChatMessage(chatMsg.id, { status: 'error', error: error.message })
      } else {
        alert(`❌ Erro: ${error.message}`)
      }
    } finally {
      setIsProcessing(false)
      setAppProcessing(false)
    }
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!selectedProject) return null

  return (
    <div className={`fixed ${isExpanded ? 'inset-4' : 'bottom-20 right-4'} z-40 transition-all`}>
      {isActive ? (
        <div className={`bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-primary flex flex-col ${isExpanded ? 'h-full' : ''}`}>
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full object-cover bg-black ${isExpanded ? 'h-96' : 'w-64 h-64'}`}
            />

            {/* Status Badge */}
            <div className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-1">
              <div className="flex items-center gap-1 text-white text-xs">
                <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                {isProcessing ? 'Analisando...' : 'Pronto'}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Dica */}
          <button
            onClick={() => setCurrentTab('chat')}
            className="bg-blue-50 border-b border-blue-200 p-2 text-xs text-blue-700 hover:bg-blue-100 transition text-left"
          >
            💬 Resultados aparecem na aba <strong>Chat</strong> — toque para ver
          </button>

          {/* Controls */}
          <div className="flex">
            <button
              onClick={captureFrameFromCamera}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-3 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition"
              title="Capturar frame (ou Volume no pau de selfie)"
            >
              {isProcessing ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
              Capturar
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              title={isExpanded ? 'Minimizar' : 'Expandir'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={stopCamera}
              className="px-3 py-3 bg-red-500 text-white hover:bg-red-600 transition"
              title="Parar câmera"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          disabled={!selectedProject || !claudeApiKey}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            selectedProject && claudeApiKey
              ? 'bg-primary text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
          title={!claudeApiKey ? 'Configure a API key do Claude' : 'Iniciar câmera'}
        >
          📷 Câmera
        </button>
      )}
    </div>
  )
}
