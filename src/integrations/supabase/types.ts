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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_security_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          security_level: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          security_level?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          security_level?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity: string
          security_level: string
          session_end: string | null
          session_start: string
          user_agent: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity?: string
          security_level?: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity?: string
          security_level?: string
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assigned_date: string
          cluster_id: number | null
          completed_at: string | null
          created_at: string
          employee_id: string
          house_id: string
          id: string
          optimized_at: string | null
          route_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          cluster_id?: number | null
          completed_at?: string | null
          created_at?: string
          employee_id: string
          house_id: string
          id?: string
          optimized_at?: string | null
          route_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          cluster_id?: number | null
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          house_id?: string
          id?: string
          optimized_at?: string | null
          route_order?: number | null
          status?: string
          updated_at?: string
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
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
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
      employee_locations: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          is_online: boolean
          last_seen_at: string
          latitude: number
          longitude: number
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          latitude: number
          longitude: number
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          latitude?: number
          longitude?: number
          timestamp?: string
          updated_at?: string
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
      enhanced_security_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          risk_level: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          risk_level?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      houses: {
        Row: {
          address: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string
        }
        Relationships: []
      }
      iot_sensor_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          message: string
          reading_value: number | null
          resolved_at: string | null
          sensor_id: string
          severity: string
          threshold_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          reading_value?: number | null
          resolved_at?: string | null
          sensor_id: string
          severity?: string
          threshold_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          reading_value?: number | null
          resolved_at?: string | null
          sensor_id?: string
          severity?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_alerts_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensor_readings: {
        Row: {
          created_at: string
          id: string
          raw_data: Json | null
          reading_type: string
          recorded_at: string
          sensor_id: string
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          raw_data?: Json | null
          reading_type: string
          recorded_at?: string
          sensor_id: string
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          raw_data?: Json | null
          reading_type?: string
          recorded_at?: string
          sensor_id?: string
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensors: {
        Row: {
          alert_thresholds: Json | null
          api_key: string
          created_at: string
          description: string | null
          device_id: string
          id: string
          last_reading_at: string | null
          location_label: string | null
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          name: string
          sensor_type: string
          status: string
          updated_at: string
        }
        Insert: {
          alert_thresholds?: Json | null
          api_key?: string
          created_at?: string
          description?: string | null
          device_id: string
          id?: string
          last_reading_at?: string | null
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          name: string
          sensor_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          alert_thresholds?: Json | null
          api_key?: string
          created_at?: string
          description?: string | null
          device_id?: string
          id?: string
          last_reading_at?: string | null
          location_label?: string | null
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          name?: string
          sensor_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string
          id: string
          maintenance_type: string
          notes: string | null
          scheduled_date: string
          status: string
          updated_at: string
          vehicle_id: string
          vendor_contact: string | null
          vendor_name: string | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          maintenance_type: string
          notes?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
          vehicle_id: string
          vendor_contact?: string | null
          vendor_name?: string | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          maintenance_type?: string
          notes?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
          vehicle_id?: string
          vendor_contact?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string
          id: string
          message_type: string
          parent_message_id: string | null
          priority: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content: string
          created_at?: string
          id?: string
          message_type?: string
          parent_message_id?: string | null
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          parent_message_id?: string | null
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          priority: string
          read_at: string | null
          recipient_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          scheduled_for: string | null
          sender_id: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          scheduled_for?: string | null
          sender_id?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          priority?: string
          read_at?: string | null
          recipient_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          scheduled_for?: string | null
          sender_id?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string
          quantity: number
          service_id: string | null
          total_amount: number | null
          unit_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id: string
          quantity?: number
          service_id?: string | null
          total_amount?: number | null
          unit_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string
          quantity?: number
          service_id?: string | null
          total_amount?: number | null
          unit_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          metadata: Json
          payment_method: string | null
          service_address: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          tax: number
          total: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json
          payment_method?: string | null
          service_address?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          tax?: number
          total: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json
          payment_method?: string | null
          service_address?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          order_id: string | null
          payment_method: string
          paypal_transaction_id: string | null
          processed_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          order_id?: string | null
          payment_method: string
          paypal_transaction_id?: string | null
          processed_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string
          paypal_transaction_id?: string | null
          processed_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pii_access_logs: {
        Row: {
          accessed_fields: string[]
          accessed_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_fields: string[]
          accessed_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_fields?: string[]
          accessed_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          drivers_license: string | null
          email: string
          full_name: string | null
          id: string
          job_title: string | null
          pay_rate: number | null
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          drivers_license?: string | null
          email: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          pay_rate?: number | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          drivers_license?: string | null
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          pay_rate?: number | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_service_catalog: {
        Row: {
          category: string | null
          description: string | null
          features: Json | null
          frequency: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          public_pricing_info: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          features?: Json | null
          frequency?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          public_pricing_info?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          features?: Json | null
          frequency?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          public_pricing_info?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          is_blocked: boolean
          updated_at: string
          window_end: string
          window_start: string
        }
        Insert: {
          action_type: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          is_blocked?: boolean
          updated_at?: string
          window_end: string
          window_start?: string
        }
        Update: {
          action_type?: string
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          is_blocked?: boolean
          updated_at?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["permission"]
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_integrity_reports: {
        Row: {
          completed_pickups: number
          completion_rate: number
          created_at: string
          employees_assigned: Json
          generated_at: string
          house_id: string
          id: string
          issues: Json
          late_pickups: number
          missed_pickups: number
          notes: string | null
          overall_score: number
          report_month: string
          total_scheduled_pickups: number
          updated_at: string
        }
        Insert: {
          completed_pickups?: number
          completion_rate?: number
          created_at?: string
          employees_assigned?: Json
          generated_at?: string
          house_id: string
          id?: string
          issues?: Json
          late_pickups?: number
          missed_pickups?: number
          notes?: string | null
          overall_score?: number
          report_month: string
          total_scheduled_pickups?: number
          updated_at?: string
        }
        Update: {
          completed_pickups?: number
          completion_rate?: number
          created_at?: string
          employees_assigned?: Json
          generated_at?: string
          house_id?: string
          id?: string
          issues?: Json
          late_pickups?: number
          missed_pickups?: number
          notes?: string | null
          overall_score?: number
          report_month?: string
          total_scheduled_pickups?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_integrity_reports_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          features: Json | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_address: Json | null
          billing_cycle: string
          created_at: string
          id: string
          plan_type: string
          selected_features: Json | null
          service_address: string | null
          service_id: string | null
          status: string
          total_price: number
          unit_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          billing_cycle?: string
          created_at?: string
          id?: string
          plan_type: string
          selected_features?: Json | null
          service_address?: string | null
          service_id?: string | null
          status?: string
          total_price: number
          unit_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          billing_cycle?: string
          created_at?: string
          id?: string
          plan_type?: string
          selected_features?: Json | null
          service_address?: string | null
          service_id?: string | null
          status?: string
          total_price?: number
          unit_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          ip_address: unknown
          referer: string | null
          session_id: string | null
          terms_version: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          referer?: string | null
          session_id?: string | null
          terms_version?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          referer?: string | null
          session_id?: string | null
          terms_version?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicle_assignments: {
        Row: {
          assigned_date: string
          created_at: string
          employee_id: string
          id: string
          is_primary_driver: boolean | null
          notes: string | null
          unassigned_date: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          employee_id: string
          id?: string
          is_primary_driver?: boolean | null
          notes?: string | null
          unassigned_date?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_primary_driver?: boolean | null
          notes?: string | null
          unassigned_date?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity_cubic_yards: number | null
          created_at: string
          fuel_type: string | null
          id: string
          last_maintenance_date: string | null
          license_plate: string
          make: string
          mileage: number | null
          model: string
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          status: string
          updated_at: string
          vehicle_number: string
          vehicle_type: string
          vin: string | null
          year: number
        }
        Insert: {
          capacity_cubic_yards?: number | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          last_maintenance_date?: string | null
          license_plate: string
          make: string
          mileage?: number | null
          model: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          status?: string
          updated_at?: string
          vehicle_number: string
          vehicle_type?: string
          vin?: string | null
          year: number
        }
        Update: {
          capacity_cubic_yards?: number | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          last_maintenance_date?: string | null
          license_plate?: string
          make?: string
          mileage?: number | null
          model?: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          status?: string
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          clock_in_location_lat: number | null
          clock_in_location_lng: number | null
          clock_in_time: string
          clock_out_location_lat: number | null
          clock_out_location_lng: number | null
          clock_out_time: string | null
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          status: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          clock_in_location_lat?: number | null
          clock_in_location_lng?: number | null
          clock_in_time?: string
          clock_out_location_lat?: number | null
          clock_out_location_lng?: number | null
          clock_out_time?: string | null
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          clock_in_location_lat?: number | null
          clock_in_location_lng?: number | null
          clock_in_time?: string
          clock_out_location_lat?: number | null
          clock_out_location_lng?: number | null
          clock_out_time?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonymize_location_data: { Args: { location_data: Json }; Returns: Json }
      check_rate_limit: {
        Args: {
          _action_type: string
          _identifier: string
          _max_attempts?: number
          _window_minutes?: number
        }
        Returns: Json
      }
      cleanup_old_employee_locations: { Args: never; Returns: undefined }
      create_admin_profile_safe: {
        Args: { admin_email: string; admin_user_id: string }
        Returns: undefined
      }
      create_secure_admin_profile: {
        Args: { admin_email: string; admin_user_id: string }
        Returns: Json
      }
      emergency_disable_admin: {
        Args: { target_admin_id: string }
        Returns: Json
      }
      encrypt_sensitive_field: {
        Args: { data: string; field_name: string }
        Returns: string
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_roles: {
        Args: { check_user_id?: string }
        Returns: {
          expires_at: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      has_accepted_terms: {
        Args: { check_session_id?: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          check_permission: Database["public"]["Enums"]["permission"]
          check_user_id?: string
        }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin_by_email: { Args: never; Returns: boolean }
      is_admin_user: { Args: { check_user_id?: string }; Returns: boolean }
      is_super_admin_user: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      record_terms_acceptance: {
        Args: {
          p_ip_address?: string
          p_referer?: string
          p_session_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
      reset_rate_limit: {
        Args: { _action_type: string; _identifier: string }
        Returns: undefined
      }
      sync_public_service_catalog: { Args: never; Returns: undefined }
      validate_password_strength: {
        Args: { password_text: string }
        Returns: Json
      }
    }
    Enums: {
      permission:
        | "read_users"
        | "write_users"
        | "delete_users"
        | "read_orders"
        | "write_orders"
        | "delete_orders"
        | "read_analytics"
        | "manage_subscriptions"
        | "manage_vehicles"
        | "manage_schedules"
        | "manage_fleet"
        | "manage_properties"
        | "manage_settings"
        | "view_audit_logs"
        | "manage_roles"
      user_role: "customer" | "employee" | "admin" | "super_admin"
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
      permission: [
        "read_users",
        "write_users",
        "delete_users",
        "read_orders",
        "write_orders",
        "delete_orders",
        "read_analytics",
        "manage_subscriptions",
        "manage_vehicles",
        "manage_schedules",
        "manage_fleet",
        "manage_properties",
        "manage_settings",
        "view_audit_logs",
        "manage_roles",
      ],
      user_role: ["customer", "employee", "admin", "super_admin"],
    },
  },
} as const
