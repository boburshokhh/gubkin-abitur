import { directions } from './supabase'

// Экспортируем функции для работы с направлениями обучения
export const getAll = async () => {
  return await directions.getAll()
}

export const getById = async (id) => {
  return await directions.getById(id)
}

export default {
  getAll,
  getById
} 