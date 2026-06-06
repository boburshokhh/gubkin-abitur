import { appApi } from './app-api';

// --- Education Levels ---
export const levels = {
  async getAll() {
    const { data, error } = await appApi
      .from('education_levels')
      .select('*')
      .order('id');
    if (error) console.error('Error fetching education levels:', error);
    return { data, error };
  },
};

// --- Directions ---
export const directions = {
  async getAll() {
    const { data, error } = await appApi
      .from('directions')
      .select('*, level:level_id(name)')
      .order('name');
    if (error) console.error('Error fetching directions:', error);
    return { data, error };
  },
  async getByLevel(levelId) {
    const { data, error } = await appApi
      .from('directions')
      .select('*')
      .eq('level_id', levelId)
      .order('name');
    if (error) console.error('Error fetching directions by level:', error);
    return { data, error };
  },
  async create(directionData) {
    const { data, error } = await appApi.from('directions').insert(directionData).select().single();
    if (error) console.error('Error creating direction:', error);
    return { data, error };
  },
  async update(id, directionData) {
    const { data, error } = await appApi.from('directions').update(directionData).eq('id', id).select().single();
    if (error) console.error('Error updating direction:', error);
    return { data, error };
  },
  async delete(id) {
    const { error } = await appApi.from('directions').delete().eq('id', id);
    if (error) console.error('Error deleting direction:', error);
    return { error };
  }
};

// --- Profiles & Exams ---
export const profiles = {
  async getAllWithDetails() {
    const { data, error } = await appApi
      .from('profiles')
      .select(`
        *,
        direction:direction_id (
          name,
          code,
          level:level_id (name)
        ),
        profile_exams (
          priority,
          subject:subject_id (name)
        )
      `)
      .order('name');
    if (error) console.error('Error fetching profiles with details:', error);
    return { data, error };
  },
  
  async getById(id) {
    const { data, error } = await appApi
      .from('profiles')
      .select(`
        *,
        direction:direction_id (
          *,
          level:level_id (*)
        ),
        profile_exams (
          *,
          subject:subject_id (*)
        )
      `)
      .eq('id', id)
      .single();
    if (error) console.error('Error fetching profile by id:', error);
    return { data, error };
  },

  async getByDirection(directionId) {
    const { data, error } = await appApi
      .from('profiles')
      .select('*')
      .eq('direction_id', directionId)
      .order('name');
    if (error) console.error('Error fetching profiles by direction:', error);
    return { data, error };
  },

  // Получить профили с таким же набором экзаменов
  async getWithSameExams(profileId) {
    try {
      const { data, error } = await appApi
        .rpc('get_profiles_with_same_exams', { profile_id_param: profileId });
      
      if (error) {
        console.error('Ошибка получения профилей с одинаковыми экзаменами:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка получения профилей с одинаковыми экзаменами:', err);
      return { data: null, error: err };
    }
  },

  // Получить экзамены профиля
  async getExams(profileId) {
    try {
      const { data, error } = await appApi
        .rpc('get_profile_exams', { profile_id_param: profileId });
      
      if (error) {
        console.error('Ошибка получения экзаменов профиля:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка получения экзаменов профиля:', err);
      return { data: null, error: err };
    }
  },

  // Проверить, что все выборы абитуриента имеют одинаковый набор экзаменов
  async validateChoices(applicationId) {
    try {
      const { data, error } = await appApi
        .rpc('validate_application_choices', { application_id_param: applicationId });
      
      if (error) {
        console.error('Ошибка проверки выборов абитуриента:', error);
        return { valid: false, error };
      }
      
      return { valid: data, error: null };
    } catch (err) {
      console.error('Ошибка проверки выборов абитуриента:', err);
      return { valid: false, error: err };
    }
  },

  async create(profileData) {
    const payload = normalizeProfilePayload(profileData);
    const { data, error } = await appApi.from('profiles').insert(payload).select().single();
    if (error) {
        console.error('Error creating profile:', error);
        return { data, error };
    }
    return { data, error };
  },

  async update(id, profileData) {
    const payload = normalizeProfilePayload(profileData);
    const { data, error } = await appApi.from('profiles').update(payload).eq('id', id).select().single();
    if (error) {
        console.error('Error updating profile:', error);
        return { data, error };
    }
    return { data, error };
  },

  async delete(id) {
    const { error } = await appApi.from('profiles').delete().eq('id', id);
    if (error) console.error('Error deleting profile:', error);
    return { error };
  },

  async saveExams(profileId, exams) {
    // First, delete old exams for this profile
    const { error: deleteError } = await appApi.from('profile_exams').delete().eq('profile_id', profileId);
    if (deleteError) {
        console.error('Error deleting old exams:', deleteError);
        return { error: deleteError };
    }
    // Then, insert new ones if any
    if (exams.length > 0) {
        const examsToInsert = exams.map(exam => ({
            profile_id: profileId,
            subject_id: exam.subject_id,
            priority: exam.priority,
            min_score: exam.min_score || null
        }));
        const { error: insertError } = await appApi.from('profile_exams').insert(examsToInsert);
        if (insertError) {
            console.error('Error inserting new exams:', insertError);
            return { error: insertError };
        }
    }
    return { error: null };
  },

  // Получить статистику по программам обучения
  async getApplicationStats(academicYear) {
    try {
      const { data, error } = await appApi.rpc('get_program_application_stats', {
        p_academic_year: academicYear || null
      });
      
      if (error) {
        console.error('Ошибка получения статистики по программам:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка получения статистики по программам:', err);
      return { data: null, error: err };
    }
  }
};

function normalizeProfilePayload(profileData) {
  return {
    direction_id: profileData.direction_id,
    name: profileData.name,
    description: profileData.description || null,
    exams: (profileData.exams || [])
      .filter(exam => exam.subject_id)
      .map((exam, index) => ({
        subject_id: exam.subject_id,
        priority: exam.priority || index + 1
      }))
  };
}

// --- Subjects ---
export const subjects = {
    async getAll() {
        const { data, error } = await appApi
            .from('subjects')
            .select('*')
            .order('name');
        if (error) console.error('Error fetching subjects:', error);
        return { data, error };
    }
}

// --- Trends Analysis ---
export const trends = {
  // Получить анализ трендов за несколько лет
  async getAnalysis(yearsCount = 3) {
    try {
      const { data, error } = await appApi.rpc('get_trends_analysis', {
        p_years_count: yearsCount
      });
      
      if (error) {
        console.error('Ошибка получения анализа трендов:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Ошибка получения анализа трендов:', err);
      return { data: null, error: err };
    }
  }
}; 