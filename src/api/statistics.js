import { supabase } from './supabase';

/**
 * API для работы со статистикой приёмной кампании
 */

// Общая статистика заявлений
export async function getGeneralStats() {
  try {
    const { data, error } = await supabase.rpc('get_general_applications_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data && data.length > 0 ? data[0] : {}
    };
  } catch (error) {
    console.error('Ошибка получения общей статистики:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// Статистика по датам подачи документов
export async function getDailyStats(startDate = '2024-01-01', endDate = null) {
  try {
    const { data, error } = await supabase.rpc('get_applications_daily_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Ошибка получения статистики по датам:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по регионам
export async function getRegionalStats() {
  try {
    const { data, error } = await supabase.rpc('get_regional_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Ошибка получения региональной статистики:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по направлениям обучения
export async function getDirectionsStats() {
  try {
    const { data, error } = await supabase.rpc('get_directions_applications_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Ошибка получения статистики по направлениям:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по статусам заявлений
export async function getStatusStats() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        status_id,
        application_statuses(name, color)
      `);
    
    if (error) throw error;
    
    // Группируем по статусам
    const statusCounts = data.reduce((acc, app) => {
      const statusName = app.application_statuses.name;
      const statusColor = app.application_statuses.color;
      
      if (!acc[statusName]) {
        acc[statusName] = {
          name: statusName,
          color: statusColor,
          count: 0
        };
      }
      
      acc[statusName].count++;
      return acc;
    }, {});
    
    return {
      success: true,
      data: Object.values(statusCounts)
    };
  } catch (error) {
    console.error('Ошибка получения статистики по статусам:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по возрасту абитуриентов
export async function getAgeStats() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        users!inner(birth_date)
      `);
    
    if (error) throw error;
    
    // Вычисляем возрастные группы
    const ageGroups = {
      '17-18': 0,
      '19-20': 0,
      '21-22': 0,
      '23-25': 0,
      '26+': 0
    };
    
    const currentYear = new Date().getFullYear();
    
    data.forEach(app => {
      if (app.users?.birth_date) {
        const birthYear = new Date(app.users.birth_date).getFullYear();
        const age = currentYear - birthYear;
        
        if (age >= 17 && age <= 18) ageGroups['17-18']++;
        else if (age >= 19 && age <= 20) ageGroups['19-20']++;
        else if (age >= 21 && age <= 22) ageGroups['21-22']++;
        else if (age >= 23 && age <= 25) ageGroups['23-25']++;
        else if (age >= 26) ageGroups['26+']++;
      }
    });
    
    return {
      success: true,
      data: Object.entries(ageGroups).map(([range, count]) => ({
        age_range: range,
        count
      }))
    };
  } catch (error) {
    console.error('Ошибка получения возрастной статистики:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по гендеру
export async function getGenderStats() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        users!inner(gender)
      `);
    
    if (error) throw error;
    
    // Подсчитываем по полу
    const genderCounts = data.reduce((acc, app) => {
      const gender = app.users?.gender;
      if (gender) {
        acc[gender] = (acc[gender] || 0) + 1;
      }
      return acc;
    }, {});
    
    return {
      success: true,
      data: Object.entries(genderCounts).map(([gender, count]) => ({
        gender: gender === 'male' ? 'Мужской' : gender === 'female' ? 'Женский' : 'Не указан',
        count
      }))
    };
  } catch (error) {
    console.error('Ошибка получения статистики по полу:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика документов
export async function getDocumentsStats() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        document_type_id,
        status,
        document_types(name)
      `);
    
    if (error) throw error;
    
    // Группируем по типам документов и статусам
    const documentStats = data.reduce((acc, doc) => {
      const typeName = doc.document_types?.name || 'Неизвестный тип';
      const status = doc.status;
      
      if (!acc[typeName]) {
        acc[typeName] = {
          type: typeName,
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0
        };
      }
      
      acc[typeName][status] = (acc[typeName][status] || 0) + 1;
      acc[typeName].total++;
      
      return acc;
    }, {});
    
    return {
      success: true,
      data: Object.values(documentStats)
    };
  } catch (error) {
    console.error('Ошибка получения статистики документов:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Получение всех статистических данных одним запросом
export async function getAllStats() {
  try {
    const [
      generalResult,
      dailyResult,
      regionalResult,
      directionsResult,
      statusResult
    ] = await Promise.all([
      getGeneralStats(),
      getDailyStats(),
      getRegionalStats(),
      getDirectionsStats(),
      getStatusStats()
    ]);
    
    return {
      success: true,
      data: {
        general: generalResult.data,
        daily: dailyResult.data,
        regional: regionalResult.data,
        directions: directionsResult.data,
        statuses: statusResult.data
      },
      errors: [
        ...(generalResult.success ? [] : [generalResult.error]),
        ...(dailyResult.success ? [] : [dailyResult.error]),
        ...(regionalResult.success ? [] : [regionalResult.error]),
        ...(directionsResult.success ? [] : [directionsResult.error]),
        ...(statusResult.success ? [] : [statusResult.error])
      ]
    };
  } catch (error) {
    console.error('Ошибка получения всей статистики:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// Детальная статистика по регионам
export async function getDetailedRegionalStats() {
  try {
    const { data, error } = await supabase.rpc('get_detailed_regional_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Ошибка получения детальной региональной статистики:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Рейтинги регионов по различным метрикам
export async function getRegionalRankings() {
  try {
    const { data, error } = await supabase.rpc('get_regional_rankings');
    
    if (error) throw error;
    
    // Группируем данные по типу рейтинга
    const rankings = data.reduce((acc, item) => {
      if (!acc[item.ranking_type]) {
        acc[item.ranking_type] = [];
      }
      acc[item.ranking_type].push({
        region_name: item.region_name,
        region_code: item.region_code,
        metric_value: item.metric_value,
        rank_position: item.rank_position
      });
      return acc;
    }, {});
    
    return {
      success: true,
      data: rankings
    };
  } catch (error) {
    console.error('Ошибка получения рейтингов регионов:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// Расширенная аналитика
export async function getAdvancedAnalytics() {
  try {
    const { data, error } = await supabase.rpc('get_advanced_analytics');
    
    if (error) throw error;
    
    // Группируем данные по категориям
    const analytics = data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({
        name: item.metric_name,
        value: item.metric_value,
        description: item.metric_description
      });
      return acc;
    }, {});
    
    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    console.error('Ошибка получения расширенной аналитики:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// Временные интервалы статистики
export async function getTimeIntervalStats(intervalType = 'day', startDate = '2024-01-01', endDate = null) {
  try {
    const currentDate = endDate || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc('get_time_interval_stats', {
      interval_type: intervalType,
      start_date: startDate,
      end_date: currentDate
    });
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Ошибка получения статистики по временным интервалам:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Экспорт статистики в формате для Excel
export async function getStatsForExport() {
  try {
    const [
      generalResult,
      dailyResult,
      regionalResult,
      directionsResult,
      detailedRegionalResult,
      advancedAnalyticsResult
    ] = await Promise.all([
      getGeneralStats(),
      getDailyStats(),
      getRegionalStats(),
      getDirectionsStats(),
      getDetailedRegionalStats(),
      getAdvancedAnalytics()
    ]);
    
    if (!generalResult.success) {
      throw new Error('Не удалось получить данные статистики');
    }
    
    const { general, daily, regional, directions } = {
      general: generalResult.data,
      daily: dailyResult.data || [],
      regional: regionalResult.data || [],
      directions: directionsResult.data || []
    };
    
    // Формируем данные для экспорта
    const exportData = {
      summary: {
        'Всего заявлений': general.total_applications || 0,
        'Всего пользователей': general.total_users || 0,
        'На рассмотрении': general.pending_applications || 0,
        'Принято': general.accepted_applications || 0,
        'Отклонено': general.rejected_applications || 0,
        'Бюджет': general.budget_applications || 0,
        'Платно': general.paid_applications || 0,
        'Очно': general.full_time_applications || 0,
        'Заочно': general.part_time_applications || 0,
        'Нужно общежитие': general.accommodation_needed || 0,
        'Участники олимпиад': general.olympiad_participants || 0
      },
      dailyStats: daily.map(item => ({
        'Дата': item.date,
        'Всего заявлений': item.total_applications,
        'Новые заявления': item.new_applications,
        'Принято': item.accepted_applications,
        'Отклонено': item.rejected_applications
      })),
      regionalStats: regional.map(item => ({
        'Регион': item.region_name,
        'Код региона': item.region_code,
        'Всего заявлений': item.total_applications,
        'Принято': item.accepted_applications,
        'Отклонено': item.rejected_applications,
        'На рассмотрении': item.pending_applications
      })),
      directionsStats: directions.map(item => ({
        'Направление': item.direction_name,
        'Код направления': item.direction_code,
        'Область': item.direction_field,
        'Всего заявлений': item.total_applications,
        'Бюджет': item.budget_applications,
        'Платно': item.paid_applications,
        'Принято': item.accepted_applications,
        'Отклонено': item.rejected_applications
      })),
      // Детальная региональная статистика
      detailedRegionalStats: detailedRegionalResult.success ? detailedRegionalResult.data.map(item => ({
        'Регион': item.region_name,
        'Код региона': item.region_code,
        'Всего заявлений': item.total_applications,
        'Принято': item.accepted_applications,
        'Отклонено': item.rejected_applications,
        'На рассмотрении': item.pending_applications,
        'Бюджет': item.budget_applications,
        'Платно': item.paid_applications,
        'Нужно общежитие': item.accommodation_needed,
        'Участники олимпиад': item.olympiad_participants,
        'Процент принятых': item.acceptance_rate,
        'Популярное направление': item.most_popular_direction,
        'Средний возраст': item.avg_age || 'Нет данных',
        'Мужчин': item.male_count,
        'Женщин': item.female_count
      })) : [],
      // Расширенная аналитика
      advancedAnalytics: advancedAnalyticsResult.success ? 
        Object.entries(advancedAnalyticsResult.data).flatMap(([category, metrics]) =>
          metrics.map(metric => ({
            'Категория': category,
            'Метрика': metric.name,
            'Значение': metric.value,
            'Описание': metric.description
          }))
        ) : []
    };
    
    return {
      success: true,
      data: exportData
    };
  } catch (error) {
    console.error('Ошибка подготовки данных для экспорта:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
} 