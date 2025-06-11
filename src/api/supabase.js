import { createClient } from '@supabase/supabase-js'

// Инициализация Supabase клиента
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// Домен для редиректов (Netlify или localhost для разработки)
const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

if (!supabaseUrl || !supabaseKey) {
  console.error('Отсутствуют переменные окружения Supabase. Пожалуйста, проверьте ваш .env файл')
}

// Добавляем настройки для надежного сохранения сессии
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Настраиваем обработчики аутентификации
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth event:', event, 'Session exists:', !!session);
  
  // При смене статуса аутентификации сохраняем информацию в localStorage 
  // для диагностических целей и для упрощения восстановления состояния
  if (event) {
    localStorage.setItem('supabase.auth.lastEvent', event);
    localStorage.setItem('supabase.auth.lastEventTime', new Date().toISOString());
    
    // Обработка событий аутентификации для обновления состояния приложения
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Импортируем getActiveStore динамически, чтобы избежать циклических зависимостей
      import('pinia').then(({ getActivePinia }) => {
        const pinia = getActivePinia();
        if (pinia) {
          // Находим все хранилища, включая auth store
          const stores = pinia._s;
          // Ищем auth store по токену
          const authStore = Array.from(stores.values()).find(s => s.$id === 'auth');
          if (authStore && session?.user) {
            // Обновляем пользователя в store
            authStore.user = session.user;
            // Инициализируем auth store
            authStore.initAuth();
          }
        }
      }).catch(err => {
        console.error('Ошибка при обновлении хранилища:', err);
      });
    } else if (event === 'SIGNED_OUT') {
      // При выходе очищаем состояние пользователя в store
      import('pinia').then(({ getActivePinia }) => {
        const pinia = getActivePinia();
        if (pinia) {
          const stores = pinia._s;
          const authStore = Array.from(stores.values()).find(s => s.$id === 'auth');
          if (authStore) {
            authStore.user = null;
            authStore.profile = null;
            authStore.userRole = null;
          }
        }
      }).catch(err => {
        console.error('Ошибка при обновлении хранилища:', err);
      });
    }
  }
  
  // Если сессия отсутствует, но токен все еще присутствует, 
  // это может быть признаком несогласованности состояния
  if (!session && localStorage.getItem('supabase.auth.token')) {
    console.warn('Потенциальное несоответствие: токен есть, но сессия отсутствует');
  }
});


