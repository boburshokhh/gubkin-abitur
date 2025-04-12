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

/* 
НАСТРОЙКА SUPABASE (выполнить в SQL Editor):

-- Создание хранимой процедуры для добавления пользователя без RLS ограничений
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_email text,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  role_id int DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Выполняется с правами владельца функции
AS $$
DECLARE
  result json;
BEGIN
  -- Вставка новой записи без проверок RLS
  INSERT INTO public.users (id, email, first_name, last_name, role_id, created_at)
  VALUES (user_id, user_email, first_name, last_name, role_id, now())
  RETURNING to_json(users.*) INTO result;
  
  RETURN result;
END;
$$;

-- Настройка политик RLS для таблицы users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они мешают
DROP POLICY IF EXISTS "Пользователи могут видеть свой профиль" ON public.users;
DROP POLICY IF EXISTS "Пользователи могут создавать свой профиль" ON public.users;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON public.users;

-- Создаем новые политики с правильными названиями
CREATE POLICY "users_select" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert" ON public.users 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update" ON public.users 
FOR UPDATE USING (auth.uid() = id);

-- Админы могут видеть все профили
CREATE POLICY "admins_all" ON public.users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role_id = 2
  )
);
*/

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
            console.error('Ошибка обновления метаданных:', updateError);
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
      return { error };
    } catch (err) {
      console.error('Ошибка выхода:', err);
      return { error: err };
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
  }
}

// Функции для работы с направлениями обучения
export const directions = {
  // Получить все направления
  async getAll() {
    console.log('API: загрузка всех направлений');
    const { data, error } = await supabase
      .from('directions')
      .select('*')
      .order('name');

    console.log('API: получено направлений:', data?.length, 'Ошибка:', error);
    return { data, error };
  },

  // Получить направление по ID
  async getById(id) {
    console.log('API: загрузка направления по ID:', id);
    const { data, error } = await supabase
      .from('directions')
      .select('*')
      .eq('id', id)
      .single();

    console.log('API: результат загрузки направления:', data ? 'найдено' : 'не найдено', 'Ошибка:', error);
    return { data, error };
  },
  
  // Создать новое направление
  async create(directionData) {
    console.log('API: создание нового направления', directionData);
    
    // Проверяем обязательные поля
    if (!directionData.code || !directionData.name || !directionData.slug) {
      console.error('API: отсутствуют обязательные поля для создания направления');
      return { 
        data: null, 
        error: new Error('Отсутствуют обязательные поля (code, name, slug)')
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('directions')
        .insert(directionData)
        .select()
        .single();
        
      console.log('API: результат создания направления:', data ? 'успешно' : 'ошибка', 'Ошибка:', error);
      return { data, error };
    } catch (err) {
      console.error('API: исключение при создании направления:', err);
      return { data: null, error: err };
    }
  },
  
  // Обновить направление
  async update(id, directionData) {
    console.log('API: обновление направления с ID:', id, directionData);
    
    if (!id) {
      console.error('API: отсутствует ID для обновления направления');
      return { 
        data: null, 
        error: new Error('Отсутствует ID направления для обновления')
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('directions')
        .update(directionData)
        .eq('id', id)
        .select()
        .single();
        
      console.log('API: результат обновления направления:', data ? 'успешно' : 'ошибка', 'Ошибка:', error);
      return { data, error };
    } catch (err) {
      console.error('API: исключение при обновлении направления:', err);
      return { data: null, error: err };
    }
  },
  
  // Удалить направление
  async delete(id) {
    console.log('API: удаление направления с ID:', id);
    
    if (!id) {
      console.error('API: отсутствует ID для удаления направления');
      return { error: new Error('Отсутствует ID направления для удаления') };
    }
    
    try {
      const { error } = await supabase
        .from('directions')
        .delete()
        .eq('id', id);
        
      console.log('API: результат удаления направления. Ошибка:', error);
      return { error };
    } catch (err) {
      console.error('API: исключение при удалении направления:', err);
      return { error: err };
    }
  }
}

// Функции для работы с профилями
export const profiles = {
  // Получить все профили
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, direction:direction_id(*)')
      .order('name')

    return { data, error }
  },

  // Получить профиль по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, direction:direction_id(*)')
      .eq('id', id)
      .single()

    return { data, error }
  },
  
  // Получить профили по ID направления
  async getByDirectionId(directionId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('direction_id', directionId)
      .order('name')

    return { data, error }
  },
  
  // Создать новый профиль
  async create(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()
      
    return { data, error }
  },
  
  // Обновить профиль
  async update(id, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single()
      
    return { data, error }
  },
  
  // Удалить профиль
  async delete(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      
    return { error }
  }
}

