import { useEffect } from 'react'
import { useStore } from './store'
import { BookOpen, Settings, FileText, CheckCircle, Home, MessageSquare } from 'lucide-react'
import ProjectsTab from './components/ProjectsTab'
import DocumentsTab from './components/DocumentsTab'
import QuizzesTab from './components/QuizzesTab'
import SettingsTab from './components/SettingsTab'
import ChatTab from './components/ChatTab'
import CameraMonitor from './components/CameraMonitor'

export default function App() {
  const { currentTab, setCurrentTab, loadProjects, selectedProject } = useStore()

  useEffect(() => {
    loadProjects()
  }, [])

  const tabs = [
    { id: 'projects', label: 'Projetos', icon: Home, component: ProjectsTab },
    { id: 'chat', label: 'Chat', icon: MessageSquare, component: ChatTab },
    { id: 'documents', label: 'Instruções', icon: FileText, component: DocumentsTab },
    { id: 'quizzes', label: 'Quizzes', icon: CheckCircle, component: QuizzesTab },
    { id: 'settings', label: 'Configurações', icon: Settings, component: SettingsTab }
  ]

  const currentTabConfig = tabs.find(t => t.id === currentTab)
  const CurrentComponent = currentTabConfig?.component || ProjectsTab

  return (
    <div className="container-app">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Curso AI Assistant</h1>
        <p className="text-sm opacity-90">Gerenciador de cursos com IA</p>
      </header>

      <main className="content-area">
        {selectedProject || currentTab === 'projects' || currentTab === 'settings' ? (
          <CurrentComponent />
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>Crie ou selecione um projeto para começar</p>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
              title={tab.label}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <CameraMonitor />
    </div>
  )
}
