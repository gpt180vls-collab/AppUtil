import { useState, useEffect } from 'react'
import { useStore, APP_VERSION } from '../store'
import { Save, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { claudeService } from '../services/claude'

export default function SettingsTab() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [apiStatus, setApiStatus] = useState(null)

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

  const handleTestApi = async () => {
    if (!apiKey.trim()) {
      setApiStatus({ success: false, message: 'Salve uma chave primeiro' })
      return
    }

    setTestingApi(true)
    setApiStatus(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-5',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: 'Responda com apenas "OK" se está funcionando.'
            }
          ]
        })
      })

      if (response.ok) {
        await response.json()
        setApiStatus({
          success: true,
          message: '✅ Sucesso! API Claude está funcionando corretamente.'
        })
      } else if (response.status === 401) {
        setApiStatus({
          success: false,
          message: '❌ Chave inválida ou expirada. Verifique em console.anthropic.com'
        })
      } else if (response.status === 429) {
        setApiStatus({
          success: false,
          message: '⏳ Limite de requisições atingido. Tente novamente em alguns minutos.'
        })
      } else if (response.status === 500) {
        setApiStatus({
          success: false,
          message: '❌ Erro no servidor da Anthropic. Tente novamente em poucos minutos.'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setApiStatus({
          success: false,
          message: `❌ Erro ${response.status}: ${errorData.error?.message || response.statusText}`
        })
      }
    } catch (error) {
      setApiStatus({
        success: false,
        message: `❌ Erro de conexão: ${error.message || 'Verifique sua internet e tente novamente'}`
      })
    } finally {
      setTestingApi(false)
    }
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

          <div className="flex gap-2">
            <button
              onClick={handleSaveApiKey}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:bg-blue-600'
              }`}
            >
              <Save size={18} />
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
            <button
              onClick={handleTestApi}
              disabled={testingApi || !apiKey.trim()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
              title="Testar conexão com Claude API"
            >
              {testingApi ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              Testar
            </button>
          </div>

          {apiStatus && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              apiStatus.success
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {apiStatus.message}
            </div>
          )}

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
              <strong>Versão:</strong> <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-mono font-bold">{APP_VERSION}</span>
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
