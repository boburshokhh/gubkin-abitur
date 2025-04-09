import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, users } from '../api/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const emailToVerify = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isApplicant = computed(() => {
    // Все пользователи считаются абитуриентами
    return true
  })
  const isEmailConfirmed = computed(() => user.value?.email_confirmed_at)

  // Инициализация пользователя при загрузке приложения
  async function initAuth() {
    isLoading.value = true
    error.value = null
      
    try {
      // Принудительно обновляем сессию
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (!refreshError && refreshData?.session) {
        user.value = refreshData.user
        await loadUserProfile()
        console.log('Сессия успешно восстановлена')
        return true
      }
      
      // Если обновление не удалось, пробуем получить текущую сессию
      const { data: sessionData, error: sessionError } = await auth.getSession()
      
      if (!sessionError && sessionData?.session) {
        const { data, error: userError } = await auth.getUser()
        
        if (!userError && data?.user) {
          user.value = data.user
          await loadUserProfile()
          console.log('Сессия получена')
        return true
        }
      }
      
      console.log('Сессия не найдена')
      return false
    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err)
      error.value = 'Не удалось загрузить данные пользователя'
        return false
      } finally {
      isLoading.value = false
    }
  }

  // Загрузка профиля пользователя
  async function loadUserProfile() {
    if (!user.value) return null

    try {
      const { data, error: profileError, virtual, originalError } = await users.getProfile()
      
      if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError)
        error.value = 'Не удалось загрузить профиль пользователя'
        return null
      }
      
      // Если получили виртуальный профиль (временное решение для UI)
      if (virtual && data) {
        console.warn('Загружен виртуальный профиль из-за ограничений RLS')
        console.error('Исходная ошибка:', originalError)
        // Всё равно используем профиль для отображения UI
      }
      
      profile.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err)
      error.value = 'Не удалось загрузить профиль пользователя'
      return null
    }
  }

  // Регистрация
  async function register(credentials) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await auth.signUp(credentials)
      
      if (signUpError) throw signUpError
      
      user.value = data?.user || null
      emailToVerify.value = credentials.email
      
      if (user.value) {
        await loadUserProfile()
      }
      
      return { success: true, needsEmailVerification: true, email: credentials.email }
    } catch (err) {
      console.error('Ошибка регистрации:', err)
      error.value = err.message || 'Не удалось зарегистрироваться'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Вход
  async function login(credentials) {
    isLoading.value = true
    error.value = null
      
    try {
      const { data, error: signInError } = await auth.signIn(credentials)
      
      if (signInError) throw signInError
      
      user.value = data?.user || null
      
      if (user.value) {
        await loadUserProfile()
      }
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка входа:', err)
      error.value = err.message || 'Не удалось войти'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Выход
  async function logout() {
    isLoading.value = true
    error.value = null

    try {
      const { error: signOutError } = await auth.signOut()
      
      if (signOutError) throw signOutError
      
      user.value = null
      profile.value = null
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка выхода:', err)
      error.value = err.message || 'Не удалось выйти'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Отправка кода подтверждения
  async function sendVerificationEmail(email = null) {
    const emailAddress = email || emailToVerify.value
    if (!emailAddress) {
      return { success: false, error: 'Email не указан' }
    }
    
    isLoading.value = true
    error.value = null

    try {
      const { error: verificationError } = await auth.sendEmailVerification(emailAddress)
      
      if (verificationError) throw verificationError
      
      emailToVerify.value = emailAddress
      return { success: true }
    } catch (err) {
      console.error('Ошибка отправки кода подтверждения:', err)
      error.value = err.message || 'Не удалось отправить код подтверждения'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Отправка OTP кода на email (без перехода по ссылке)
  async function sendOtpCode(email = null) {
    const emailAddress = email || emailToVerify.value
    if (!emailAddress) {
      return { success: false, error: 'Email не указан' }
    }
    
    isLoading.value = true
    error.value = null

    try {
      const { error: otpError } = await auth.sendOtpToEmail(emailAddress)
      
      if (otpError) throw otpError
      
      emailToVerify.value = emailAddress
      return { success: true }
    } catch (err) {
      console.error('Ошибка отправки OTP кода:', err)
      error.value = err.message || 'Не удалось отправить код подтверждения'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Подтверждение email по коду
  async function verifyEmail(email, code) {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: verifyError } = await auth.verifyOtp(email, code)
      
      if (verifyError) throw verifyError
      
      user.value = data?.user || null
      emailToVerify.value = null
      
      if (user.value) {
        await loadUserProfile()
      }
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка подтверждения email:', err)
      error.value = err.message || 'Неверный код подтверждения'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Сброс пароля
  async function resetPassword(email) {
    isLoading.value = true
    error.value = null

    try {
      const { error: resetError } = await auth.resetPassword(email)
      
      if (resetError) throw resetError
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка сброса пароля:', err)
      error.value = err.message || 'Не удалось отправить инструкции по сбросу пароля'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Обновление профиля
  async function updateProfile(profileData) {
    isLoading.value = true
    error.value = null
      
    try {
      const { data, error: updateError } = await users.updateProfile(profileData)
      
      if (updateError) throw updateError
      
      profile.value = data
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err)
      error.value = err.message || 'Не удалось обновить профиль'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    profile,
    isLoading,
    error,
    emailToVerify,
    isAuthenticated,
    isApplicant,
    isEmailConfirmed,
    initAuth,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    sendVerificationEmail,
    sendOtpCode,
    verifyEmail
  }
}) 