// Функции для работы со специальностями
export const specialties = {
  // Получить все специальности
  async getAll() {
    const { data, error } = await supabase
      .from('specialties')
      .select('*, profile:profile_id(*)')
      .order('name')

    return { data, error }
  },

  // Получить специальность по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('specialties')
      .select('*, profile:profile_id(*)')
      .eq('id', id)
      .single()

    return { data, error }
  },
  
  // Получить специальности по ID профиля
  async getByProfileId(profileId) {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('profile_id', profileId)
      .order('name')

    return { data, error }
  },
  
  // Создать новую специальность
  async create(specialtyData) {
    const { data, error } = await supabase
      .from('specialties')
      .insert(specialtyData)
      .select()
      .single()
      
    return { data, error }
  },
  
  // Обновить специальность
  async update(id, specialtyData) {
    const { data, error } = await supabase
      .from('specialties')
      .update(specialtyData)
      .eq('id', id)
      .select()
      .single()
      
    return { data, error }
  },
  
  // Удалить специальность
  async delete(id) {
    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id)
      
    return { error }
  }
}

// Функции для работы с заявками
export const applications = {
  // Получить все заявки текущего пользователя
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
          direction:direction_id(id, name),
          user:user_id(id, first_name, last_name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error }
    } catch (err) {
      console.error('Ошибка получения заявок:', err)
      return { data: null, error: err }
    }
  },

  // Получить одну заявку по ID
  async getById(id) {
    try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
          direction:direction_id(id, name),
          user:user_id(id, first_name, last_name, email),
          documents:id(id, document_type_id, file_path, updated_at, document_type:document_type_id(id, name))
      `)
      .eq('id', id)
      .single()

    return { data, error }
    } catch (err) {
      console.error('Ошибка получения заявки:', err)
      return { data: null, error: err }
    }
  },

  // Получить статистику по заявкам
  async getStatistics() {
    try {
      // Получаем статистику по дням за последний месяц
      const { data: dailyStats, error: dailyError } = await supabase
        .rpc('get_applications_daily_stats')

      // Получаем статистику по направлениям
      const { data: directionStats, error: directionError } = await supabase
        .rpc('get_applications_by_direction')

      // Получаем статистику по статусам
      const { data: statusStats, error: statusError } = await supabase
        .rpc('get_applications_by_status')

      if (dailyError || directionError || statusError) {
        throw new Error(dailyError?.message || directionError?.message || statusError?.message);
      }

      return { 
        data: {
          dailyStats: dailyStats || [],
          directionStats: directionStats || [],
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    try {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...applicationData,
        user_id: user.id,
          status: 'draft' // Черновик
      })
      .select()
      .single()

    return { data, error }
    } catch (err) {
      console.error('Ошибка создания заявки:', err)
      return { data: null, error: err }
    }
  },

  // Обновить заявку
  async update(id, applicationData) {
    const { data, error } = await supabase
      .from('applications')
      .update(applicationData)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Отправить заявку на рассмотрение
  async submit(id) {
    // Получаем ID статуса "подана"
    const { data: statusData } = await supabase
      .from('application_statuses')
      .select('id')
      .eq('name', 'submitted')
      .single()

    if (!statusData) return { data: null, error: new Error('Не удалось получить статус заявки') }

    const { data, error } = await supabase
      .from('applications')
      .update({ status_id: statusData.id })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }
}

// Функции для работы с документами
export const documents = {
  // Получить документы по ID заявки
  async getByApplicationId(applicationId) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_type:document_types(*)
      `)
      .eq('application_id', applicationId)

    return { data, error }
  },

  // Загрузить новый документ
  async upload(applicationId, documentTypeId, file) {
    // Получаем данные о текущем пользователе
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    // Загружаем файл в Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${applicationId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('application_documents')
      .upload(filePath, file)

    if (uploadError) return { data: null, error: uploadError }

    // Получаем публичную ссылку на файл
    const { data: { publicUrl } } = supabase.storage
      .from('application_documents')
      .getPublicUrl(filePath)

    // Создаем запись о документе в БД
    const { data, error } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        document_type_id: documentTypeId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        updated_at: new Date()
      })
      .select()
      .single()

    return { data, error, publicUrl }
  },

  // Получить типы документов
  async getTypes() {
    const { data, error } = await supabase
      .from('document_types')
      .select('*')
      .order('name')

    return { data, error }
  },

  // Обновить документ
  async update(documentId, documentData) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        document_type_id: documentData.document_type_id,
        file_path: documentData.file_path,
        updated_at: new Date()
      })
      .eq('id', documentId)
      .select();

    return { data, error }
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

// Функции для взаимодействия с API администратора (удалены, так как функциональность администратора больше не поддерживается)

export default {
  supabase,
  auth,
  users,
  applications,
  directions,
  profiles,
  specialties,
  documents,
  excelExport
} 