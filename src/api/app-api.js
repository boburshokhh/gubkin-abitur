import axios from 'axios'

// Инициализация Axios-клиента для работы с кастомным Express бэкендом
const apiUrl = import.meta.env.VITE_API_URL || '/api'
let accessToken = null
let isRefreshingSession = false

export const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем токен авторизации к каждому запросу, если он есть
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

apiClient.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config
  const isAuthRefresh = originalRequest?.url?.includes('/auth/refresh')
  const shouldRefresh = error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRefresh

  if (!shouldRefresh) return Promise.reject(error)

  originalRequest._retry = true
  const { data, error: refreshError } = await auth.refreshSession()
  if (refreshError || !data?.session?.access_token) {
    clearAuthStorage()
    return Promise.reject(error)
  }

  originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`
  return apiClient(originalRequest)
})

// Утилитарная функция для очистки всех данных сессии из localStorage
export const clearAuthStorage = () => {
  try {
    accessToken = null
    localStorage.removeItem('app-access-token')
    localStorage.removeItem('app-user')
    localStorage.removeItem('app.auth.token')
    localStorage.removeItem('app.auth.lastRefresh')
    localStorage.removeItem('auth-store')
    console.log('localStorage успешно очищен от данных сессии')
  } catch (error) {
    console.error('Ошибка очистки localStorage:', error)
  }
}

// Вспомогательный обработчик ошибок
const handleError = (err) => {
  console.error('API Error:', err)
  const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Произошла неизвестная ошибка'
  return { data: null, error: new Error(message) }
}

// 1. АУТЕНТИФИКАЦИЯ (Auth)
export const auth = {
  getSession: async () => {
    try {
      if (!accessToken) {
        const refreshResult = await auth.refreshSession()
        if (refreshResult.error) return { data: { session: null }, error: null }
        return refreshResult
      }

      const response = await apiClient.get('/auth/session')
      const { session, user } = response.data
      if (session) {
        session.user = user // Важно: добавляем user внутрь session, как в API
      }
      return { data: { session }, error: null }
    } catch (err) {
      clearAuthStorage()
      return { data: { session: null }, error: err.response?.data?.error ? new Error(err.response.data.error) : null }
    }
  },
  
  refreshSession: async () => {
    if (isRefreshingSession) return { data: { session: null }, error: null }

    try {
      isRefreshingSession = true
      const response = await apiClient.post('/auth/refresh')
      const { session, user } = response.data
      if (session?.access_token) accessToken = session.access_token
      if (session) session.user = user
      return { data: { session }, error: null }
    } catch (err) {
      clearAuthStorage()
      return { data: { session: null }, error: err.response?.data?.error ? new Error(err.response.data.error) : err }
    } finally {
      isRefreshingSession = false
    }
  },
  
  signUp: async ({ email, password, options }) => {
    try {
      const response = await apiClient.post('/auth/signup', { email, password, options })
      const { session, user } = response.data
      if (session?.access_token) {
        accessToken = session.access_token
        session.user = user
        triggerAuthChange('SIGNED_IN', session)
      }
      
      return { data: { session, user }, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  
  signIn: async ({ email, password }) => {
    try {
      const response = await apiClient.post('/auth/signin', { email, password })
      const { session, user } = response.data
      accessToken = session.access_token
      session.user = user
      
      triggerAuthChange('SIGNED_IN', session)
      
      return { data: { session, user }, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  
  signOut: async () => {
    try {
      await apiClient.post('/auth/signout')
    } catch (err) {
      console.warn('Ошибка при выходе на сервере:', err.message)
    } finally {
      clearAuthStorage()
      triggerAuthChange('SIGNED_OUT', null)
    }
    return { success: true }
  },

  sendEmailVerification: async (email) => {
    try {
      await apiClient.post('/auth/resend-verification', { email })
      return { error: null }
    } catch (err) {
      return { error: new Error(err.response?.data?.error || err.message) }
    }
  },
  
  sendOtpToEmail: async (email) => {
    try {
      await apiClient.post('/auth/resend-verification', { email })
      return { error: null }
    } catch (err) {
      return { error: new Error(err.response?.data?.error || err.message) }
    }
  },
  
  verifyOtp: async (email, token) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { email, token })
      const { session, user } = response.data
      if (session?.access_token) {
        accessToken = session.access_token
        session.user = user
        triggerAuthChange('SIGNED_IN', session)
      }
      return { data: { session, user }, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  resetPassword: async (email) => {
    try {
      await apiClient.post('/auth/password/forgot', { email })
      return { error: null }
    } catch (err) {
      return { error: new Error(err.response?.data?.error || err.message) }
    }
  },

  resetPasswordWithToken: async ({ token, password }) => {
    try {
      await apiClient.post('/auth/password/reset', { token, password })
      clearAuthStorage()
      return { error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      await apiClient.post('/auth/password/change', { currentPassword, newPassword })
      return { error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  validateInvitation: async (token) => {
    try {
      const response = await apiClient.get('/invitations/validate', { params: { token } })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  acceptInvitation: async (payload) => {
    try {
      const response = await apiClient.post('/invitations/accept', payload)
      const { session, user } = response.data
      if (session?.access_token) {
        accessToken = session.access_token
        session.user = user
        triggerAuthChange('SIGNED_IN', session)
      }
      return { data: { session, user }, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 2. РАБОТА С ПОЛЬЗОВАТЕЛЯМИ (Users)
export const users = {
  getProfile: async (userFromSession = null) => {
    try {
      const response = await apiClient.get('/users/profile')
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  updateProfile: async (profileData, userFromSession = null) => {
    try {
      const response = await apiClient.put('/users/profile', profileData)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  getUserRole: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/role`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  
  updateUserRole: async (userId, roleId) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role_id: roleId })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  
  getAllUsers: async (roleId = null, search = '', page = 1, pageSize = 20) => {
    try {
      const response = await apiClient.get('/users', {
        params: { roleId, search, page, pageSize }
      })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

export const invitations = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/invitations')
      return { data: response.data.data || [], error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  create: async ({ email, roleId }) => {
    try {
      const response = await apiClient.post('/invitations', { email, role_id: roleId })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  revoke: async (id) => {
    try {
      await apiClient.post(`/invitations/${id}/revoke`)
      return { error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 3. РАБОТА С ЗАЯВЛЕНИЯМИ (Applications)
export const applications = {
  async getAll({ page = 1, pageSize = 10, filters = {} } = {}) {
    try {
      const response = await apiClient.get('/applications', {
        params: { page, pageSize, filters: JSON.stringify(filters) }
      })
      
      const formattedData = (response.data.data || []).map(app => {
        if (app.status_name) {
          return {
            ...app,
            status: { name: app.status_name, id: app.status_id },
            user: { full_name: app.applicant_full_name, id: app.user_id, first_name: app.first_name, last_name: app.last_name },
            direction: { name: app.direction_name, code: app.direction_code, id: app.direction_id },
            profile: { name: app.profile_name, id: app.profile_id },
            application_choices: app.choices || []
          }
        }
        return app
      })

      return { data: formattedData, count: response.data.count || 0, error: null }
    } catch (err) {
      return { data: null, count: 0, error: err.response?.data?.error ? new Error(err.response.data.error) : err }
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/applications/${id}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getStatistics() {
    try {
      const response = await apiClient.get('/applications/statistics')
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async create(applicationData) {
    try {
      const response = await apiClient.post('/applications', { app_data: applicationData })
      return { data: response.data.data, error: null }
    } catch (err) {
      return { data: null, error: err.response?.data?.error || err.message }
    }
  },

  async update(id, applicationData) {
    try {
      const response = await apiClient.put(`/applications/${id}`, applicationData)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async submit(id) {
    try {
      const response = await apiClient.post(`/applications/${id}/submit`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getApplicationHistory(applicationId) {
    try {
      const response = await apiClient.get(`/applications/${applicationId}/history`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async updateStatus(applicationId, statusId, comment = '') {
    try {
      const response = await apiClient.put(`/applications/${applicationId}/status`, { statusId, comment })
      return { data: response.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getStatuses() {
    try {
      const response = await apiClient.get('/applications/statuses')
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 4. РАБОТА С ДОКУМЕНТАМИ (Documents)
export const documents = {
  async getTypes() {
    try {
      const response = await apiClient.get('/files/document-types')
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getByApplicationId(applicationId) {
    try {
      const response = await apiClient.get(`/files/documents/${applicationId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async upload(applicationId, documentTypeId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentTypeId', documentTypeId)

      const response = await apiClient.post(`/files/documents/${applicationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  
  async getSignedUrl(documentId, options = {}) {
    try {
      const response = await apiClient.get(`/files/signed-url/document/${documentId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async update(documentId, documentData) {
    try {
      const response = await apiClient.put(`/files/documents/${documentId}`, documentData)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 5. ФАЙЛЫ ЗАЯВЛЕНИЙ (Application Files)
export const applicationFiles = {
  async upload(applicationId, file, fileCategory = 'general', isImage = false) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileCategory', fileCategory)
      formData.append('isImage', isImage)

      const response = await apiClient.post(`/files/application-files/${applicationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getByApplicationId(applicationId) {
    try {
      const response = await apiClient.get(`/files/application-files/${applicationId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getSignedUrl(fileId, options = {}) {
    try {
      const response = await apiClient.get(`/files/signed-url/file/${fileId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 6. СЕРТИФИКАТЫ ОЛИМПИАД (Olympiad Certificates)
export const olympiadCertificates = {
  async upload(applicationId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/files/olympiad-certificates/${applicationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getByApplicationId(applicationId) {
    try {
      const response = await apiClient.get(`/files/olympiad-certificates/${applicationId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },

  async getSignedUrl(certificateId, options = {}) {
    try {
      const response = await apiClient.get(`/files/signed-url/certificate/${certificateId}`)
      return { data: response.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 7. ЭКСПОРТ EXCEL (Excel Export)
export const excelExport = {
  async getAllApplicantsData() {
    try {
      const response = await apiClient.get('/applications/excel/export')
      return { success: response.data.success, data: response.data.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message }
    }
  },
  
  async getApplicantDataById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`)
      return { success: true, data: response.data.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message }
    }
  },
  
  async getApplicantDataByApplicationId(applicationId) {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`)
      return { success: true, data: response.data.data }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message }
    }
  },
  
  async downloadExcel(data, fileName = 'applicants-data.xlsx') {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { success: false, error: 'Отсутствуют данные для экспорта' }
      }
      
      const ExcelJS = await import('exceljs').then(module => module.default)
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Абитуриенты')
      
      const headers = {
        user_id: 'ID пользователя',
        email: 'Email',
        first_name: 'Имя',
        last_name: 'Фамилия',
        middle_name: 'Отчество',
        phone: 'Телефон',
        birth_date: 'Дата рождения',
        gender: 'Пол',
        application_id: 'ID заявки',
        direction_code: 'Код направления',
        direction_name: 'Название направления',
        application_status: 'Статус заявки',
        passport_series: 'Серия и номер паспорта',
        passport_issue_date: 'Дата выдачи паспорта',
        passport_issued_by: 'Кем выдан паспорт',
        education_level: 'Уровень образования',
        education_institution: 'Учебное заведение',
        education_graduation_year: 'Год окончания',
        document_number: 'Номер документа об образовании',
        document_date: 'Дата выдачи документа',
        study_form: 'Форма обучения',
        funding_form: 'Форма финансирования',
        admin_comment: 'Комментарий администратора',
        application_created_at: 'Дата создания заявки',
        documents_count: 'Количество документов',
        doc_passport: 'Скан паспорта',
        doc_education: 'Скан документа об образовании'
      }
      
      const fields = Object.keys(data[0]).filter(f => headers[f])
      const headerRow = fields.map(field => headers[field] || field)
      worksheet.addRow(headerRow)
      
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }
      })
      
      data.forEach(record => {
        const rowData = fields.map(field => {
          const value = record[field]
          if (field.includes('date') && value) {
            return new Date(value).toLocaleDateString('ru-RU')
          }
          if (field === 'gender') {
            return value === 'male' ? 'Мужской' : value === 'female' ? 'Женский' : value
          }
          if (field === 'study_form') {
            return value === 'full-time' ? 'Очная' : value === 'part-time' ? 'Заочная' : value
          }
          if (field === 'funding_form') {
            return value === 'budget' ? 'Бюджет' : value === 'contract' ? 'Контракт' : value
          }
          return value
        })
        worksheet.addRow(rowData)
      })
      
      worksheet.columns.forEach(column => {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, cell => {
          const cellLength = cell.value ? cell.value.toString().length : 10
          if (cellLength > maxLength) maxLength = cellLength
        })
        column.width = Math.min(maxLength + 2, 50)
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err)
      return { success: false, error: err.message }
    }
  }
}

// 8. СТАТИСТИКА (Statistics)
export const statistics = {
  async getProgramStats() {
    try {
      const res = await apiClient.get('/public/stats/programs')
      return { data: res.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  async getDailyApplicationStats() {
    try {
      const res = await apiClient.get('/public/stats/daily')
      return { data: res.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  },
  async getGeneralStats() {
    try {
      const res = await apiClient.get('/public/stats/general')
      return { data: res.data.data, error: null }
    } catch (err) {
      return handleError(err)
    }
  }
}

// 9. ВСПРМОГАТЕЛЬНЫЕ ЛОГИ (Logs)
export const logs = {
  async logAdminAction(action, resourceId, resourceType, details) {
    console.log('Admin Action Logged:', { action, resourceId, resourceType, details })
    return { data: true, error: null }
  },
  async logApplicationChange(applicationId, statusId, comment = '') {
    console.log('Application Change Logged:', { applicationId, statusId, comment })
    return { data: true, error: null }
  }
}


// ==========================================
// 10. ГЕНИАЛЬНЫЙ IMITATION QUERY BUILDER ДЛЯ SUPABASE
// ==========================================

class ApiQueryBuilder {
  constructor(table) {
    this.table = table
    this.selectFields = '*'
    this.filters = {}
    this.sortField = null
    this.sortAscending = true
    this.limitCount = null
    this.offsetCount = null
    this.isSingle = false
    this.isMaybeSingle = false
    this.updateData = null
    this.insertData = null
    this.isDelete = false
  }

  select(fields) {
    this.selectFields = fields
    return this
  }

  eq(field, value) {
    this.filters[field] = value
    return this
  }

  in(field, values) {
    this.filters[field] = { operator: 'in', values }
    return this
  }

  order(field, options = {}) {
    this.sortField = field
    this.sortAscending = options.ascending !== false
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  offset(count) {
    this.offsetCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  insert(data) {
    this.insertData = data
    return this
  }

  update(data) {
    this.updateData = data
    return this
  }

  delete() {
    this.isDelete = true
    return this
  }

  async execute() {
    try {
      // ИМИТАЦИЯ ТАБЛИЦЫ: education_levels
      if (this.table === 'education_levels') {
        const res = await apiClient.get('/education/levels')
        return { data: res.data.data, error: null }
      }
      
      // ИМИТАЦИЯ ТАБЛИЦЫ: directions
      if (this.table === 'directions') {
        if (this.insertData) {
          const res = await apiClient.post('/education/directions', this.insertData)
          return { data: res.data.data, error: null }
        }
        if (this.updateData) {
          const id = this.filters.id
          const res = await apiClient.put(`/education/directions/${id}`, this.updateData)
          return { data: res.data.data, error: null }
        }
        if (this.isDelete) {
          const id = this.filters.id
          await apiClient.delete(`/education/directions/${id}`)
          return { error: null }
        }
        
        const levelId = this.filters.level_id
        const res = await apiClient.get('/education/directions', { params: { levelId } })
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: profiles
      if (this.table === 'profiles') {
        if (this.insertData) {
          const res = await apiClient.post('/education/profiles', this.insertData)
          return { data: res.data.data, error: null }
        }
        if (this.updateData) {
          const id = this.filters.id
          const res = await apiClient.put(`/education/profiles/${id}`, this.updateData)
          return { data: res.data.data, error: null }
        }
        if (this.isDelete) {
          const id = this.filters.id
          await apiClient.delete(`/education/profiles/${id}`)
          return { error: null }
        }

        const id = this.filters.id
        if (id) {
          const res = await apiClient.get(`/education/profiles/${id}`)
          return { data: res.data.data, error: null }
        }
        
        const directionId = this.filters.direction_id
        if (directionId) {
          const res = await apiClient.get('/education/profiles', { params: { directionId } })
          return { data: res.data.data, error: null }
        }
        
        const res = await apiClient.get('/education/profiles')
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: users
      if (this.table === 'users') {
        const id = this.filters.id
        if (id) {
          const res = await apiClient.get('/users/profile')
          return { data: res.data.data, error: null }
        }
        const res = await apiClient.get('/users')
        return { data: res.data.data.users, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: applications
      if (this.table === 'applications') {
        if (this.insertData) {
          const res = await apiClient.post('/applications', { app_data: this.insertData })
          return { data: res.data.data, error: null }
        }
        if (this.updateData) {
          const id = this.filters.id
          const res = await apiClient.put(`/applications/${id}`, this.updateData)
          return { data: res.data.data, error: null }
        }
        const id = this.filters.id
        if (id) {
          const res = await apiClient.get(`/applications/${id}`)
          return { data: res.data.data, error: null }
        }
        const res = await apiClient.get('/applications')
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: application_statuses
      if (this.table === 'application_statuses') {
        const res = await apiClient.get('/applications/statuses')
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: document_types
      if (this.table === 'document_types') {
        const res = await apiClient.get('/files/document-types')
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: documents
      if (this.table === 'documents') {
        const appId = this.filters.application_id
        if (appId) {
          const res = await apiClient.get(`/files/documents/${appId}`)
          return { data: res.data.data, error: null }
        }
        return { data: [], error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: application_files
      if (this.table === 'application_files') {
        const appId = this.filters.application_id
        if (appId) {
          const res = await apiClient.get(`/files/application-files/${appId}`)
          return { data: res.data.data, error: null }
        }
        return { data: [], error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: olympiad_certificates
      if (this.table === 'olympiad_certificates') {
        const appId = this.filters.application_id
        if (appId) {
          const res = await apiClient.get(`/files/olympiad-certificates/${appId}`)
          return { data: res.data.data, error: null }
        }
        return { data: [], error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: regions
      if (this.table === 'regions') {
        const res = await apiClient.get('/regions')
        return { data: res.data.data, error: null }
      }

      // ИМИТАЦИЯ ТАБЛИЦЫ: specialties (старая таблица, используем профили)
      if (this.table === 'specialties') {
        const profileId = this.filters.profile_id
        if (profileId) {
          // Специальности теперь отсутствуют, профиль - это конечная точка
          return { data: [], error: null }
        }
        return { data: [], error: null }
      }

      return { data: [], error: null }
    } catch (err) {
      return handleError(err)
    }
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected)
  }
}

// 11. ГЛАВНЫЙ ЭКСПОРТ API КЛИЕНТА
export const appApi = {
  auth: {
    signUp: async (params) => auth.signUp(params),
    signIn: async (params) => auth.signIn(params),
    signOut: async () => auth.signOut(),
    getSession: async () => auth.getSession(),
    refreshSession: async () => auth.refreshSession(),
    resend: async ({ email }) => auth.sendEmailVerification(email),
    signInWithOtp: async ({ email }) => auth.sendOtpToEmail(email),
    verifyOtp: async ({ email, token, token_hash }) => auth.verifyOtp(email, token || token_hash),
    resetPasswordForEmail: async (email) => auth.resetPassword(email),
    resetPasswordWithToken: async (params) => auth.resetPasswordWithToken(params),
    changePassword: async (params) => auth.changePassword(params),
    validateInvitation: async (token) => auth.validateInvitation(token),
    acceptInvitation: async (payload) => auth.acceptInvitation(payload),
    setSession: async ({ access_token }) => {
      accessToken = access_token
      return auth.getSession()
    },
    getUser: async () => {
      const sessionRes = await auth.getSession()
      return { data: { user: sessionRes.data?.session?.user || null }, error: sessionRes.error }
    },
    updateUser: async ({ data }) => {
      if (data?.password) {
        return auth.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.password
        })
      }

      const profileRes = await users.updateProfile(data)
      return { data: { user: profileRes.data }, error: profileRes.error }
    },
    onAuthStateChange: (callback) => {
      window.addEventListener('auth-state-change', (e) => {
        const { event, session } = e.detail
        callback(event, session)
      })
    }
  },
  
  from: (table) => {
    return new ApiQueryBuilder(table)
  },

  rpc: async (fnName, params) => {
    try {
      if (fnName === 'get_public_general_stats') {
        const res = await apiClient.get('/public/stats/general')
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_public_daily_stats') {
        const res = await apiClient.get('/public/stats/daily', { params })
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_public_regional_stats') {
        const res = await apiClient.get('/public/stats/regional')
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_public_program_stats') {
        const res = await apiClient.get('/public/stats/programs')
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_public_status_stats') {
        const res = await apiClient.get('/public/stats/statuses')
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_filtered_applications') {
        const res = await apiClient.get('/applications', {
          params: {
            page: params.p_page_number || 1,
            pageSize: params.p_page_size || 10,
            filters: JSON.stringify({
              statusId: params.p_status_id,
              levelId: params.p_level_id,
              directionId: params.p_direction_id,
              profileId: params.p_profile_id,
              searchQuery: params.p_search_query
            })
          }
        })
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_application_details') {
        const res = await apiClient.get(`/applications/${params.app_id}`)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_user_role') {
        const res = await apiClient.get(`/users/${params.p_user_id}/role`)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'update_user_role') {
        const res = await apiClient.put(`/users/${params.p_user_id}/role`, { role_id: params.p_role_id })
        return { data: res.data.data, error: null }
      }
      if (fnName === 'create_user_profile') {
        const res = await apiClient.put('/users/profile', params)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'create_application') {
        const res = await apiClient.post('/applications', { app_data: params.app_data })
        return { data: res.data.data, error: null }
      }
      if (fnName === 'add_application_comment') {
        const res = await apiClient.put(`/applications/${params.app_id}/status`, {
          statusId: params.new_status_id,
          comment: params.comment_text
        })
        return { data: res.data, error: null }
      }
      if (fnName === 'upload_document') {
        const res = await apiClient.post(`/files/documents/${params.p_application_id}`, params)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'upload_application_file') {
        const res = await apiClient.post(`/files/application-files/${params.p_application_id}`, params)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'upload_olympiad_certificate') {
        const res = await apiClient.post(`/files/olympiad-certificates/${params.p_application_id}`, params)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_application_documents') {
        const res = await apiClient.get(`/files/documents/${params.p_application_id}`)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_olympiad_certificate_signed_url') {
        const res = await apiClient.get(`/files/signed-url/certificate/${params.p_certificate_id}`)
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_all_applicants_data') {
        const res = await apiClient.get('/applications/excel/export')
        return { data: res.data.data, error: null }
      }
      if (fnName === 'get_compatible_profiles') {
        const res = await apiClient.get(`/applications/${params.p_application_id}/compatibles`, {
          params: {
            search: params.p_search,
            limit: params.p_limit,
            offset: params.p_offset
          }
        })
        // Функция rpc в appApi должна вернуть сырой массив совместимых профилей
        return { data: res.data.data, error: null }
      }

      return { data: null, error: new Error(`RPC function ${fnName} not implemented in proxy`) }
    } catch (err) {
      return handleError(err)
    }
  },

  storage: {
    from: (bucket) => ({
      getPublicUrl: (filePath) => {
        const cleanPath = filePath ? filePath.replace(/^\/+/, '') : ''
        return { data: { publicUrl: `${apiUrl}/files/download/${bucket}/${cleanPath}` } }
      }
    })
  }
}

// Вспомогательная функция для генерации события смены состояния авторизации
const triggerAuthChange = (event, session) => {
  const customEvent = new CustomEvent('auth-state-change', {
    detail: { event, session }
  })
  window.dispatchEvent(customEvent)
}
export default appApi
