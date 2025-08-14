export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          employee_id: string | null
          id: string
          points: number | null
          reward_amount: number | null
          task_id: string | null
          title: string
          type: Database["public"]["Enums"]["achievement_type"] | null
        }
        Insert: {
          achievement_date?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          points?: number | null
          reward_amount?: number | null
          task_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["achievement_type"] | null
        }
        Update: {
          achievement_date?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          points?: number | null
          reward_amount?: number | null
          task_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["achievement_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_history: {
        Row: {
          analysis_type: string
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          model_used: string | null
          priority: number | null
          provider: string
          queue_status: string | null
          result_data: string | null
          success: boolean
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_used?: string | null
          priority?: number | null
          provider: string
          queue_status?: string | null
          result_data?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          model_used?: string | null
          priority?: number | null
          provider?: string
          queue_status?: string | null
          result_data?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_assistant_logs: {
        Row: {
          created_at: string | null
          event: string | null
          id: string
          payload: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string | null
          id?: string
          payload?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_commands_queue: {
        Row: {
          args: Json | null
          created_at: string | null
          id: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          args?: Json | null
          created_at?: string | null
          id?: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          args?: Json | null
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      budget_entries: {
        Row: {
          actual_amount: number
          category: string | null
          created_at: string
          created_by: string | null
          entry_date: string
          id: string
          notes: string | null
          objective_id: string
          planned_amount: number
          updated_at: string
        }
        Insert: {
          actual_amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          id?: string
          notes?: string | null
          objective_id: string
          planned_amount?: number
          updated_at?: string
        }
        Update: {
          actual_amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          id?: string
          notes?: string | null
          objective_id?: string
          planned_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_invitations: {
        Row: {
          created_at: string | null
          id: string
          invited_user_id: string
          inviter_id: string
          message: string | null
          responded_at: string | null
          status: string | null
          task_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_user_id: string
          inviter_id: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
          task_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_user_id?: string
          inviter_id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
          task_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          name: string
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance: {
        Row: {
          achievement_points: number | null
          created_at: string | null
          created_by: string | null
          employee_id: string
          feedback: string | null
          id: string
          performance_rating: number | null
          period_end: string
          period_start: string
          tasks_completed: number | null
          tasks_overdue: number | null
          total_hours: number | null
        }
        Insert: {
          achievement_points?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          feedback?: string | null
          id?: string
          performance_rating?: number | null
          period_end: string
          period_start: string
          tasks_completed?: number | null
          tasks_overdue?: number | null
          total_hours?: number | null
        }
        Update: {
          achievement_points?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          feedback?: string | null
          id?: string
          performance_rating?: number | null
          period_end?: string
          period_start?: string
          tasks_completed?: number | null
          tasks_overdue?: number | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["issue_severity"] | null
          status: string | null
          task_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"] | null
          status?: string | null
          task_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["issue_severity"] | null
          status?: string | null
          task_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          created_by: string | null
          current_value: number | null
          description: string | null
          id: string
          objective_id: string
          owner_id: string | null
          progress: number
          status: Database["public"]["Enums"]["kr_status"]
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          objective_id: string
          owner_id?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["kr_status"]
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          objective_id?: string
          owner_id?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["kr_status"]
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_hits: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          objective_id: string
          outlet: string | null
          published_at: string | null
          reach: number
          status: Database["public"]["Enums"]["media_status"]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          objective_id: string
          outlet?: string | null
          published_at?: string | null
          reach?: number
          status?: Database["public"]["Enums"]["media_status"]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          objective_id?: string
          outlet?: string | null
          published_at?: string | null
          reach?: number
          status?: Database["public"]["Enums"]["media_status"]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_hits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_hits_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          objective_id: string
          progress: number
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          objective_id: string
          progress?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          objective_id?: string
          progress?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          altitude_meters: number | null
          created_at: string
          created_by: string | null
          description: string | null
          drone_id: string | null
          end_time: string | null
          id: string
          name: string
          progress: number | null
          start_time: string | null
          status: string
          updated_at: string
          waypoints: number | null
        }
        Insert: {
          altitude_meters?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drone_id?: string | null
          end_time?: string | null
          id?: string
          name: string
          progress?: number | null
          start_time?: string | null
          status?: string
          updated_at?: string
          waypoints?: number | null
        }
        Update: {
          altitude_meters?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drone_id?: string | null
          end_time?: string | null
          id?: string
          name?: string
          progress?: number | null
          start_time?: string | null
          status?: string
          updated_at?: string
          waypoints?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "uav_drones"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          budget_planned: number | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          status: Database["public"]["Enums"]["objective_status"]
          strategic_importance: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_planned?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["objective_status"]
          strategic_importance?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_planned?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["objective_status"]
          strategic_importance?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          locale: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["employee_role"] | null
          salary: number | null
          telegram_username: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["employee_role"] | null
          salary?: number | null
          telegram_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["employee_role"] | null
          salary?: number | null
          telegram_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          likelihood: Database["public"]["Enums"]["risk_likelihood"]
          mitigation: string | null
          objective_id: string
          owner_id: string | null
          severity: Database["public"]["Enums"]["risk_severity"]
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          likelihood?: Database["public"]["Enums"]["risk_likelihood"]
          mitigation?: string | null
          objective_id: string
          owner_id?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          likelihood?: Database["public"]["Enums"]["risk_likelihood"]
          mitigation?: string | null
          objective_id?: string
          owner_id?: string | null
          severity?: Database["public"]["Enums"]["risk_severity"]
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_ai_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_bot: boolean
          language: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_bot?: boolean
          language?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_bot?: boolean
          language?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          language: string | null
          mentioned_users: string[] | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          mentioned_users?: string[] | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          mentioned_users?: string[] | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_kr_links: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kr_id: string
          rationale: string | null
          task_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kr_id: string
          rationale?: string | null
          task_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kr_id?: string
          rationale?: string | null
          task_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_kr_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_kr_links_kr_id_fkey"
            columns: ["kr_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_kr_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_participants: {
        Row: {
          id: string
          joined_at: string
          role: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_participants_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language: string
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_translations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          language: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          language?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          language?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translations_cache: {
        Row: {
          created_at: string
          id: string
          source_lang: string
          source_text: string
          target_lang: string
          translated_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_lang: string
          source_text: string
          target_lang: string
          translated_text: string
        }
        Update: {
          created_at?: string
          id?: string
          source_lang?: string
          source_text?: string
          target_lang?: string
          translated_text?: string
        }
        Relationships: []
      }
      uav_commands: {
        Row: {
          command_type: string
          confirmation_required: boolean | null
          confirmed_at: string | null
          created_at: string | null
          drone_id: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          parameters: Json | null
          result: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          command_type: string
          confirmation_required?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          drone_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          command_type?: string
          confirmation_required?: boolean | null
          confirmed_at?: string | null
          created_at?: string | null
          drone_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uav_commands_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "uav_drones"
            referencedColumns: ["id"]
          },
        ]
      }
      uav_drones: {
        Row: {
          battery_level: number | null
          created_at: string | null
          created_by: string | null
          firmware: string | null
          id: string
          last_contact: string | null
          location_lat: number | null
          location_lon: number | null
          model: string | null
          name: string
          serial: string | null
          status: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          created_by?: string | null
          firmware?: string | null
          id?: string
          last_contact?: string | null
          location_lat?: number | null
          location_lon?: number | null
          model?: string | null
          name: string
          serial?: string | null
          status?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          created_by?: string | null
          firmware?: string | null
          id?: string
          last_contact?: string | null
          location_lat?: number | null
          location_lon?: number | null
          model?: string | null
          name?: string
          serial?: string | null
          status?: string | null
        }
        Relationships: []
      }
      uav_events: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          data: Json | null
          drone_id: string | null
          event_type: string
          id: number
          message: string | null
          mission_id: string | null
          severity: string | null
          ts: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          data?: Json | null
          drone_id?: string | null
          event_type: string
          id?: number
          message?: string | null
          mission_id?: string | null
          severity?: string | null
          ts?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          data?: Json | null
          drone_id?: string | null
          event_type?: string
          id?: number
          message?: string | null
          mission_id?: string | null
          severity?: string | null
          ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uav_events_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "uav_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      uav_missions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          drone_id: string | null
          ended_at: string | null
          flight_path: Json | null
          id: string
          started_at: string | null
          status: string | null
          title: string
          waypoints: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          drone_id?: string | null
          ended_at?: string | null
          flight_path?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          title: string
          waypoints?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          drone_id?: string | null
          ended_at?: string | null
          flight_path?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          title?: string
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "uav_missions_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "uav_drones"
            referencedColumns: ["id"]
          },
        ]
      }
      uav_telemetry: {
        Row: {
          alt: number | null
          battery_v: number | null
          drone_id: string
          esc_temp_c: number | null
          id: number
          lat: number | null
          lon: number | null
          mission_id: string | null
          payload: Json | null
          speed_ms: number | null
          ts: string | null
          wind_ms: number | null
        }
        Insert: {
          alt?: number | null
          battery_v?: number | null
          drone_id: string
          esc_temp_c?: number | null
          id?: number
          lat?: number | null
          lon?: number | null
          mission_id?: string | null
          payload?: Json | null
          speed_ms?: number | null
          ts?: string | null
          wind_ms?: number | null
        }
        Update: {
          alt?: number | null
          battery_v?: number | null
          drone_id?: string
          esc_temp_c?: number | null
          id?: number
          lat?: number | null
          lon?: number | null
          mission_id?: string | null
          payload?: Json | null
          speed_ms?: number | null
          ts?: string | null
          wind_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "uav_telemetry_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "uav_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_guests: {
        Row: {
          contact: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          objective_id: string
          organization: string | null
          role: string | null
          status: Database["public"]["Enums"]["vip_status"]
          updated_at: string
        }
        Insert: {
          contact?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          objective_id: string
          organization?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["vip_status"]
          updated_at?: string
        }
        Update: {
          contact?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          objective_id?: string
          organization?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["vip_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_guests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_guests_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          payload: Json | null
          result: Json | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
          result?: Json | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
          result?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      recent_telemetry_summary: {
        Row: {
          battery_level: number | null
          drone_name: string | null
          latest_data: Json | null
          model: string | null
          status: string | null
        }
        Insert: {
          battery_level?: number | null
          drone_name?: string | null
          latest_data?: never
          model?: string | null
          status?: string | null
        }
        Update: {
          battery_level?: number | null
          drone_name?: string | null
          latest_data?: never
          model?: string | null
          status?: string | null
        }
        Relationships: []
      }
      uav_analytics_summary: {
        Row: {
          active_days_this_month: number | null
          avg_battery_level: number | null
          offline_drones: number | null
          online_drones: number | null
          total_drones: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          locale: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["employee_role"] | null
          salary: number | null
          telegram_username: string | null
          updated_at: string | null
          user_id: string | null
        }
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      achievement_type: "individual" | "team" | "company"
      employee_role: "admin" | "manager" | "employee" | "intern"
      issue_severity: "low" | "medium" | "high" | "critical"
      kr_status: "on_track" | "at_risk" | "off_track" | "done"
      media_status: "planned" | "published"
      milestone_status: "planned" | "in_progress" | "done"
      objective_status: "planned" | "active" | "done" | "on_hold"
      risk_likelihood:
        | "rare"
        | "unlikely"
        | "possible"
        | "likely"
        | "almost_certain"
      risk_severity: "low" | "medium" | "high" | "critical"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
      vip_status: "invited" | "confirmed" | "declined" | "attended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: ["individual", "team", "company"],
      employee_role: ["admin", "manager", "employee", "intern"],
      issue_severity: ["low", "medium", "high", "critical"],
      kr_status: ["on_track", "at_risk", "off_track", "done"],
      media_status: ["planned", "published"],
      milestone_status: ["planned", "in_progress", "done"],
      objective_status: ["planned", "active", "done", "on_hold"],
      risk_likelihood: [
        "rare",
        "unlikely",
        "possible",
        "likely",
        "almost_certain",
      ],
      risk_severity: ["low", "medium", "high", "critical"],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "on_hold",
      ],
      vip_status: ["invited", "confirmed", "declined", "attended"],
    },
  },
} as const
