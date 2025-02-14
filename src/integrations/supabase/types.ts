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
      appointments: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          location_id: string
          start_time: string
          status: Database["public"]["Enums"]["tracking_status"] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location_id: string
          start_time: string
          status?: Database["public"]["Enums"]["tracking_status"] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["tracking_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          pickup_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["pickup_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          pickup_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          pickup_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pickup_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_tasks_pickup_id_fkey"
            columns: ["pickup_id"]
            isOneToOne: false
            referencedRelation: "scheduled_pickups"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          created_at: string
          id: string
          lat: number
          lng: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
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
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          payment_date: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_tracking: boolean | null
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          active_tracking?: boolean | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          active_tracking?: boolean | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_pickups: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          end_time: string
          id: string
          location_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["pickup_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["pickup_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["pickup_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_pickups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_pickups_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_data: {
        Row: {
          appointment_id: string | null
          employee_id: string
          id: string
          lat: number
          lng: number
          timestamp: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          employee_id: string
          id?: string
          lat: number
          lng: number
          timestamp?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          employee_id?: string
          id?: string
          lat?: number
          lng?: number
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_data_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_status: "pending" | "completed" | "failed"
      pickup_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
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
