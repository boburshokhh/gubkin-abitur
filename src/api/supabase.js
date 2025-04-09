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
  // Регистрация нового пользователя
  async signUp({ email, password, firstName, lastName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    })
    return { data, error }
  },

  // Получение сессии пользователя
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error }
  },

  // Отправка кода подтверждения email
  async sendEmailVerification(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      }
    })
    return { data, error }
  },

  // Отправка кода подтверждения email с OTP (без перехода по ссылке)
  async sendOtpToEmail(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Не указываем emailRedirectTo для получения только OTP кода
        shouldCreateUser: false // Не создавать нового пользователя, только отправить код
      }
    })
    return { data, error }
  },

  // Подтверждение email по коду
  async verifyOtp(email, token, type = 'email') {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })
    return { data, error }
  },

  // Вход пользователя
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Выход пользователя
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Получение текущего пользователя
  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  // Сброс пароля
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`
    })
    return { data, error }
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
    const { data, error } = await supabase
      .from('directions')
      .select('*')
      .eq('is_active', true)
      .order('name')

    return { data, error }
  },

  // Получить направление по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('directions')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }
}

// Функции для работы с заявками
export const applications = {
  // Получить все заявки текущего пользователя
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        direction:directions(*),
        status:application_statuses(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Получить заявку по ID
  async getById(id) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        direction:directions(*),
        status:application_statuses(*),
        documents:documents(
          *,
          document_type:document_types(*)
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Создать новую заявку
  async create(applicationData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('Пользователь не аутентифицирован') }

    // Получаем ID статуса "черновик"
    const { data: statusData } = await supabase
      .from('application_statuses')
      .select('id')
      .eq('name', 'draft')
      .single()

    if (!statusData) return { data: null, error: new Error('Не удалось получить статус заявки') }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        ...applicationData,
        user_id: user.id,
        status_id: statusData.id
      })
      .select()
      .single()

    return { data, error }
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
        file_type: file.type
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
  }
}

// Функции для взаимодействия с API администратора (удалены, так как функциональность администратора больше не поддерживается)

export default {
  supabase,
  auth,
  users,
  applications,
  directions,
  documents
} 