import { appApi } from './app-api';

// Функции для работы с образовательными программами
export const programs = {
  // Получить все программы с их профилями/специализациями и предметами
  async getAllWithTracksAndSubjects() {
    const { data, error } = await appApi
      .from('programs')
      .select(`
        *,
        program_tracks(*),
        program_subjects(*, subject:subject_id(*))
      `)
      .order('name');
    return { data, error };
  },
  
  // Получить все программы с их профилями/специализациями
  async getAllWithTracks() {
    const { data, error } = await appApi
      .from('programs')
      .select(`
        *,
        program_tracks(*)
      `)
      .order('name');
    return { data, error };
  },
  
  // Получить одну программу по ID
  async getById(id) {
    const { data, error } = await appApi
      .from('programs')
      .select(`
        *,
        program_tracks(*),
        program_subjects(*, subject:subject_id(*))
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Создать новую программу
  async create(programData) {
    // Удаляем id, чтобы база данных могла его сгенерировать
    const { id, ...dataToCreate } = programData; 
    return appApi.from('programs').insert(dataToCreate).select().single();
  },

  // Обновить программу
  async update(id, programData) {
    return appApi.from('programs').update(programData).eq('id', id).select().single();
  },

  // Удалить программу
  async delete(id) {
    const { error } = await appApi
      .from('programs')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// Функции для работы с профилями/специализациями
export const programTracks = {
  // Создать новый профиль/специализацию
  async create(trackData) {
    const { data, error } = await appApi
      .from('program_tracks')
      .insert(trackData)
      .select()
      .single();
    return { data, error };
  },

  // Обновить профиль/специализацию
  async update(id, trackData) {
    const { data, error } = await appApi
      .from('program_tracks')
      .update(trackData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Удалить профиль/специализацию
  async delete(id) {
    const { error } = await appApi
      .from('program_tracks')
      .delete()
      .eq('id', id);
    return { error };
  }
};


// Функции для работы с предметами для программ
export const programSubjects = {
  // Сохранить предметы для программы
  async saveForProgram(programId, subjectsToSave) {
    // Сначала удаляем все существующие предметы для данной программы
    await appApi.from('program_subjects').delete().eq('program_id', programId);
    
    // Если нет новых предметов для сохранения, просто выходим
    if (!subjectsToSave || subjectsToSave.length === 0) {
      return { data: [], error: null };
    }

    // Добавляем новые предметы
    const subjectsWithProgramId = subjectsToSave.map(s => ({
      program_id: programId,
      subject_id: s.subject_id,
      min_score: s.min_score,
      exam_form: s.exam_form,
      is_mandatory: s.is_mandatory,
      order_index: s.order_index
    }));

    return appApi.from('program_subjects').insert(subjectsWithProgramId).select();
  }
}; 