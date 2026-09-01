import { useState } from 'react'
import { useStore } from '../store'
import { Plus, Trash2, ChevronRight } from 'lucide-react'

export default function ProjectsTab() {
  const [newProjectName, setNewProjectName] = useState('')
  const { projects, addProject, deleteProject, selectedProject, loadProjects, setCurrentTab } = useStore()

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (newProjectName.trim()) {
      await addProject(newProjectName)
      setNewProjectName('')
    }
  }

  const handleSelectProject = (projectId) => {
    loadProjects()
    setCurrentTab('documents')
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Meus Projetos</h2>

        <form onSubmit={handleAddProject} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nome do novo projeto..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} />
            Criar
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum projeto criado. Crie um novo!</p>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedProject === project.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleSelectProject(project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {project.documents?.length || 0} instruções • {project.quizzes?.length || 0} quizzes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight size={20} className="text-primary" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition"
                    title="Deletar projeto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
