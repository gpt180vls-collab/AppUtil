import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { claudeService } from '../services/claude'
import { X, Loader, Maximize2, Minimize2 } from 'lucide-react'

export default function CameraMonitor() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastHash, setLastHash] = useState(null)
  const [detectionCount, setDetectionCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastCaptures, setLastCaptures] = useState([])
  const [lastDetection, setLastDetection] = useState(null)
  const [pendingStream, setPendingStream] = useState(null)

  const {
    selectedProject,
    claudeApiKey,
    addDocument,
    loadDocuments,
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

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsActive(false)
    setDetectionCount(0)
    setLastCaptures([])
    setLastDetection(null)
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    try {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      if (!context) return

      context.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      const imageBase64 = dataUrl.split(',')[1]

      if (!imageBase64) return

      const currentHash = imageBase64.substring(0, 100)
      if (currentHash === lastHash) return

      setLastHash(currentHash)
      setIsProcessing(true)
      setAppProcessing(true)

      // Adicionar ao histórico de capturas
      setLastCaptures(prev => [{
        image: dataUrl,
        timestamp: new Date().toLocaleTimeString(),
        type: 'captura'
      }, ...prev].slice(0, 5))

      if (claudeApiKey) {
        try {
          const analysis = await claudeService.analyzeImage(imageBase64, claudeApiKey)

          if (analysis.text && analysis.text.length > 20) {
            await addDocument({
              title: analysis.summary?.substring(0, 50) || 'Conteúdo Detectado',
              content: analysis.text,
              type: analysis.type || 'instruction',
              summary: analysis.summary,
              confidence: analysis.confidence || 0.85
            })

            await loadDocuments()
            setDetectionCount(prev => prev + 1)

            // Atualizar última detecção
            setLastDetection({
              type: analysis.type === 'quiz' ? '📝 PERGUNTA' : '📖 INSTRUÇÃO',
              summary: analysis.summary?.substring(0, 60) || 'Conteúdo detectado',
              confidence: Math.round((analysis.confidence || 0.85) * 100),
              time: new Date().toLocaleTimeString()
            })

            // Notificação
            try {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('✅ Conteúdo Detectado!', {
                  body: `${analysis.type === 'quiz' ? 'PERGUNTA' : 'INSTRUÇÃO'} adicionada ao projeto`,
                  tag: 'content-detection'
                })
              }
            } catch (notifError) {
              console.log('Notificação não suportada')
            }
          }
        } catch (analysisError) {
          console.error('Erro ao analisar com Claude:', analysisError)
        }
      }
    } catch (error) {
      console.error('Erro ao analisar frame:', error)
    } finally {
      setIsProcessing(false)
      setAppProcessing(false)
    }
  }

  useEffect(() => {
    if (!isActive || !selectedProject || !claudeApiKey) return

    const interval = setInterval(captureAndAnalyze, 3000)
    return () => clearInterval(interval)
  }, [isActive, selectedProject, claudeApiKey, lastHash, isProcessing])

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
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {isProcessing ? 'Analisando...' : 'Ao vivo'}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Última detecção */}
          {lastDetection && (
            <div className="bg-blue-50 border-b border-blue-200 p-2">
              <p className="text-xs font-bold text-blue-700">{lastDetection.type}</p>
              <p className="text-xs text-blue-600 line-clamp-1">{lastDetection.summary}</p>
              <p className="text-xs text-blue-500 mt-1">✓ {lastDetection.confidence}% • {lastDetection.time}</p>
            </div>
          )}

          {/* Histórico de capturas (expandido) */}
          {isExpanded && lastCaptures.length > 0 && (
            <div className="bg-gray-50 border-b border-gray-200 p-2 max-h-24 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-700 mb-1">Últimas capturas:</p>
              <div className="flex gap-2">
                {lastCaptures.map((capture, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <img src={capture.image} alt={`Captura ${idx}`} className="w-16 h-16 rounded object-cover border border-gray-300" />
                    <p className="text-xs text-gray-500 text-center mt-1">{capture.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="p-2 bg-gray-50 border-t">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700">
                <strong>{detectionCount}</strong> detectado{detectionCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary hover:text-blue-700 transition"
                title={isExpanded ? 'Minimizar' : 'Expandir'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={stopCamera}
            className="w-full p-2 bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1 text-xs font-medium transition"
          >
            <X size={14} />
            Parar Monitoramento
          </button>
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
          title={!claudeApiKey ? 'Configure a API key do Claude' : 'Iniciar monitoramento'}
        >
          📷 Monitorar
        </button>
      )}
    </div>
  )
}
