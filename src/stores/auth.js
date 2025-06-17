import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, auth as supabaseAuth, users as supabaseUsers, clearSupabaseStorage } from '@/api/supabase'

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

  // Инициализация пользователя при загрузке приложения
  const initAuth = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const { data: { session }, error: sessionError } = await supabaseAuth.getSession();
      
      if (sessionError) {
        console.error('Ошибка получения сессии:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        // Проверяем срок действия токена
        if (isTokenExpired(session.access_token)) {
          console.log('Токен истек, пытаемся обновить сессию...');
          const refreshResult = await refreshSession();
          
          if (!refreshResult.success || !refreshResult.authenticated) {
            throw new Error(refreshResult.error || 'Не удалось обновить сессию');
          }
        } else {
          user.value = session.user;
          // Передаем пользователя из сессии, чтобы избежать дублирующего запроса
          const profileData = await loadUserProfile(session.user);
          // Передаем загруженный профиль, чтобы избежать дополнительного запроса к БД
          await loadUserRole(profileData);
        }
      } else {
          user.value = null;
          profile.value = null;
          userRole.value = null;
      }
    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err);
      error.value = 'Не удалось загрузить данные пользователя';
      user.value = null;
      profile.value = null;
      userRole.value = null;
      } finally {
      loading.value = false;
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
      const { data, error: profileError } = await supabaseUsers.getProfile(currentUser)
      
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
      const { data, error: roleError } = await supabase
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
      
      const redirectUrl = new URL('auth/callback', 'https://gubkin-abiturient.netlify.app').toString();
      console.log('URL для редиректа:', redirectUrl);
      console.log('Данные пользователя при регистрации:', { email, firstName, lastName });
      
      const { data, error: signUpError } = await supabaseAuth.signUp({
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
      const { data, error: signInError } = await supabaseAuth.signIn({
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
      return { success: false, error: error.value }
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
      
      // Очищаем localStorage от всех данных Supabase
      clearSupabaseStorage()
      
      // Вызываем signOut из API
      const { success, error: signOutError } = await supabaseAuth.signOut()
      
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
      clearSupabaseStorage()
      
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
      const { error: verificationError } = await supabaseAuth.sendEmailVerification(emailAddress)
      
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
      const { error: otpError } = await supabaseAuth.sendOtpToEmail(emailAddress)
      
      if (otpError) throw otpError
      
      emailToVerify.value = emailAddress
      return { success: true }
    } catch (err) {
      console.error('Ошибка отправки OTP кода:', err)
      error.value = err.message || 'Не удалось отправить код подтверждения'
      return { success: false, error: error.value }
    }
  }

  // Подтверждение email по коду
  const verifyEmail = async (email, code) => {
    try {
      const { data, error: verifyError } = await supabaseAuth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })
      
      if (verifyError) throw verifyError
      
      user.value = data?.user || null
      emailToVerify.value = null
      
      if (user.value) {
        // Передаем пользователя чтобы избежать дублирующего запроса
        const profileData = await loadUserProfile(user.value)
        // Передаем загруженный профиль, чтобы избежать дополнительного запроса к БД
        await loadUserRole(profileData)
      }
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка подтверждения email:', err)
      error.value = err.message || 'Неверный код подтверждения'
      return { success: false, error: error.value }
    }
  }

  // Сброс пароля
  const resetPassword = async (email) => {
    try {
      const { error: resetError } = await supabaseAuth.resetPassword(email)
      
      if (resetError) throw resetError
      
      return { success: true }
    } catch (err) {
      console.error('Ошибка сброса пароля:', err)
      error.value = err.message || 'Не удалось отправить инструкции по сбросу пароля'
      return { success: false, error: error.value }
    }
  }

  // Обновление профиля
  const updateProfile = async (updates) => {
    try {
      const { data, error: updateError } = await supabaseUsers.updateProfile(updates)
      
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
      const { data, error } = await supabaseUsers.getAllUsers();
      
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
      const { data, error } = await supabase
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

  // Обновление сессии и данных пользователя
  const refreshSession = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Получаем текущую сессию
      const { data: { session: currentSession }, error: sessionError } = await supabaseAuth.getSession();
      
      if (sessionError) {
        console.error('Ошибка получения сессии:', sessionError);
        throw sessionError;
      }
      
      // Если сессия отсутствует или токен истек, пытаемся обновить
      if (!currentSession || isTokenExpired(currentSession?.access_token)) {
        console.log('Сессия отсутствует или токен истек, пытаемся обновить...');
        
        // Пытаемся обновить токен
        const { data: refreshData, error: refreshError } = await supabaseAuth.refreshSession();
        
        if (refreshError) {
          console.error('Ошибка обновления токена:', refreshError);
          // Очищаем состояние при ошибке обновления
          user.value = null;
          profile.value = null;
          userRole.value = null;
          // Очищаем все данные Supabase из localStorage
          clearSupabaseStorage();
          
          return { 
            success: false, 
            authenticated: false, 
            error: 'Сессия истекла. Пожалуйста, войдите заново.' 
          };
        }

        // Если успешно обновили токен, получаем новую сессию
        const { data: { session: newSession }, error: newSessionError } = await supabaseAuth.getSession();
        
        if (newSessionError || !newSession) {
          throw new Error('Не удалось получить новую сессию после обновления токена');
        }

        // Обновляем пользователя с новой сессией
        user.value = newSession.user;
        // Передаем пользователя чтобы избежать дублирующего запроса
        const profileData = await loadUserProfile(newSession.user);
        // Передаем загруженный профиль, чтобы избежать дополнительного запроса к БД
        await loadUserRole(profileData);
        
        return { 
          success: true, 
          authenticated: true,
          role: userRole.value
        };
      }
      
      // Если сессия существует и токен валиден
      if (currentSession?.user) {
        user.value = currentSession.user;
        // Передаем пользователя чтобы избежать дублирующего запроса
        const profileData = await loadUserProfile(currentSession.user);
        // Передаем загруженный профиль, чтобы избежать дополнительного запроса к БД
        await loadUserRole(profileData);
        
        return { 
          success: true, 
          authenticated: true,
          role: userRole.value
        };
      }

      return { 
        success: true, 
        authenticated: false 
      };
      
    } catch (err) {
      console.error('Ошибка обновления сессии:', err);
      return { 
        success: false, 
        error: 'Не удалось обновить сессию. Пожалуйста, войдите заново.',
        authenticated: false
      };
    } finally {
      loading.value = false;
    }
  };

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
      const { data: { session }, error: sessionError } = await supabaseAuth.getSession();
      
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
        // Очищаем все данные Supabase из localStorage
        clearSupabaseStorage();
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
    initAuth,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    sendVerificationEmail,
    sendOtpCode,
    verifyEmail,
    getUserRole,
    checkIsAdmin,
    getAllUsers,
    updateUserRole,
    refreshSession,
    forceCheckSession
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