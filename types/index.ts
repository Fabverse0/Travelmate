export type TravelerType = 'backpacker' | 'family' | 'honeymoon' | 'kuliner' | 'umum'
export type BudgetRange = 'hemat' | 'menengah' | 'mewah'
export type LanguageStyle = 'formal' | 'santai'
export type TripStatus = 'draft' | 'final'
export type ChatRole = 'user' | 'assistant'

export interface UserPreferences {
  id: string
  user_id: string
  traveler_type: TravelerType
  budget_range: BudgetRange
  food_pref: string | null
  language_style: LanguageStyle
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: ChatRole
  content: string
  trip_id: string | null
  created_at: string
  itinerary?: ChatAPIResponse['itinerary'] | null
  trip?: Trip | null
}

export interface TripActivity {
  id: string
  trip_day_id: string
  sequence: number
  time: string | null
  location_name: string
  activity_description: string | null
  estimated_cost: number
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface TripDay {
  id: string
  trip_id: string
  day_number: number
  date: string | null
  activities: TripActivity[]
}

export interface Trip {
  id: string
  user_id: string
  title: string
  destination: string
  total_budget: number | null
  start_date: string | null
  end_date: string | null
  status: TripStatus
  days?: TripDay[]
  created_at: string
}

// API Response Types
export interface ChatAPIResponse {
  reply: string
  itinerary: {
    trip_id: string
    destination: string
    days: Array<{
      day_number: number
      activities: Array<{
        time: string
        location_name: string
        activity_description: string
        estimated_cost: number
        latitude?: number
        longitude?: number
      }>
    }>
    total_budget_estimate: number
  } | null
}

export interface TripListResponse {
  trips: Array<{
    id: string
    title: string
    destination: string
    start_date: string | null
    end_date: string | null
    total_budget: number | null
    status: TripStatus
  }>
}

export interface WeatherData {
  daily: {
    time: string[]
    weathercode: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

// Database Enums untuk Supabase
export const TravelerTypeEnum = ['backpacker', 'family', 'honeymoon', 'kuliner', 'umum'] as const
export const BudgetRangeEnum = ['hemat', 'menengah', 'mewah'] as const
export const LanguageStyleEnum = ['formal', 'santai'] as const
export const TripStatusEnum = ['draft', 'final'] as const
export const ChatRoleEnum = ['user', 'assistant'] as const