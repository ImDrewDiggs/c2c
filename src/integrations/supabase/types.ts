export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_data: {
        Row: {
          active_employees: number | null
          completed_pickups: number | null
          created_at: string | null
          date: string
          id: string
          total_pickups: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          active_employees?: number | null
          completed_pickups?: number | null
          created_at?: string | null
          date: string
          id?: string
          total_pickups?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          active_employees?: number | null
          completed_pickups?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_pickups?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location_id: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assigned_date: string | null
          completed_at: string | null
          created_at: string | null
          employee_id: string | null
          house_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          assigned_date?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string | null
          house_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          assigned_date?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string | null
          house_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_locations: {
        Row: {
          employee_id: string | null
          id: string
          is_online: boolean | null
          last_seen_at: string | null
          latitude: number
          longitude: number
          timestamp: string | null
        }
        Insert: {
          employee_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          latitude: number
          longitude: number
          timestamp?: string | null
        }
        Update: {
          employee_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen_at?: string | null
          latitude?: number
          longitude?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_locations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      houses: {
        Row: {
          address: string
          created_at: string
          id: string
          latitude: number
          longitude: number
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          details: string
          id: string
          is_default: boolean | null
          last_used_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          is_default?: boolean | null
          last_used_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          masked_details: string | null
          payment_method: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          masked_details?: string | null
          payment_method: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          masked_details?: string | null
          payment_method?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      service_logs: {
        Row: {
          completed_date: string | null
          created_at: string
          employee_id: string | null
          id: string
          notes: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["service_status"] | null
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["service_status"] | null
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["service_status"] | null
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          created_at: string
          description: string | null
          frequency: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          frequency: string
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          next_service_date: string | null
          plan_id: string | null
          start_date: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          next_service_date?: string | null
          plan_id?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          next_service_date?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          level: string
          message: string
          source: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          level: string
          message: string
          source: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          level?: string
          message?: string
          source?: string
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string
          employee_id: string
          id: string
          is_active: boolean | null
          total_hours: number | null
        }
        Insert: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          total_hours?: number | null
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          total_hours?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_system_event: {
        Args: {
          p_level: string
          p_source: string
          p_message: string
          p_details?: Json
        }
        Returns: string
      }
      log_user_action: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      job_status: "pending" | "in_progress" | "completed"
      payment_status: "pending" | "completed" | "failed"
      pickup_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_status: "pending" | "in_progress" | "completed" | "cancelled"
      service_tier: "standard" | "premium" | "comprehensive" | "premiere"
      subscription_status: "active" | "cancelled" | "overdue"
      tracking_status: "pending" | "in_progress" | "completed"
      user_role: "admin" | "employee" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