// Функции для работы с аутентификацией
export const auth = {
  // Получение текущей сессии
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('getSession result:', !!data?.session, 'error:', !!error);
      return { data, error };
    } catch (err) {
      console.error('Ошибка получения сессии:', err);
      return { data: { session: null }, error: err };
    }
  },
  
  // Обновление сессии
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      console.log('refreshSession result:', !!data?.session, 'error:', !!error);
      return { data, error };
    } catch (err) {
      console.error('Ошибка обновления сессии:', err);
      return { data: { session: null }, error: err };
    }
  },
  
  // Регистрация
  signUp: async ({ email, password, options }) => {
    try {
      // Формируем корректный URL для редиректа (можно оставить, если нужно)
      let redirectTo = options?.emailRedirectTo;
      if (!redirectTo) {
        if (siteUrl.endsWith('/')) {
          redirectTo = `${siteUrl}auth/callback`;
        } else {
          redirectTo = `${siteUrl}/auth/callback`;
        }
      }
      
      console.log('URL для редиректа:', redirectTo);
      console.log('Параметры регистрации (options):', options);
      
      // Передаем email, password и options напрямую в supabase.auth.signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { // Убедимся, что options передаются правильно
          ...options, // Копируем все переданные опции
          emailRedirectTo: redirectTo // Убеждаемся, что emailRedirectTo установлен
        }
      });
      
      // Дополнительная проверка ответа
      console.log('Ответ signUp:', {
        success: !error,
        userData: data?.user?.user_metadata,
        error
      });
      
      // Резервное обновление метаданных (можно оставить на всякий случай)
      if (data?.user && options?.data && (!data.user.user_metadata?.first_name || !data.user.user_metadata?.last_name)) {
        console.log('Обновляем метаданные пользователя после регистрации...');
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: options.data // Используем данные из options
          });
          
          if (updateError) {
            console.error('Ошибка обновления метаданных:', updateError.message);
          } else {
            console.log('Метаданные успешно обновлены');
          }
        } catch (updateErr) {
          console.error('Исключение при обновлении метаданных:', updateErr);
        }
      }
      
      return { data, error };
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      return { data: null, error: err };
    }
  },
  
  // Вход
  signIn: async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { data, error };
    } catch (err) {
      console.error('Ошибка входа:', err);
      return { data: null, error: err };
    }
  },
  
  // Выход
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Ошибка выхода из системы:', error);
      return { success: false, error: error.message };
    }
  },

  // Отправка кода подтверждения email
  sendEmailVerification: async (email) => {
    try {
      // Формируем корректный URL для редиректа
      // Убедимся, что URL формируется правильно и не содержит двойных слешей
      let redirectTo;
      
      // Проверка, заканчивается ли siteUrl на слеш
      if (siteUrl.endsWith('/')) {
        redirectTo = `${siteUrl}auth/callback`;
      } else {
        redirectTo = `${siteUrl}/auth/callback`;
      }
      
      console.log('URL для редиректа при верификации:', redirectTo);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });
      
      return { error };
    } catch (err) {
      console.error('Ошибка отправки кода подтверждения:', err);
      return { error: err };
    }
  },
  
  // Отправка OTP кода на email
  sendOtpToEmail: async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      options: {
        // Не указываем emailRedirectTo для получения только OTP кода
        shouldCreateUser: false // Не создавать нового пользователя, только отправить код
      }
      });
      
      return { error };
    } catch (err) {
      console.error('Ошибка отправки OTP кода:', err);
      return { error: err };
    }
  },
  
  // Подтверждение кода OTP
  verifyOtp: async (email, token) => {
    try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
        type: 'email'
      });
      
      return { data, error };
    } catch (err) {
      console.error('Ошибка подтверждения OTP:', err);
      return { data: null, error: err };
    }
  },

  // Сброс пароля
  resetPassword: async (email) => {
    try {
      // Формируем корректный URL для редиректа
      let redirectTo;
      
      // Проверка, заканчивается ли siteUrl на слеш
      if (siteUrl.endsWith('/')) {
        redirectTo = `${siteUrl}reset-password`;
      } else {
        redirectTo = `${siteUrl}/reset-password`;
      }
      
      console.log('URL для редиректа при сбросе пароля:', redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });
      return { error };
    } catch (err) {
      console.error('Ошибка сброса пароля:', err);
      return { error: err };
    }
  }
}

