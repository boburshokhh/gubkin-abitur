import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as applicationsApi from '../api/applications'
import * as documentsApi from '../api/documents'
import { excelExport, appApi } from '../api/app-api'
import { levels as levelsApi, directions as directionsApi, profiles as profilesApi } from '../api/education'

export const useApplicationStore = defineStore('application', () => {
  // Состояние
  const userApplications = ref([])
  const currentApplication = ref(null)
  const applicationDocuments = ref([])
  const educationLevels = ref([])
  const allDirections = ref([])
  const allProfiles = ref([])
  const documentTypes = ref([])
  const regions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Геттеры
  const hasApplications = computed(() => userApplications.value.length > 0)
  const applicationById = computed(() => (id) => 
    userApplications.value.find(app => app.id === id)
  )

  // Геттер для получения иерархии программ для выбора
  const programsForSelection = computed(() => {
    return educationLevels.value.map(level => ({
      id: level.id,
      name: level.name,
      directions: allDirections.value
        .filter(dir => dir.level_id === level.id)
        .map(dir => ({
          id: dir.id,
          name: `${dir.name} (${dir.code})`,
          profiles: allProfiles.value
            .filter(prof => prof.direction_id === dir.id)
            .map(prof => ({
              id: prof.id,
              name: prof.name,
            }))
        }))
    }));
  });

  // Загрузить все заявки текущего пользователя
  async function loadUserApplications() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await applicationsApi.getAll()
      
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

  // Получить статистику по заявкам
  async function getApplicationsStatistics() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: statsError } = await applicationsApi.getStatistics()
      
      if (statsError) throw statsError
      
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка получения статистики:', err)
      error.value = err.message || 'Не удалось получить статистику заявок'
      return { success: false, error: error.value }
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
      const { data, error: loadError } = await applicationsApi.getById(id)
      
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
      // Убедимся, что для формы обучения установлено значение по умолчанию
      const applicationWithDefaults = {
        ...applicationData,
        study_form: applicationData.study_form || 'full-time' // Устанавливаем 'full-time' если значение не задано
      }

      const createResult = await applicationsApi.create(applicationWithDefaults)
      const { data, error: createError } = createResult
      
      if (createError) {
        const appError = new Error(createError)
        appError.code = createResult.code
        appError.status = createResult.status
        appError.applicationId = createResult.applicationId
        throw appError
      }
      
      if (data) {
        userApplications.value.unshift(data)
        currentApplication.value = data
      }
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка создания заявки:', err)
      error.value = err.message || 'Не удалось создать заявку'
      return {
        success: false,
        error: error.value,
        code: err.code,
        status: err.status,
        applicationId: err.applicationId
      }
    } finally {
      isLoading.value = false
    }
  }

  // Обновить заявку
  async function updateApplication(id, applicationData) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await applicationsApi.update(id, applicationData)
      
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

  // Атомарная подача заявления с файлами (основной метод)
  async function submitApplicationWithFiles(applicationData, files) {
    isLoading.value = true
    error.value = null

    try {
      const result = await applicationsApi.submitWithFiles(applicationData, files)
      const { data, error: submitError } = result

      if (submitError) {
        const err = new Error(submitError)
        err.code = result.code
        err.status = result.status
        err.applicationId = result.applicationId
        throw err
      }

      return { success: true, data }
    } catch (err) {
      console.error('Ошибка подачи заявки:', err)
      error.value = err.message || 'Не удалось подать заявку'
      return {
        success: false,
        error: error.value,
        code: err.code,
        status: err.status,
        applicationId: err.applicationId
      }
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить все образовательные данные (уровни, направления, профили)
  async function loadEducationData() {
    if (educationLevels.value.length > 0) return; // Не перезагружаем, если уже есть

    isLoading.value = true;
    error.value = null;
    try {
      const [levelsRes, directionsRes, profilesRes] = await Promise.all([
        levelsApi.getAll(),
        directionsApi.getAll(),
        profilesApi.getAllWithDetails()
      ]);

      if (levelsRes.error) throw levelsRes.error;
      educationLevels.value = levelsRes.data || [];

      if (directionsRes.error) throw directionsRes.error;
      allDirections.value = directionsRes.data || [];

      if (profilesRes.error) throw profilesRes.error;
      allProfiles.value = profilesRes.data || [];

    } catch (err) {
      error.value = err.message || 'Не удалось загрузить образовательные программы';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  // Загрузить документы по ID заявки
  async function loadDocuments(applicationId) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: loadError } = await documentsApi.getByApplicationId(applicationId)
      
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
      const { data, error: loadError } = await documentsApi.getTypes()
      
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
      const { data, error: uploadError, publicUrl } = await documentsApi.upload(
        applicationId, 
        documentTypeId, 
        file
      )
      
      if (uploadError) throw uploadError
      
      // Если успешно, добавляем документ в список
      if (data) {
        // Добавляем publicUrl к документу для удобства
        data.publicUrl = publicUrl
        applicationDocuments.value.push(data)
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
  
  // Загрузить регионы
  async function loadRegions() {
    isLoading.value = true
    error.value = null
    
    try {
      // Предполагаем, что в appApi.js есть соответствующий метод
      const { data, error: loadError } = await appApi
        .from('regions')
        .select('*')
        .order('name')
      
      if (loadError) throw loadError
      
      regions.value = data || []
      return true
    } catch (err) {
      console.error('Ошибка загрузки регионов:', err)
      error.value = err.message || 'Не удалось загрузить регионы'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Экспорт всех абитуриентов в Excel
  async function exportAllApplicantsToExcel() {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await excelExport.getAllApplicantsData()
      
      if (!result.success) {
        throw new Error(result.error || 'Не удалось получить данные для экспорта')
      }
      
      await excelExport.downloadExcel(result.data, 'all-applicants.xlsx')
      return { success: true }
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err)
      error.value = err.message || 'Не удалось экспортировать данные'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  // Экспорт данных одного абитуриента в Excel
  async function exportApplicantToExcel(userId) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await excelExport.getApplicantDataById(userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Не удалось получить данные для экспорта')
      }
      
      await excelExport.downloadExcel(result.data, `applicant-${userId}.xlsx`)
      return { success: true }
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err)
      error.value = err.message || 'Не удалось экспортировать данные'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  // Экспорт данных заявления в Excel
  async function exportApplicationToExcel(applicationId) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await excelExport.getApplicantDataByApplicationId(applicationId)
      
      if (!result.success) {
        throw new Error(result.error || 'Не удалось получить данные для экспорта')
      }
      
      await excelExport.downloadExcel(result.data, `application-${applicationId}.xlsx`)
      return { success: true }
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err)
      error.value = err.message || 'Не удалось экспортировать данные'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  
  // Создать запись о сертификате олимпиады
  async function createOlympiadCertificate(certificateData) {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: certError } = await appApi
        .from('olympiad_certificates')
        .insert(certificateData)
        .select()
      
      if (certError) throw certError
      
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка создания записи о сертификате:', err)
      error.value = err.message || 'Не удалось создать запись о сертификате'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Состояние
    userApplications,
    currentApplication,
    applicationDocuments,
    educationLevels,
    allDirections,
    allProfiles,
    documentTypes,
    regions,
    isLoading,
    error,

    // Геттеры
    hasApplications,
    applicationById,
    programsForSelection,

    // Действия
    loadUserApplications,
    getApplicationsStatistics,
    loadApplication,
    createApplication,
    updateApplication,
    submitApplicationWithFiles,
    loadEducationData,
    loadDocuments,
    loadDocumentTypes,
    uploadDocument,
    loadRegions,
    exportAllApplicantsToExcel,
    exportApplicantToExcel,
    exportApplicationToExcel,
    createOlympiadCertificate,
  }
}) 