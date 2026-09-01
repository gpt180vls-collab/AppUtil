// Serviço de armazenamento local com IndexedDB e fallback localStorage

const DB_NAME = 'CursoAI'
const DB_VERSION = 1

let db = null

const initDB = async () => {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = event.target.result
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('quizzes')) {
        db.createObjectStore('quizzes', { keyPath: 'id' })
      }
    }
  })
}

const getAll = async (storeName) => {
  await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

const add = async (storeName, data) => {
  await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(data)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(data)
  })
}

const put = async (storeName, data) => {
  await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(data)
  })
}

const delete_ = async (storeName, id) => {
  await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export const storage = {
  // Projetos
  getProjects: async () => {
    const projects = await getAll('projects')
    return projects.sort((a, b) => b.createdAt - a.createdAt)
  },

  addProject: async (name) => {
    const project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      documents: [],
      quizzes: []
    }
    try {
      await put('projects', project)
    } catch (error) {
      console.error('Error adding project:', error)
    }
    return project
  },

  deleteProject: async (id) => {
    await delete_('projects', id)
  },

  // Documentos
  getDocuments: async (projectId) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)
    return project?.documents || []
  },

  addDocument: async (projectId, document) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)

    if (project) {
      const doc = {
        id: Date.now().toString(),
        ...document,
        type: 'instruction', // ou 'quiz'
        createdAt: Date.now(),
        projectId
      }
      project.documents = project.documents || []
      project.documents.push(doc)
      await put('projects', project)
      return doc
    }
  },

  deleteDocument: async (projectId, docId) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)

    if (project) {
      project.documents = (project.documents || []).filter(d => d.id !== docId)
      await put('projects', project)
    }
  },

  // Quizzes
  getQuizzes: async (projectId) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)
    return project?.quizzes || []
  },

  addQuiz: async (projectId, quiz) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)

    if (project) {
      const q = {
        id: Date.now().toString(),
        ...quiz,
        type: 'quiz',
        createdAt: Date.now(),
        projectId,
        answers: {},
        isAnswered: false
      }
      project.quizzes = project.quizzes || []
      project.quizzes.push(q)
      await put('projects', project)
      return q
    }
  },

  updateQuizAnswers: async (projectId, quizId, answers) => {
    const projects = await getAll('projects')
    const project = projects.find(p => p.id === projectId)

    if (project) {
      const quiz = (project.quizzes || []).find(q => q.id === quizId)
      if (quiz) {
        quiz.answers = answers
        quiz.isAnswered = true
        quiz.answeredAt = Date.now()
        await put('projects', project)
      }
    }
  }
}