// Функции для работы с пользователями
export const users = {
  // Получить профиль текущего пользователя
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    try {
      // Проверяем существование профиля пользователя
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Если профиль не найден, создаем его
      if (error && (error.code === 'PGRST116' || error.message?.includes('contains 0 rows'))) {
        console.log('Профиль пользователя не существует, создаем новый профиль')
        
        // Берем данные из объекта пользователя auth
        const userData = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role_id: 1 // По умолчанию обычный пользователь
        }

        // Пробуем использовать RPC функцию, если она создана
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_user_profile', userData)
          
          if (!rpcError) {
            return { data: rpcData, error: null }
          }
        } catch (rpcErr) {
          console.warn('RPC метод недоступен:', rpcErr)
        }

        // Запасной вариант: пробуем напрямую вставить запись
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single()

        if (insertError) {
          // Если и это не сработало, возвращаем временный объект профиля
          console.error('Ошибка при создании профиля:', insertError)
          
          // Для отображения в интерфейсе вернем временный профиль
          return { 
            data: userData, 
            error: null, 
            virtual: true,
            originalError: insertError 
          }
        }

        return { data: newProfile, error: null }
      }

      return { data, error }
    } catch (err) {
      console.error('Ошибка при получении профиля:', err)
      return { 
        data: null, 
        error: new Error(`Ошибка при получении профиля: ${err.message}`) 
      }
    }
  },

  // Обновить профиль пользователя
  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    try {
      // Проверяем существование профиля перед обновлением
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // Если профиль не найден, создаем его
      if (!existingProfile) {
        // Берем данные из объекта пользователя auth и объединяем с переданными данными
        const userData = {
          id: user.id,
          email: user.email,
          first_name: profileData.first_name || user.user_metadata?.first_name || '',
          last_name: profileData.last_name || user.user_metadata?.last_name || '',
          middle_name: profileData.middle_name || '',
          phone: profileData.phone || '',
          role_id: 1 // По умолчанию обычный пользователь
        }

        // Пробуем использовать RPC функцию
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_user_profile', {
              user_id: userData.id,
              user_email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              role_id: userData.role_id
            })
          
          if (!rpcError) {
            return { data: rpcData, error: null }
          }
        } catch (rpcErr) {
          console.warn('RPC метод недоступен:', rpcErr)
        }

        // Запасной вариант: пробуем напрямую вставить запись
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single()

        if (insertError) {
          console.error('Ошибка при создании профиля:', insertError)
          
          // В случае проблем возвращаем виртуальный профиль для UI
          return { 
            data: { ...userData, ...profileData }, 
            error: null, 
            virtual: true,
            originalError: insertError 
          }
        }

        return { data: newProfile, error: null }
      }

      // Если профиль найден, обновляем его
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      return { data, error }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err)
      return { 
        data: null, 
        error: new Error(`Ошибка при обновлении профиля: ${err.message}`) 
      }
    }
  },

  // Получить роль пользователя
  async getUserRole(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { 
        p_user_id: userId 
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка получения роли пользователя:', err);
      return { data: null, error: err };
    }
  },
  
  // Обновить роль пользователя
  async updateUserRole(userId, roleId) {
    try {
      const { data, error } = await supabase.rpc('update_user_role', { 
        p_user_id: userId,
        p_role_id: roleId 
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка обновления роли пользователя:', err);
      return { data: null, error: err };
    }
  },
  
  // Получить список пользователей с фильтрацией
  async getAllUsers(roleId = null, search = '', page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      
      // Из-за ошибки несоответствия типов (42804) используем прямой запрос вместо RPC
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          middle_name,
          phone,
          role_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Фильтрация на стороне клиента
      let filteredData = data;
      
      // Фильтрация по роли если указана
      if (roleId) {
        filteredData = filteredData.filter(user => user.role_id === roleId);
      }
      
      // Поиск по имени, фамилии или email
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(user => 
          (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      }
      
      // Вычисляем общее количество и применяем пагинацию
      const total = filteredData.length;
      const paginatedData = filteredData.slice(offset, offset + pageSize);
      
      return { 
        data: { 
          users: paginatedData, 
          total_count: total 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Ошибка получения списка пользователей:', err);
      return { data: null, error: err };
    }
  }
}

// Функции для работы с заявками
export const applications = {
  // Получение заявок с фильтрацией и пагинацией через RPC
  async getAll({ page = 1, pageSize = 10, filters = {} } = {}) {
    try {
      const { data, error } = await supabase.rpc('get_filtered_applications', {
        p_status_id: filters.statusId || null,
        p_level_id: filters.levelId || null,
        p_direction_id: filters.directionId || null,
        p_profile_id: filters.profileId || null,
        p_search_query: filters.searchQuery || null,
        p_page_number: page,
        p_page_size: pageSize
      });

      if (error) throw error;
      
      const count = data && data.length > 0 ? data[0].total_count : 0;
      
      // Улучшенное форматирование данных
      const formattedData = data.map(app => ({
          ...app,
        status: { 
          name: app.status_name,
          id: app.status_id
        },
        user: { 
          full_name: app.applicant_full_name,
          id: app.user_id,
          first_name: app.first_name,
          last_name: app.last_name
        },
        // Добавляем информацию о направлении и профиле в правильном формате
        direction: {
          name: app.direction_name,
          code: app.direction_code,
          id: app.direction_id
        },
        profile: {
          name: app.profile_name,
          id: app.profile_id
        },
          application_choices: app.choices || []
      }));

      return { data: formattedData, count, error: null };
    } catch (err) {
      console.error('Ошибка при вызове RPC get_filtered_applications:', err);
      return { data: null, count: 0, error: err };
    }
  },

  // Получить одну заявку по ID с использованием оптимизированной RPC функции
  async getById(id) {
    try {
      console.log('Получение заявки по ID:', id);
      
      // Используем обновленную RPC функцию, которая возвращает JSON
      const { data, error } = await supabase.rpc('get_application_details', {
        application_id_param: id
      });

      if (error) {
        console.error('Ошибка получения заявки через RPC:', error);
        return { data: null, error };
      }

      console.log('Данные заявки получены:', data);
      
      if (!data) {
        return { data: null, error: new Error('Заявка не найдена') };
      }

      // Функция теперь возвращает JSON объект напрямую, все данные уже в правильном формате
      const applicationData = data;

      // RPC функция get_application_details уже включает все файлы, документы и сертификаты
      // Поэтому дополнительная загрузка не требуется
      
      // Убеждаемся, что массивы существуют (на случай если RPC вернула null)
      applicationData.documents = applicationData.documents || [];
      applicationData.application_files = applicationData.application_files || [];
      applicationData.olympiad_certificates = applicationData.olympiad_certificates || [];

      console.log('Отформатированные данные заявки с файлами:', applicationData);
      console.log('Количество документов:', applicationData.documents.length);
      console.log('Количество файлов заявления:', applicationData.application_files.length);
      console.log('Количество сертификатов олимпиад:', applicationData.olympiad_certificates.length);
      return { data: applicationData, error: null };

    } catch (err) {
      console.error('Ошибка получения заявки:', err);
      return { data: null, error: err };
    }
  },

  // Получить статистику по заявкам
  async getStatistics() {
    try {
      // Здесь должны быть вызовы к новым RPC функциям, если они будут созданы
      // Пока что возвращаем пустые данные
      const { data: dailyStats, error: dailyError } = await supabase.rpc('get_daily_application_stats')
      const { data: statusStats, error: statusError } = await supabase.rpc('get_applications_by_status')

      if (dailyError || statusError) {
        console.error('Statistics error:', dailyError || statusError)
      }

      return { 
        data: {
          dailyStats: dailyStats || [],
          statusStats: statusStats || [] 
        }, 
        error: null 
      }
    } catch (err) {
      console.error('Ошибка получения статистики:', err)
      return { data: null, error: err }
    }
  },

  // Создать новую заявку
  async create(applicationData) {
    try {
      // Проверяем, что у всех выбранных профилей одинаковый набор экзаменов
      if (applicationData.choices && applicationData.choices.length > 1) {
        const firstProfileId = applicationData.choices[0].profile_id;
        
        // Получаем набор предметов для первого профиля
        const { data: firstProfileExams, error: examsError } = await supabase
          .rpc('get_profile_exams', { profile_id_param: firstProfileId });
          
        if (examsError) throw examsError;
        
        // Проверяем каждый выбранный профиль
        for (let i = 1; i < applicationData.choices.length; i++) {
          const { data: profileExams, error } = await supabase
            .rpc('get_profile_exams', { profile_id_param: applicationData.choices[i].profile_id });
        
      if (error) throw error;

          // Проверяем, что наборы предметов идентичны
          if (profileExams.length !== firstProfileExams.length) {
            throw new Error('Выбранные профили имеют разные наборы вступительных испытаний');
          }
          
          const firstSubjects = firstProfileExams.map(e => e.subject_id).sort().join(',');
          const currentSubjects = profileExams.map(e => e.subject_id).sort().join(',');
          
          if (firstSubjects !== currentSubjects) {
            throw new Error('Выбранные профили имеют разные наборы вступительных испытаний');
          }
        }
      }
    
      // Создаем новую заявку в транзакции через RPC, которая теперь вставляет и choices
      const { data, error } = await supabase.rpc('create_application', {
        app_data: applicationData
      });
      
      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      console.error('Ошибка создания заявки:', err);
      return { data: null, error: err.message || 'Ошибка создания заявки' };
    }
  },

  // Обновить заявку
  async update(id, applicationData) {
    try {
      const { choices, ...appData } = applicationData;
      
      const { error: updateError } = await supabase
        .from('applications')
        .update(appData)
        .eq('id', id);

      if (updateError) throw updateError;
      
      if (choices) {
        const { error: deleteChoicesError } = await supabase
            .from('application_choices')
            .delete()
            .eq('application_id', id);
        
        if (deleteChoicesError) throw deleteChoicesError;

        if (choices.length > 0) {
            const choicesToInsert = choices.map(choice => ({
                application_id: id,
                profile_id: choice.profile_id,
                priority: choice.priority
            }));

            const { error: insertChoicesError } = await supabase
                .from('application_choices')
                .insert(choicesToInsert);
            
            if (insertChoicesError) throw insertChoicesError;
        }
      }

      const { data: updatedApplication, error: selectError } = await this.getById(id);

      if (selectError) throw selectError;

      return { data: updatedApplication, error: null };
    } catch (err) {
      console.error('Ошибка при обновлении заявки:', err);
      return { data: null, error: err };
    }
  },

  // Отправить заявку на рассмотрение
  async submit(id) {
    // Используем статус "Подана" с ID 2 (или актуальным ID из вашей таблицы статусов)
    const { data, error } = await supabase
      .from('applications')
      .update({ status_id: 2 })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Получить историю изменений статусов заявки по ID заявки
  async getApplicationHistory(applicationId) {
    try {
      const { data, error } = await supabase
        .from('application_history')
        .select(`
          id,
          application_id,
          status_id,
          comment,
          created_by,
          created_at,
          status:status_id(id, name)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

      // Если нужны данные о пользователях, запрашиваем их отдельно
      if (data && data.length > 0) {
        // Собираем уникальные ID пользователей
        const userIds = [...new Set(data.map(item => item.created_by).filter(id => id))];
        
        if (userIds.length > 0) {
          // Запрашиваем данные пользователей
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, first_name, last_name')
            .in('id', userIds);
          
          if (usersData && !usersError) {
            // Добавляем данные пользователей к записям истории
            data.forEach(historyItem => {
              if (historyItem.created_by) {
                const user = usersData.find(u => u.id === historyItem.created_by);
                if (user) {
                  historyItem.created_by_user = user;
                }
              }
            });
          }
        }
      }

      return { data, error }
    } catch (err) {
      console.error('Ошибка получения истории заявки:', err)
      return { data: null, error: err }
    }
  },

  // Обновить статус заявки с добавлением записи в историю изменений
  async updateStatus(applicationId, statusId, comment = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

      console.log('Обновление статуса заявки:', { applicationId, statusId, comment });

      // Используем новую RPC функцию, которая обновляет статус и создает запись в истории
      const { data, error } = await supabase.rpc('update_application_status_with_history', {
        p_application_id: applicationId,
        p_status_id: statusId,
        p_comment: comment || ''
      });

      if (error) {
        console.error('Ошибка при вызове RPC update_application_status_with_history:', error);
        return { data: null, error };
      }

      console.log('Результат обновления статуса:', data);

      return { 
        data: data.application, 
        historyRecord: { id: data.history_id }, 
        error: null 
      };
    } catch (err) {
      console.error('Ошибка обновления статуса заявки:', err)
      return { data: null, error: err }
    }
  }
}

// Функции для работы с документами
export const documents = {
  // Получить типы документов
  async getTypes() {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .order('id');
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка при получении типов документов:', err);
      return { data: null, error: err };
    }
  },

  // Получить документы по ID заявки
  async getByApplicationId(applicationId) {
    try {
      // Используем нашу хранимую функцию для получения документов
      const { data, error } = await supabase
        .rpc('get_application_documents', { p_application_id: applicationId });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка при получении документов:', err);
      return { data: null, error: err };
    }
  },

  // Загрузить новый документ
  async upload(applicationId, documentTypeId, file) {
    try {
      // Получаем данные о текущем пользователе
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') };

      // Генерируем имя файла и путь с правильной структурой директорий
      const fileExt = file.name.split('.').pop();
      const fileId = crypto.randomUUID();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      // Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from('application_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError);
        return { data: null, error: uploadError };
      }

      // Вызываем RPC функцию для создания записи о документе
      const { data, error } = await supabase.rpc('upload_document', {
        p_application_id: applicationId,
        p_document_type_id: documentTypeId,
        p_file_name: file.name,
        p_file_path: filePath,
        p_file_size: file.size,
        p_file_type: file.type
      });

      if (error) {
        console.error('Ошибка создания записи о документе:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Ошибка при загрузке документа:', err);
      return { data: null, error: err };
    }
  },
  
  // Получить подписанный URL для документа
  async getSignedUrl(documentId, options = {}) {
    try {
      const { download = false } = options;
      
      // Сначала получаем информацию о документе из базы данных
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('Ошибка при получении данных документа:', docError);
        throw docError;
      }
      
      // Проверяем наличие необходимых данных
      if (!docData || !docData.file_path) {
        console.error('Отсутствуют данные о документе или путь к файлу:', docData);
        throw new Error('Документ не найден или отсутствует путь к файлу');
      }
      
      console.log('Получен путь к файлу:', docData.file_path);
      
      // Используем getPublicUrl для получения прямого URL к файлу
      // Это работает, если бакет публичный, что нормально для документов заявлений
      const { data: urlData } = supabase.storage
        .from('application_documents')
        .getPublicUrl(docData.file_path, {
          download: download,
          ...(docData.file_name ? { fileName: docData.file_name } : {})
        });
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Не удалось получить публичный URL');
        throw new Error('Не удалось получить URL документа');
      }
      
      console.log('Получен публичный URL:', urlData.publicUrl);
      
      // Возвращаем в том же формате, что и прежний метод для совместимости
      return { 
        data: { 
          signedUrl: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Ошибка при получении URL документа:', err);
      return { data: null, error: err };
    }
  },

  // Обновить документ
  async update(documentId, documentData) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        document_type_id: documentData.document_type_id,
        updated_at: new Date()
      })
      .eq('id', documentId)
      .select();

    return { data, error };
  }
}

// Функции для работы с файлами заявлений (фотографии и другие)
export const applicationFiles = {
  // Загрузить файл заявления (фотографию или документ)
  async upload(applicationId, file, fileCategory = 'general', isImage = false) {
    try {
      // Получаем данные о текущем пользователе
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') };

      console.log('Загрузка файла:', { applicationId, fileName: file.name, fileCategory, fileType: file.type });

      // Генерируем имя файла и путь
      const fileExt = file.name.split('.').pop();
      const fileId = crypto.randomUUID();
      const fileName = `${fileId}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      // Определяем, является ли файл изображением
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const calculatedIsImage = isImage || imageTypes.includes(file.type);

      // Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from('application_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Ошибка загрузки файла в Storage:', uploadError);
        return { data: null, error: uploadError };
      }

      // Используем обновленную RPC функцию для создания записи в таблице application_files
      const { data, error } = await supabase.rpc('upload_application_file', {
        p_application_id: applicationId,
        p_file_path: filePath,
        p_file_name: file.name,
        p_file_type: file.type,
        p_file_size: file.size,
        p_is_image: calculatedIsImage,
        p_file_category: fileCategory
      });

      if (error) {
        console.error('Ошибка создания записи о файле в БД:', error);
        return { data: null, error };
      }

      console.log('Файл успешно загружен:', { fileId: data, fileCategory });
      return { data: { id: data }, error: null };
    } catch (err) {
      console.error('Ошибка при загрузке файла заявления:', err);
      return { data: null, error: err };
    }
  },

  // Получить файлы по ID заявки
  async getByApplicationId(applicationId) {
    try {
      const { data, error } = await supabase
        .from('application_files')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка при получении файлов заявления:', err);
      return { data: null, error: err };
    }
  },

  // Получить подписанный URL для файла
  async getSignedUrl(fileId, options = {}) {
    try {
      const { download = false } = options;
      
      // Получаем информацию о файле из базы данных
      const { data: fileData, error: fileError } = await supabase
        .from('application_files')
        .select('*')
        .eq('id', fileId)
        .single();
      
      if (fileError) {
        console.error('Ошибка при получении данных файла:', fileError);
        throw fileError;
      }
      
      if (!fileData || !fileData.file_path) {
        console.error('Отсутствуют данные о файле или путь к файлу:', fileData);
        throw new Error('Файл не найден или отсутствует путь к файлу');
      }
      
      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('application_files')
        .getPublicUrl(fileData.file_path, {
          download: download,
          ...(fileData.file_name ? { fileName: fileData.file_name } : {})
        });
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Не удалось получить публичный URL');
        throw new Error('Не удалось получить URL файла');
      }
      
      return { 
        data: { 
          signedUrl: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Ошибка при получении URL файла:', err);
      return { data: null, error: err };
    }
  }
}

// Функции для работы с Excel экспортом
export const excelExport = {
  // Получить данные всех абитуриентов для экспорта в Excel
  async getAllApplicantsData() {
    try {
      const { data, error } = await supabase
        .rpc('get_all_applicants_data');
      
      if (error) {
        console.error('Ошибка получения данных абитуриентов:', error);
        
        // Проверка на конкретные коды ошибок PostgreSQL
        if (error.code === '42804') {
          // Ошибка несоответствия типов - попробуем получить и преобразовать данные вручную
          try {
            // Выполняем прямой SQL запрос с преобразованием типов
            const { data: rawData, error: rawError } = await supabase
              .from('applications')
              .select(`
                id,
                user_id (id, email, first_name, last_name, middle_name, phone, birth_date, gender),
                direction_id (id, code, name),
                status_id (id, name),
                passport_series,
                passport_issue_date,
                passport_issued_by,
                education_level,
                education_institution,
                education_graduation_year,
                document_number,
                document_date,
                study_form,
                funding_form,
                admin_comment,
                created_at
              `)
              .order('created_at', { ascending: false });
              
            if (rawError) throw rawError;
            
            // Преобразуем данные в нужный формат
            const formattedData = rawData.map(item => ({
              user_id: item.user_id.id,
              email: item.user_id.email,
              first_name: item.user_id.first_name,
              last_name: item.user_id.last_name,
              middle_name: item.user_id.middle_name,
              phone: item.user_id.phone,
              birth_date: item.user_id.birth_date,
              gender: item.user_id.gender,
              application_id: item.id,
              direction_code: item.direction_id.code,
              direction_name: item.direction_id.name,
              application_status: item.status_id.name,
              passport_series: item.passport_series,
              passport_issue_date: item.passport_issue_date,
              passport_issued_by: item.passport_issued_by,
              education_level: item.education_level,
              education_institution: item.education_institution,
              education_graduation_year: item.education_graduation_year,
              document_number: item.document_number,
              document_date: item.document_date,
              study_form: item.study_form,
              funding_form: item.funding_form,
              admin_comment: item.admin_comment,
              application_created_at: item.created_at,
              documents_count: 0, // Заполним позже
              doc_passport: '',
              doc_education: ''
            }));
            
            return { success: true, data: formattedData };
          } catch (backupErr) {
            console.error('Ошибка при попытке обойти проблему с типами данных:', backupErr);
            return { success: false, error: 'Проблема с типами данных в базе данных. Обратитесь к администратору.' };
          }
        }
        
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Ошибка получения данных абитуриентов:', err);
      return { success: false, error: err.message };
    }
  },
  
  // Получить детальные данные абитуриента по ID пользователя
  async getApplicantDataById(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'ID пользователя не указан' };
      }
      
      const { data, error } = await supabase
        .rpc('get_applicant_data_by_id', { p_user_id: userId })
      
      if (error) {
        console.error('Ошибка получения данных абитуриента:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Ошибка получения данных абитуриента:', err);
      return { success: false, error: err.message };
    }
  },
  
  // Получить детальные данные абитуриента по ID заявления
  async getApplicantDataByApplicationId(applicationId) {
    try {
      if (!applicationId) {
        return { success: false, error: 'ID заявления не указан' };
      }
      
      const { data, error } = await supabase
        .rpc('get_applicant_data_by_application_id', { p_application_id: applicationId })
      
      if (error) {
        console.error('Ошибка получения данных заявления:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Ошибка получения данных заявления:', err);
      return { success: false, error: err.message };
    }
  },
  
  // Конвертация данных в Excel-файл и его скачивание
  // Зависимости: необходимо установить пакет exceljs
  // npm install exceljs
  async downloadExcel(data, fileName = 'applicants-data.xlsx') {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Отсутствуют данные для экспорта');
        return { success: false, error: 'Отсутствуют данные для экспорта' };
      }
      
      // Динамически импортируем библиотеку exceljs
      const ExcelJS = await import('exceljs').then(module => module.default);
      
      // Создаем новую книгу Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Абитуриенты');
      
      // Определяем заголовки на русском языке
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
        doc_education: 'Скан документа об образовании',
        document_id: 'ID документа',
        document_type: 'Тип документа',
        document_file_name: 'Имя файла',
        document_file_path: 'Путь к файлу',
        document_file_size: 'Размер файла (байт)',
        document_file_type: 'Тип файла',
        document_status: 'Статус документа',
        document_comment: 'Комментарий к документу',
        document_created_at: 'Дата загрузки документа'
      };
      
      // Получаем список полей из первой записи
      const firstRecord = data[0];
      const fields = Object.keys(firstRecord);
      
      // Добавляем заголовки колонок
      const headerRow = fields.map(field => headers[field] || field);
      worksheet.addRow(headerRow);
      
      // Стиль для заголовков
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Добавляем данные
      data.forEach(record => {
        const rowData = fields.map(field => {
          const value = record[field];
          
          // Форматирование дат
          if (field.includes('date') && value) {
            if (typeof value === 'string' && value.includes('T')) {
              // Для полных дат с временем
              return new Date(value).toLocaleString('ru-RU');
            } else {
              // Для дат без времени
              return new Date(value).toLocaleDateString('ru-RU');
            }
          }
          
          // Форматирование пола
          if (field === 'gender') {
            return value === 'male' ? 'Мужской' : value === 'female' ? 'Женский' : value;
          }
          
          // Форматирование формы обучения
          if (field === 'study_form') {
            return value === 'full-time' ? 'Очная' : 
                   value === 'part-time' ? 'Заочная' : 
                   value === 'distance' ? 'Дистанционная' : value;
          }
          
          // Форматирование формы финансирования
          if (field === 'funding_form') {
            return value === 'budget' ? 'Бюджет' : 
                   value === 'contract' ? 'Контракт' : value;
          }
          
          // Форматирование уровня образования
          if (field === 'education_level') {
            return value === 'high-school' ? 'Среднее общее' : 
                   value === 'college' ? 'Среднее профессиональное' : 
                   value === 'bachelor' ? 'Высшее - бакалавриат' : 
                   value === 'master' ? 'Высшее - магистратура' : value;
          }
          
          return value;
        });
        worksheet.addRow(rowData);
      });
      
      // Автоподбор ширины колонок
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellLength = cell.value ? cell.value.toString().length : 10;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50); // Ограничиваем максимальную ширину
      });
      
      // Генерируем excel файл
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Создаем Blob и ссылку для скачивания
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку для скачивания и "нажимаем" на нее
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (err) {
      console.error('Ошибка экспорта в Excel:', err);
      return { success: false, error: err.message };
    }
  }
};

