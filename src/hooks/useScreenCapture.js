import { useEffect } from 'react'
import html2canvas from 'html2canvas'

export const useScreenCapture = (onCapture) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Capturar Volume (+) ou Enter como trigger (pau de selfie Bluetooth)
      if (event.key === 'VolumeUp' || event.key === '+' || event.keyCode === 13) {
        event.preventDefault()
        captureScreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCapture])

  const captureScreen = async () => {
    try {
      // Capturar o elemento main (conteúdo principal)
      const mainElement = document.querySelector('main') || document.body

      const canvas = await html2canvas(mainElement, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: true
      })

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      const imageBase64 = dataUrl.split(',')[1]

      if (onCapture && imageBase64) {
        onCapture(imageBase64)
        console.log('✓ Tela capturada via pau de selfie Bluetooth')
      }
    } catch (error) {
      console.error('Erro ao capturar tela:', error)
      alert(`Erro ao capturar tela: ${error.message}`)
    }
  }

  return { captureScreen }
}
