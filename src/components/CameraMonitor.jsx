import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { claudeService } from '../services/claude'
import { X, Loader } from 'lucide-react'

export default function CameraMonitor() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastHash, setLastHash] = useState(null)
  const [detectionCount, setDetectionCount] = useState(0)

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Camera traseira (ou frontal em fallback)
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsActive(true)
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Permita acesso à câmera nas configurações do seu dispositivo')
      setIsActive(false)
    }
  }

  // Parar câmera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsActive(false)
    setDetectionCount(0)
  }

  // Capturar frame e analisar
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    try {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Desenhar vídeo no canvas
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)

      // Converter para base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

      // Calcular hash para evitar duplicatas
      const currentHash = imageBase64.substring(0, 50)
      if (currentHash === lastHash) {
        return // Mesma imagem que antes
      }

      setLastHash(currentHash)
      setIsProcessing(true)
      setAppProcessing(true)

      // Analisar imagem
      if (claudeApiKey) {
        const analysis = await claudeService.analyzeImage(imageBase64, claudeApiKey)

        // Se detectou conteúdo válido
        if (analysis.text && (analysis.type === 'quiz' || analysis.type === 'instruction')) {
          // Adicionar ao projeto
          await addDocument({
            title: analysis.summary?.substring(0, 50) || `${analysis.type.toUpperCase()} Detectado`,
            content: analysis.text,
            type: analysis.type,
            summary: analysis.summary,
            confidence: 0.95
          })

          await loadDocuments()

          setDetectionCount(prev => prev + 1)

          // Notificar usuário
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Conteúdo Detectado! 🎯', {
              body: `${analysis.type === 'quiz' ? 'Quiz' : 'Instrução'} adicionado ao projeto`,
              icon: analysis.type === 'quiz' ? '📝' : '📖'
            })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao analisar frame:', error)
    } finally {
      setIsProcessing(false)
      setAppProcessing(false)
    }
  }

  // Monitoramento contínuo
  useEffect(() => {
    if (!isActive || !selectedProject || !claudeApiKey) return

    // Monitorar a cada 3 segundos
    const interval = setInterval(captureAndAnalyze, 3000)
    return () => clearInterval(interval)
  }, [isActive, selectedProject, claudeApiKey, lastHash, isProcessing])

  // Pedir permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!selectedProject) return null

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {isActive ? (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-primary">
          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-48 h-48 object-cover bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Status */}
          <div className="p-2 bg-gray-50 border-t">
            <div className="text-xs text-center">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-1 text-orange-600">
                  <Loader size={12} className="animate-spin" />
                  Analisando...
                </div>
              ) : (
                <span className="text-green-600 font-semibold">🔴 Ao vivo</span>
              )}
            </div>
            <div className="text-xs text-gray-600 text-center mt-1">
              {detectionCount} detectado{detectionCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={stopCamera}
            className="w-full p-2 bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1 text-xs font-medium"
          >
            <X size={14} />
            Parar
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
