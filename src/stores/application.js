import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { applications, documents, directions } from '../api/supabase'

export const useApplicationStore = defineStore('application', () => {
  // Состояние
  const userApplications = ref([])
  const currentApplication = ref(null)
  const applicationDocuments = ref([])
  const allDirections = ref([])
  const documentTypes = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Геттеры
  const hasApplications = computed(() => userApplications.value.length > 0)
  const applicationById = computed(() => (id) => 
    userApplications.value.find(app => app.id === id)
  )

  // Загрузить все заявки текущего пользователя
  async function loadUserApplications() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await applications.getAll()
      
      if (loadError) throw loadError
      
      userApplications.value = data || []
      return true
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err)
      error.value = err.message || 'Не удалось загрузить заявки'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить одну заявку по ID
  async function loadApplication(id) {
    isLoading.value = true
    error.value = null
    currentApplication.value = null

    try {
      const { data, error: loadError } = await applications.getById(id)
      
      if (loadError) throw loadError
      
      currentApplication.value = data
      // Если в заявке есть документы, заполняем массив applicationDocuments
      if (data?.documents) {
        applicationDocuments.value = data.documents
      }
      return true
    } catch (err) {
      console.error('Ошибка загрузки заявки:', err)
      error.value = err.message || 'Не удалось загрузить заявку'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Создать новую заявку
  async function createApplication(applicationData) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: createError } = await applications.create(applicationData)
      
      if (createError) throw createError
      
      if (data) {
        userApplications.value.unshift(data)
        currentApplication.value = data
      }
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка создания заявки:', err)
      error.value = err.message || 'Не удалось создать заявку'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Обновить заявку
  async function updateApplication(id, applicationData) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await applications.update(id, applicationData)
      
      if (updateError) throw updateError
      
      if (data) {
        // Обновляем в списке заявок
        const index = userApplications.value.findIndex(app => app.id === id)
        if (index !== -1) {
          userApplications.value[index] = data
        }
        
        // Обновляем текущую заявку если она загружена
        if (currentApplication.value && currentApplication.value.id === id) {
          currentApplication.value = data
        }
      }
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка обновления заявки:', err)
      error.value = err.message || 'Не удалось обновить заявку'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Отправить заявку на рассмотрение
  async function submitApplication(id) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: submitError } = await applications.submit(id)
      
      if (submitError) throw submitError
      
      if (data) {
        // Обновляем в списке заявок
        const index = userApplications.value.findIndex(app => app.id === id)
        if (index !== -1) {
          userApplications.value[index] = data
        }
        
        // Обновляем текущую заявку если она загружена
        if (currentApplication.value && currentApplication.value.id === id) {
          currentApplication.value = data
        }
      }
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка отправки заявки:', err)
      error.value = err.message || 'Не удалось отправить заявку'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить все направления обучения
  async function loadDirections() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await directions.getAll()
      
      if (loadError) throw loadError
      
      allDirections.value = data || []
      return true
    } catch (err) {
      console.error('Ошибка загрузки направлений:', err)
      error.value = err.message || 'Не удалось загрузить направления'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить документы по ID заявки
  async function loadDocuments(applicationId) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await documents.getByApplicationId(applicationId)
      
      if (loadError) throw loadError
      
      applicationDocuments.value = data || []
      return true
    } catch (err) {
      console.error('Ошибка загрузки документов:', err)
      error.value = err.message || 'Не удалось загрузить документы'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить типы документов
  async function loadDocumentTypes() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await documents.getTypes()
      
      if (loadError) throw loadError
      
      documentTypes.value = data || []
      return true
    } catch (err) {
      console.error('Ошибка загрузки типов документов:', err)
      error.value = err.message || 'Не удалось загрузить типы документов'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить новый документ
  async function uploadDocument(applicationId, documentTypeId, file) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: uploadError, publicUrl } = await documents.upload(
        applicationId, 
        documentTypeId, 
        file
      )
      
      if (uploadError) throw uploadError
      
      if (data) {
        // Добавляем документ в список если он уже загружен
        applicationDocuments.value.push({
          ...data,
          document_type: documentTypes.value.find(type => type.id === documentTypeId),
          publicUrl
        })
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка загрузки документа:', err)
      error.value = err.message || 'Не удалось загрузить документ'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    userApplications,
    currentApplication,
    applicationDocuments,
    allDirections,
    documentTypes,
    isLoading,
    error,
    hasApplications,
    applicationById,
    loadUserApplications,
    loadApplication,
    createApplication,
    updateApplication,
    submitApplication,
    loadDirections,
    loadDocuments,
    loadDocumentTypes,
    uploadDocument
  }
}) 