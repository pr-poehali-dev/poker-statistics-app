import { createClient } from '@supabase/supabase-js';

// Эти переменные нужно будет заменить на реальные из вашего Supabase проекта
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Создание клиента Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          total_games: number;
          total_wins: number;
          win_rate: number;
          favorite_combination: string | null;
          best_dealer: string | null;
          total_buy_ins: number;
          total_buy_in_chips: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          total_games?: number;
          total_wins?: number;
          win_rate?: number;
          favorite_combination?: string | null;
          best_dealer?: string | null;
          total_buy_ins?: number;
          total_buy_in_chips?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          total_games?: number;
          total_wins?: number;
          win_rate?: number;
          favorite_combination?: string | null;
          best_dealer?: string | null;
          total_buy_ins?: number;
          total_buy_in_chips?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          starting_stack: number;
          small_blind: number;
          big_blind: number;
          chip_to_ruble: number;
          start_time: string;
          end_time: string | null;
          status: 'active' | 'finished' | 'paused';
          game_duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          starting_stack?: number;
          small_blind?: number;
          big_blind?: number;
          chip_to_ruble?: number;
          start_time?: string;
          end_time?: string | null;
          status?: 'active' | 'finished' | 'paused';
          game_duration?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          starting_stack?: number;
          small_blind?: number;
          big_blind?: number;
          chip_to_ruble?: number;
          start_time?: string;
          end_time?: string | null;
          status?: 'active' | 'finished' | 'paused';
          game_duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_players: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          joined_at?: string;
        };
      };
      rounds: {
        Row: {
          id: string;
          game_id: string;
          round_number: number;
          dealer_id: string;
          combination: string;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          round_number: number;
          dealer_id: string;
          combination: string;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          round_number?: number;
          dealer_id?: string;
          combination?: string;
          comment?: string | null;
          created_at?: string;
        };
      };
      round_winners: {
        Row: {
          id: string;
          round_id: string;
          player_id: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          player_id: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          player_id?: string;
        };
      };
      buy_ins: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          chips_amount: number;
          ruble_amount: number;
          buy_in_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          chips_amount?: number;
          ruble_amount: number;
          buy_in_number?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          chips_amount?: number;
          ruble_amount?: number;
          buy_in_number?: number;
          created_at?: string;
        };
      };
      game_results: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          final_chips: number;
          total_buy_ins: number;
          total_buy_in_chips: number;
          total_buy_in_rubles: number;
          final_rubles: number;
          profit_loss: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          final_chips?: number;
          total_buy_ins?: number;
          total_buy_in_chips?: number;
          total_buy_in_rubles?: number;
          final_rubles?: number;
          profit_loss?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          final_chips?: number;
          total_buy_ins?: number;
          total_buy_in_chips?: number;
          total_buy_in_rubles?: number;
          final_rubles?: number;
          profit_loss?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Типизированный клиент
export type SupabaseClient = typeof supabase;