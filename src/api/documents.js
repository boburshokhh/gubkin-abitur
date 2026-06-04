import { documents } from './app-api'

// Экспортируем функции для работы с документами
export const getByApplicationId = async (applicationId) => {
  return await documents.getByApplicationId(applicationId)
}

export const upload = async (applicationId, documentTypeId, file) => {
  return await documents.upload(applicationId, documentTypeId, file)
}

export const getTypes = async () => {
  return await documents.getTypes()
}

export const update = async (documentId, documentData) => {
  return await documents.update(documentId, documentData)
}

export default {
  getByApplicationId,
  upload,
  getTypes,
  update
} 