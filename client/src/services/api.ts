const BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nutricare_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new ApiError(errorMsg, response.status);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),

  // Profile & User
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: any) => request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: () => request<any>('/users/account', { method: 'DELETE' }),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),

  // Body Measurements
  getBodyMeasurements: () => request<any>('/body-measurements'),
  createBodyMeasurement: (data: any) => request<any>('/body-measurements', { method: 'POST', body: JSON.stringify(data) }),
  updateBodyMeasurement: (id: string, data: any) => request<any>(`/body-measurements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBodyMeasurement: (id: string) => request<any>(`/body-measurements/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: (limit = 50) => request<any>(`/activities?limit=${limit}`),
  createActivity: (data: any) => request<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: any) => request<any>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => request<any>(`/activities/${id}`, { method: 'DELETE' }),
  getActivityDailySummary: (date?: string) => request<any>(`/activities/daily-summary${date ? `?date=${date}` : ''}`),
  getActivityHistory: (days = 7) => request<any>(`/activities/history?days=${days}`),

  // Workouts
  getWorkouts: () => request<any>('/workouts'),
  getWorkoutById: (id: string) => request<any>(`/workouts/${id}`),
  createWorkout: (data: any) => request<any>('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkout: (id: string, data: any) => request<any>(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkout: (id: string) => request<any>(`/workouts/${id}`, { method: 'DELETE' }),

  // Heart Rate
  getHeartRate: () => request<any>('/heart-rate'),
  createHeartRate: (data: any) => request<any>('/heart-rate', { method: 'POST', body: JSON.stringify(data) }),
  deleteHeartRate: (id: string) => request<any>(`/heart-rate/${id}`, { method: 'DELETE' }),

  // Sleep
  getSleepRecords: () => request<any>('/sleep'),
  createSleepRecord: (data: any) => request<any>('/sleep', { method: 'POST', body: JSON.stringify(data) }),
  updateSleepRecord: (id: string, data: any) => request<any>(`/sleep/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSleepRecord: (id: string) => request<any>(`/sleep/${id}`, { method: 'DELETE' }),

  // Nutrition & Foods
  getFoods: (params?: { q?: string; category?: string; classification?: string }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.append('q', params.q);
    if (params?.category) sp.append('category', params.category);
    if (params?.classification) sp.append('classification', params.classification);
    return request<any>(`/foods?${sp.toString()}`);
  },
  createCustomFood: (data: any) => request<any>('/foods/custom', { method: 'POST', body: JSON.stringify(data) }),
  getMeals: (date?: string) => request<any>(`/meals${date ? `?date=${date}` : ''}`),
  createMeal: (data: any) => request<any>('/meals', { method: 'POST', body: JSON.stringify(data) }),
  updateMeal: (id: string, data: any) => request<any>(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeal: (id: string) => request<any>(`/meals/${id}`, { method: 'DELETE' }),
  getNutritionSummary: (date?: string) => request<any>(`/nutrition/daily-summary${date ? `?date=${date}` : ''}`),

  // Diet Plans
  getDietPlans: () => request<any>('/diet-plans'),
  generateDietPlan: (data: any) => request<any>('/diet-plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  deleteDietPlan: (id: string) => request<any>(`/diet-plans/${id}`, { method: 'DELETE' }),

  // Hydration
  getWater: (date?: string) => request<any>(`/water${date ? `?date=${date}` : ''}`),
  createWaterEntry: (data: any) => request<any>('/water', { method: 'POST', body: JSON.stringify(data) }),
  updateWaterEntry: (id: string, data: any) => request<any>(`/water/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWaterEntry: (id: string) => request<any>(`/water/${id}`, { method: 'DELETE' }),

  // Wellness
  getWellnessLogs: () => request<any>('/wellness'),
  createWellnessLog: (data: any) => request<any>('/wellness', { method: 'POST', body: JSON.stringify(data) }),
  updateWellnessLog: (id: string, data: any) => request<any>(`/wellness/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWellnessLog: (id: string) => request<any>(`/wellness/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () => request<any>('/goals'),
  createGoal: (data: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => request<any>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request<any>(`/goals/${id}`, { method: 'DELETE' }),

  // Reports
  getWeeklyReport: () => request<any>('/reports/weekly'),
  getMonthlyReport: () => request<any>('/reports/monthly'),
  downloadCsvReport: async () => {
    const token = localStorage.getItem('nutricare_token');
    const response = await fetch(`${BASE_URL}/reports/export`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) throw new Error('Failed to export CSV');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutricare-health-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadJsonArchive: async () => {
    const token = localStorage.getItem('nutricare_token');
    const response = await fetch(`${BASE_URL}/users/export-all`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!response.ok) throw new Error('Failed to export JSON');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutricare-complete-archive-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Data Sources & CSV Import
  getDataSources: () => request<any>('/data-sources'),
  importCsvData: (dataType: 'measurements' | 'activities', csvContent: string) =>
    request<any>('/data-sources/import-csv', {
      method: 'POST',
      body: JSON.stringify({ dataType, csvContent })
    }),
  syncDataSource: (provider: string) => request<any>('/data-sources/sync', { method: 'POST', body: JSON.stringify({ provider }) })
};
