import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appApi, auth as authApi, users as usersApi, clearAuthStorage, clearSessionTokens } from '@/api/app-api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const emailToVerify = ref(null)
  const userRole = ref(null)

  const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 2)
  const isReviewer = computed(() => userRole.value === 'reviewer' || userRole.value === 3)
  const isApplicant = computed(() => userRole.value === 'applicant' || userRole.value === 1)
  const isAuthenticated = computed(() => !!user.value)
  const isEmailConfirmed = computed(() => user.value?.email_confirmed_at)
  const isPendingVerification = computed(() => user.value?.user_metadata?.status === 'pending_verification')

  const isEmailNotVerifiedError = (err) => {
    const message = String(err?.message || '').toLowerCase()
    return err?.code === 'email_not_verified'
      || (err?.status === 403 && (message.includes('не подтверж') || message.includes('not verified')))
  }

  // Инициализация пользователя при загрузке приложения
  const initAuth = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: { session }, error: sessionError } = await authApi.getSession()

      if (session?.user) {
        user.value = session.user
        const profileData = await loadUserProfile(session.user)
        await loadUserRole(profileData)
      } else if (sessionError) {
        // Определяем, является ли ошибка сетевой или ошибкой авторизации.
        // При сетевой ошибке (нет status) сохраняем persisted user из Pinia,
        // при ошибке авторизации (401/403) очищаем состояние.
        const isAuthError = sessionError?.status === 401 || sessionError?.status === 403
        if (isAuthError) {
          user.value = null
          profile.value = null
          userRole.value = null
        } else {
          console.warn('Сетевая ошибка при инициализации сессии, сохраняем кэшированное состояние:', sessionError)
        }
      } else {
        // Сессия отсутствует (рефреш токен истёк/не существует) — разлогиниваем
        user.value = null
        profile.value = null
        userRole.value = null
      }
    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err)
      // При неизвестной ошибке сохраняем кэшированный user, чтобы не выкидывать
      // пользователя из-за временного сбоя (CORS, сеть, 5xx)
    } finally {
      loading.value = false
    }
  }

  // Загрузка профиля пользователя
  const loadUserProfile = async (userFromSession = null) => {
    const currentUser = userFromSession || user.value;
    if (!currentUser) return null

    // Проверяем, есть ли уже загруженный профиль для этого пользователя
    if (profile.value && profile.value.id === currentUser.id) {
      console.log('Профиль уже загружен, пропускаем запрос к БД');
      return profile.value;
    }

    try {
      // Передаем пользователя чтобы избежать дублирующего вызова к auth.getUser()
      const { data, error: profileError } = await usersApi.getProfile(currentUser)
      
      if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError)
        error.value = 'Не удалось загрузить профиль пользователя'
        return null
      }
      
      profile.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err)
      error.value = 'Не удалось загрузить профиль пользователя'
      return null
    }
  }

  // Загрузка роли пользователя
  const loadUserRole = async (profileData = null) => {
    const currentUser = user.value;
    if (!currentUser) return null

    // Проверяем, есть ли уже загруженная роль
    if (userRole.value && userRole.value !== null) {
      console.log('Роль пользователя уже загружена, пропускаем запрос к БД');
      return userRole.value;
    }

    try {
      // Если профиль уже загружен, используем его
      const currentProfile = profileData || profile.value;
      if (currentProfile && currentProfile.role_id) {
        userRole.value = currentProfile.role_id
        return currentProfile.role_id
      }
      
      // Только если роль не найдена в профиле, делаем дополнительный запрос
      console.log('Загружаем роль пользователя из БД');
      const { data, error: roleError } = await appApi
        .from('users')
        .select('role_id')
        .eq('id', currentUser.id)
        .single()
      
      if (!roleError && data && data.role_id) {
        userRole.value = data.role_id
        return data.role_id
      }
      
      userRole.value = 1
      return 1
    } catch (err) {
      console.error('Ошибка загрузки роли пользователя:', err)
      userRole.value = 1
      return 1
    }
  }

  // Регистрация
  const register = async ({ email, password, firstName, lastName }) => {
    loading.value = true;
    error.value = null;
    try {
      console.log('Начало процесса регистрации');
      
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('Данные пользователя при регистрации:', { email, firstName, lastName });
      
      const { data, error: signUpError } = await authApi.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role_id: 1
          },
          emailRedirectTo: redirectUrl
        }
      })
      
      if (signUpError) {
        console.error('Ошибка при регистрации:', signUpError);
        throw signUpError;
      }
      
      console.log('Результат регистрации:', data);
      emailToVerify.value = email;
      
      if (data?.user?.identities?.length === 0) {
        console.log('Пользователь уже существует');
        return { success: false, error: 'Пользователь с таким email уже существует' };
      }
      
      return { success: true, user: data?.user };
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      error.value = err.message || 'Не удалось зарегистрироваться';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  // Вход
  const login = async ({ email, password }) => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: signInError } = await authApi.signIn({
        email,
        password,
      })
      
      if (signInError) throw signInError
      
      user.value = data?.user || null
      
      if (user.value) {
        // Передаем пользователя чтобы избежать дублирующего запроса
        const profileData = await loadUserProfile(user.value)
        // Передаем загруженный профиль, чтобы избежать дополнительного запроса к БД
        await loadUserRole(profileData)
      }
      
      return { success: true, data: data.user }
    } catch (err) {
      console.error('Ошибка входа:', err)
      error.value = err.message || 'Не удалось войти'
      if (isEmailNotVerifiedError(err)) {
        emailToVerify.value = email
        return {
          success: false,
          error: error.value,
          code: 'email_not_verified',
          email
        }
      }

      return { success: false, error: error.value, code: err.code }
    } finally {
      loading.value = false;
    }
  }

  // Выход
  const logout = async () => {
    try {
      // Сначала очищаем состояние store
      user.value = null
      profile.value = null
      userRole.value = null
      error.value = null
      emailToVerify.value = null
      
      // Очищаем localStorage от всех данных API
      clearAuthStorage()
      
      // Вызываем signOut из API
      const { success, error: signOutError } = await authApi.signOut()
      
      if (!success && signOutError) {
        console.warn('Предупреждение при выходе:', signOutError)
        // Не выбрасываем ошибку, так как состояние уже очищено
      }
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка выхода:', err)
      
      // Даже при ошибке принудительно очищаем состояние
      user.value = null
      profile.value = null
      userRole.value = null
      error.value = null
      emailToVerify.value = null
      clearAuthStorage()
      
      return { success: true } // Возвращаем success: true, так как состояние очищено
    }
  }

  // Отправка кода подтверждения
  const sendVerificationEmail = async (email = null) => {
    const emailAddress = email || emailToVerify.value
    if (!emailAddress) {
      return { success: false, error: 'Email не указан' }
    }

    try {
      const { error: verificationError } = await authApi.sendEmailVerification(emailAddress)
      
      if (verificationError) throw verificationError
      
      emailToVerify.value = emailAddress
      return { success: true }
    } catch (err) {
      console.error('Ошибка отправки кода подтверждения:', err)
      error.value = err.message || 'Не удалось отправить код подтверждения'
      return { success: false, error: error.value }
    }
  }

  // Отправка OTP кода на email (без перехода по ссылке)
  const sendOtpCode = async (email = null) => {
    const emailAddress = email || emailToVerify.value
    if (!emailAddress) {
      return { success: false, error: 'Email не указан' }
    }

    try {
      const { error: otpError } = await authApi.sendOtpToEmail(emailAddress)
      
      if (otpError) throw otpError
      
      emailToVerify.value = emailAddress
      return { success: true }
    } catch (err) {
      console.error('Ошибка отправки OTP кода:', err)
      error.value = err.message || 'Не удалось отправить код подтверждения'
      return { success: false, error: error.value }
    }
  }

  // Подтверждение email по ссылке из письма
  const verifyEmail = async (_email, token) => {
    if (!token) {
      return { success: false, error: 'Ссылка подтверждения некорректна или устарела' }
    }

    try {
      const { data, error: verifyError } = await authApi.verifyEmail(token)
      
      if (verifyError) throw verifyError
      
      user.value = data?.user || null
      emailToVerify.value = null
      
      if (user.value) {
        const profileData = await loadUserProfile(user.value)
        await loadUserRole(profileData)
      }
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка подтверждения email:', err)
      error.value = err.message || 'Ссылка подтверждения некорректна или устарела'
      return { success: false, error: error.value }
    }
  }

  // Сброс пароля
  const resetPassword = async (email) => {
    try {
      const { error: resetError } = await authApi.resetPassword(email)
      
      if (resetError) throw resetError
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка сброса пароля:', err)
      error.value = err.message || 'Не удалось отправить инструкции по сбросу пароля'
      return { success: false, error: error.value }
    }
  }

  const resetPasswordWithToken = async ({ token, password }) => {
    try {
      const { error: resetError } = await authApi.resetPasswordWithToken({ token, password })
      if (resetError) throw resetError
      return { success: true }
    } catch (err) {
      console.error('Ошибка установки нового пароля:', err)
      error.value = err.message || 'Не удалось обновить пароль'
      return { success: false, error: error.value }
    }
  }

  const validateInvitation = async (token) => {
    try {
      const { data, error: invitationError } = await authApi.validateInvitation(token)
      if (invitationError) throw invitationError
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка проверки приглашения:', err)
      return { success: false, error: err.message || 'Приглашение недействительно' }
    }
  }

  const acceptInvitation = async (payload) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: invitationError } = await authApi.acceptInvitation(payload)
      if (invitationError) throw invitationError

      user.value = data?.user || null
      if (user.value) {
        const profileData = await loadUserProfile(user.value)
        await loadUserRole(profileData)
      }

      return { success: true, data }
    } catch (err) {
      console.error('Ошибка принятия приглашения:', err)
      error.value = err.message || 'Не удалось принять приглашение'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Обновление профиля
  const updateProfile = async (updates) => {
    try {
      const { data, error: updateError } = await usersApi.updateProfile(updates)
      
      if (updateError) throw updateError
      
      profile.value = { ...profile.value, ...updates }
      
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err)
      error.value = err.message || 'Не удалось обновить профиль'
      return { success: false, error: error.value }
    }
  }

  // Получение текущей роли пользователя
  const getUserRole = async () => {
    if (userRole.value) return userRole.value
    return await loadUserRole()
  }

  // Проверка, является ли пользователь администратором
  const checkIsAdmin = async () => {
    const role = await getUserRole()
    return role === 2 || role === 'admin'
  }

  // Получение списка пользователей
  const getAllUsers = async () => {
    try {
      console.log("Вызов функции getAllUsers из API");
      // Используем обновленную функцию из API вместо RPC
      const { data, error } = await usersApi.getAllUsers();
      
      if (error) throw error;
      
      return { 
        success: true, 
        data: data?.users || [], 
        total: data?.total_count || 0 
      };
    } catch (err) {
      console.error('Ошибка получения списка пользователей:', err);
      error.value = err.message || 'Не удалось получить список пользователей';
      return { success: false, error: error.value };
    }
  }

  // Обновление роли пользователя (только для администраторов)
  const updateUserRole = async (userId, roleId) => {
    try {
      // Используем RPC вызов вместо прямого обращения к таблице
      const { data, error } = await appApi
        .rpc('update_user_role', { 
          user_id: userId,
          new_role_id: roleId
        });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (err) {
      console.error('Ошибка обновления роли пользователя:', err);
      return { success: false, error: err.message };
    }
  }

  // Обновление сессии и данных пользователя.
  // НЕ меняет loading — вызывается фоново (visibilitychange, debounce).
  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await authApi.getSession()

      if (sessionError) {
        const isAuthError = sessionError?.status === 401 || sessionError?.status === 403
        if (isAuthError) {
          user.value = null
          profile.value = null
          userRole.value = null
          clearSessionTokens()
          return { success: false, authenticated: false, error: 'Сессия истекла. Пожалуйста, войдите заново.' }
        }
        // Сетевая ошибка — не разлогиниваем
        return { success: false, authenticated: !!user.value, error: sessionError.message }
      }

      if (!currentSession || isTokenExpired(currentSession?.access_token)) {
        const { data: refreshData, error: refreshError } = await authApi.refreshSession()

        if (refreshError) {
          const isAuthError = refreshError?.status === 401 || refreshError?.status === 403
          if (isAuthError) {
            user.value = null
            profile.value = null
            userRole.value = null
            clearSessionTokens()
          }
          return {
            success: false,
            authenticated: false,
            error: 'Сессия истекла. Пожалуйста, войдите заново.'
          }
        }

        const { data: { session: newSession }, error: newSessionError } = await authApi.getSession()
        if (newSessionError || !newSession) {
          return { success: false, authenticated: false, error: 'Не удалось получить новую сессию после обновления токена' }
        }

        user.value = newSession.user
        const profileData = await loadUserProfile(newSession.user)
        await loadUserRole(profileData)
        return { success: true, authenticated: true, role: userRole.value }
      }

      if (currentSession?.user) {
        user.value = currentSession.user
        const profileData = await loadUserProfile(currentSession.user)
        await loadUserRole(profileData)
        return { success: true, authenticated: true, role: userRole.value }
      }

      return { success: true, authenticated: false }
    } catch (err) {
      console.error('Ошибка обновления сессии:', err)
      return { success: false, error: 'Не удалось обновить сессию.', authenticated: !!user.value }
    }
  }

  // Проверка истечения токена
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      // Проверка правильного формата JWT токена (должен содержать две точки)
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.warn('Некорректный формат токена JWT');
        return true;
      }
      
      // Проверка, что токен содержит корректные данные для декодирования
      const tokenParts = token.split('.');
      const base64Url = tokenParts[1];
      // Заменяем символы, которые не поддерживаются в atob
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Проверка на действительный base64
      try {
        const payload = JSON.parse(atob(base64));
        const expirationTime = payload.exp * 1000; // Переводим в миллисекунды
        return Date.now() >= expirationTime;
      } catch (parseError) {
        console.error('Ошибка при разборе содержимого токена:', parseError);
        return true;
      }
    } catch (err) {
      console.error('Ошибка при проверке токена:', err);
      return true;
    }
  };

  // Принудительная проверка сессии при проблемах
  const forceCheckSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await authApi.getSession();
      
      if (sessionError) {
        // Очищаем состояние при ошибке
        user.value = null;
        profile.value = null;
        userRole.value = null;
        return { success: false, authenticated: false, error: sessionError };
      }
      
      if (session?.user) {
        user.value = session.user;
        await loadUserProfile();
        await loadUserRole();
        return { success: true, authenticated: true };
      } else {
        // Сессия не найдена, принудительно выходим
        user.value = null;
        profile.value = null;
        userRole.value = null;
        // Очищаем все данные API из localStorage
        clearAuthStorage();
        return { success: true, authenticated: false };
      }
    } catch (err) {
      console.error('Ошибка принудительной проверки сессии:', err);
      return { success: false, authenticated: false, error: err };
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    emailToVerify,
    userRole,
    isAdmin,
    isReviewer,
    isApplicant,
    isAuthenticated,
    isEmailConfirmed,
    isPendingVerification,
    initAuth,
    register,
    login,
    logout,
    resetPassword,
    resetPasswordWithToken,
    updateProfile,
    sendVerificationEmail,
    sendOtpCode,
    verifyEmail,
    getUserRole,
    checkIsAdmin,
    getAllUsers,
    updateUserRole,
    refreshSession,
    forceCheckSession,
    validateInvitation,
    acceptInvitation
  }
}, {
  // Конфигурация для сохранения состояния в localStorage
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user', 'profile', 'userRole'], // Сохраняем только критически важные данные
    beforeRestore: (context) => {
      console.log('Восстановление состояния auth-store из localStorage')
    },
    afterRestore: (context) => {
      console.log('Состояние auth-store восстановлено')
    },
    debug: true
  }
}) 