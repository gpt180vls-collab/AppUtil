import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Save, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function SettingsTab() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)

  const { claudeApiKey, setClaudeApiKey } = useStore()

  useEffect(() => {
    setApiKey(claudeApiKey)
    setMonitoringEnabled(localStorage.getItem('monitoringEnabled') === 'true')
  }, [claudeApiKey])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setClaudeApiKey(apiKey)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleToggleMonitoring = () => {
    const newState = !monitoringEnabled
    setMonitoringEnabled(newState)
    localStorage.setItem('monitoringEnabled', newState)
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold mb-6">Configurações</h2>

      <div className="space-y-6">
        {/* Claude API Key */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500" />
            Chave da API Claude
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            A chave é salva localmente no seu dispositivo e usada apenas para comunicação com Claude.
          </p>

          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              title={showKey ? 'Ocultar' : 'Mostrar'}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleSaveApiKey}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-blue-600'
            }`}
          >
            <Save size={18} />
            {saved ? 'Salvo!' : 'Salvar Chave'}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Obtenha uma chave em{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {/* Camera Monitoring */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📱 Monitoramento de Câmera
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Quando ativado, a câmera fica monitorando a tela continuamente e detecta automaticamente quizzes e instruções.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={monitoringEnabled}
              onChange={handleToggleMonitoring}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-sm font-medium">
              {monitoringEnabled ? '✓ Monitoramento Ativo' : '○ Monitoramento Desativado'}
            </span>
          </label>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <strong>Dica:</strong> O monitoramento funciona melhor com a câmera frontal ou traseira de seu dispositivo.
          </div>
        </div>

        {/* Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">ℹ️ Sobre</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Versão:</strong> 1.0.0
            </p>
            <p>
              <strong>Plataforma:</strong> Web Progressiva (iOS/Android)
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Desenvolvido com React, Zustand e Claude API
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">📊 Dados</h3>
          <p className="text-sm text-gray-600 mb-3">
            Todos os dados são armazenados localmente no seu dispositivo usando IndexedDB.
          </p>
          <button
            onClick={() => {
              if (confirm('Tem certeza? Todos os dados serão deletados.')) {
                indexedDB.deleteDatabase('CursoAI')
                localStorage.clear()
                window.location.reload()
              }
            }}
            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
          >
            🗑️ Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  )
}
