import { create } from 'zustand'
import { storage } from './services/storage'

export const useStore = create((set, get) => ({
  // Configurações
  claudeApiKey: localStorage.getItem('claudeApiKey') || '',
  setClaudeApiKey: (key) => {
    localStorage.setItem('claudeApiKey', key)
    set({ claudeApiKey: key })
  },

  // Projetos
  projects: [],
  selectedProject: null,
  loadProjects: async () => {
    const projects = await storage.getProjects()
    set({ projects })
    if (projects.length > 0 && !get().selectedProject) {
      set({ selectedProject: projects[0].id })
    }
  },
  addProject: async (name) => {
    const project = await storage.addProject(name)
    const projects = await storage.getProjects()
    set({ projects, selectedProject: project.id })
  },
  deleteProject: async (id) => {
    await storage.deleteProject(id)
    await get().loadProjects()
    set({ selectedProject: null })
  },

  // Documentos/Instruções
  documents: [],
  loadDocuments: async () => {
    const projectId = get().selectedProject
    if (!projectId) return
    const docs = await storage.getDocuments(projectId)
    set({ documents: docs })
  },
  addDocument: async (document) => {
    const projectId = get().selectedProject
    if (!projectId) return
    await storage.addDocument(projectId, document)
    await get().loadDocuments()
  },
  deleteDocument: async (docId) => {
    const projectId = get().selectedProject
    if (!projectId) return
    await storage.deleteDocument(projectId, docId)
    await get().loadDocuments()
  },

  // Quizzes
  quizzes: [],
  loadQuizzes: async () => {
    const projectId = get().selectedProject
    if (!projectId) return
    const quizzes = await storage.getQuizzes(projectId)
    set({ quizzes })
  },
  addQuiz: async (quiz) => {
    const projectId = get().selectedProject
    if (!projectId) return
    await storage.addQuiz(projectId, quiz)
    await get().loadQuizzes()
  },
  updateQuizAnswers: async (quizId, answers) => {
    const projectId = get().selectedProject
    if (!projectId) return
    await storage.updateQuizAnswers(projectId, quizId, answers)
    await get().loadQuizzes()
  },

  // UI State
  currentTab: 'projects',
  setCurrentTab: (tab) => set({ currentTab: tab }),

  // AI Processing
  isProcessing: false,
  setIsProcessing: (value) => set({ isProcessing: value })
}))