// Новый объект для всей статистики
export const statistics = {
  async getProgramStats() {
    return supabase.rpc('get_program_application_stats');
  },
  async getDailyApplicationStats() {
    return supabase.rpc('get_daily_application_stats');
  },
  async getGeneralStats() {
    return supabase.rpc('get_general_stats');
  }
};

// Функции для работы с сертификатами олимпиад
export const olympiadCertificates = {
  // Загрузить сертификат олимпиады
  async upload(applicationId, file) {
    try {
      // Получаем данные о текущем пользователе
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') };

      console.log('Загрузка сертификата олимпиады:', { applicationId, fileName: file.name, fileType: file.type });

      // Генерируем имя файла и путь
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `olympiad_${timestamp}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      // Загружаем файл в Storage (используем application_files bucket)
      const { error: uploadError } = await supabase.storage
        .from('application_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Ошибка загрузки сертификата в Storage:', uploadError);
        return { data: null, error: uploadError };
      }

      // Используем RPC функцию для создания записи в таблице olympiad_certificates
      const { data, error } = await supabase.rpc('upload_olympiad_certificate', {
        p_application_id: applicationId,
        p_file_name: file.name, // Оригинальное имя файла
        p_file_path: filePath,
        p_file_size: file.size,
        p_file_type: file.type,
        p_year: 2025
      });

      if (error) {
        console.error('Ошибка создания записи о сертификате в БД:', error);
        return { data: null, error };
      }

      console.log('Сертификат олимпиады успешно загружен:', { certificateId: data });
      return { data: { id: data }, error: null };
    } catch (err) {
      console.error('Ошибка при загрузке сертификата олимпиады:', err);
      return { data: null, error: err };
    }
  },

  // Получить сертификаты по ID заявки
  async getByApplicationId(applicationId) {
    try {
      const { data, error } = await supabase
        .from('olympiad_certificates')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка при получении сертификатов олимпиады:', err);
      return { data: null, error: err };
    }
  },

  // Получить подписанный URL для сертификата
  async getSignedUrl(certificateId, options = {}) {
    try {
      const { download = false } = options;
      
      // Используем RPC функцию для получения информации о сертификате с проверкой доступа
      const { data: certData, error: certError } = await supabase
        .rpc('get_olympiad_certificate_signed_url', { p_certificate_id: certificateId });
      
      if (certError) {
        console.error('Ошибка при получении данных сертификата:', certError);
        throw certError;
      }
      
      if (!certData || certData.error) {
        const errorMsg = certData?.error || 'Сертификат не найден или отсутствует доступ';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!certData.file_path) {
        console.error('Отсутствует путь к файлу сертификата:', certData);
        throw new Error('Отсутствует путь к файлу сертификата');
      }
      
      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('application_files')
        .getPublicUrl(certData.file_path, {
          download: download,
          ...(certData.file_name ? { fileName: certData.file_name } : {})
        });
      
      if (!urlData || !urlData.publicUrl) {
        console.error('Не удалось получить публичный URL для сертификата');
        throw new Error('Не удалось получить URL сертификата');
      }
      
      return { 
        data: { 
          signedUrl: urlData.publicUrl,
          fileName: certData.file_name,
          fileSize: certData.file_size,
          fileType: certData.file_type
        }, 
        error: null 
      };
    } catch (err) {
      console.error('Ошибка при получении URL сертификата:', err);
      return { data: null, error: err };
    }
  }
};

function getPagination(page, size) {
  const limit = size ? +size : 3;
  const from = page ? (page - 1) * limit : 0;
  const to = page ? from + size - 1 : size - 1;
  return { from, to };
}

// Функции для логирования и аудита
export const logs = {
  // Запись действий администратора
  async logAdminAction(action, resourceId, resourceType, details) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') };
      
      const { data, error } = await supabase.rpc('log_admin_action', {
        p_action: action,
        p_resource_id: resourceId,
        p_resource_type: resourceType,
        p_details: details
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка записи действия администратора:', err);
      return { data: null, error: err };
    }
  },
  
  // Запись изменений статуса заявления
  async logApplicationChange(applicationId, statusId, comment = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') };
      
      const { data, error } = await supabase.rpc('log_application_changes', {
        p_application_id: applicationId,
        p_status_id: statusId,
        p_comment: comment,
        p_created_by: user.id
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка записи изменения статуса заявления:', err);
      return { data: null, error: err };
    }
  }
} 