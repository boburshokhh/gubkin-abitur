import { supabase } from './supabase';

/**
 * API для работы со статистикой приёмной кампании
 * Все функции публичные и доступны без регистрации
 */

// Общая статистика заявлений (публичная)
export async function getGeneralStats() {
  try {
    const { data, error } = await supabase.rpc('get_public_general_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || {}
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// Статистика по датам подачи документов (публичная)
export async function getDailyStats(daysLimit = 30) {
  try {
    const { data, error } = await supabase.rpc('get_public_daily_stats', {
      p_days_limit: daysLimit
    });
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по регионам (публичная)
export async function getRegionalStats() {
  try {
    const { data, error } = await supabase.rpc('get_public_regional_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по профилям/программам (публичная)
export async function getProgramStats() {
  try {
    const { data, error } = await supabase.rpc('get_public_program_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Статистика по статусам заявлений (публичная)
export async function getStatusStats() {
  try {
    const { data, error } = await supabase.rpc('get_public_status_stats');
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
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
      programResult,
      statusResult
    ] = await Promise.all([
      getGeneralStats(),
      getDailyStats(),
      getRegionalStats(),
      getProgramStats(),
      getStatusStats()
    ]);
    
    return {
      success: true,
      data: {
        general: generalResult.data,
        daily: dailyResult.data,
        regional: regionalResult.data,
        programs: programResult.data,
        status: statusResult.data
      },
      errors: [
        ...(generalResult.success ? [] : [generalResult.error]),
        ...(dailyResult.success ? [] : [dailyResult.error]),
        ...(regionalResult.success ? [] : [regionalResult.error]),
        ...(programResult.success ? [] : [programResult.error]),
        ...(statusResult.success ? [] : [statusResult.error])
      ]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}





 