import { applications } from './app-api'

// Экспортируем функции для работы с заявлениями
export const getAll = async () => {
  return await applications.getAll()
}

export const getById = async (id) => {
  return await applications.getById(id)
}

export const create = async (applicationData) => {
  // Устанавливаем форму обучения "очная" по умолчанию, если она не указана
  const dataWithDefaults = {
    ...applicationData,
    study_form: applicationData.study_form || 'full-time'
  }
  
  return await applications.create(dataWithDefaults)
}

export const update = async (id, applicationData) => {
  return await applications.update(id, applicationData)
}

export const submit = async (id) => {
  return await applications.submit(id)
}

export const submitWithFiles = async (applicationData, files, options) => {
  return await applications.submitWithFiles(applicationData, files, options)
}

export const getStatistics = async () => {
  return await applications.getStatistics()
}

export default {
  getAll,
  getById,
  create,
  update,
  submit,
  submitWithFiles,
  getStatistics
} 