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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          color: string | null
          created_at: string
          currency: string
          family_id: string
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          family_id: string
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          family_id?: string
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          color: string | null
          created_at: string
          family_id: string
          icon: string | null
          id: string
          monthly_limit: number | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          family_id: string
          icon?: string | null
          id?: string
          monthly_limit?: number | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          family_id?: string
          icon?: string | null
          id?: string
          monthly_limit?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          category_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          family_id: string
          id: string
          location: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          category_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          family_id: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          category_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          family_id?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          family_id: string
          file_path: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          family_id: string
          file_path: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          family_id?: string
          file_path?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          color: Database["public"]["Enums"]["event_category_color"]
          created_at: string
          family_id: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: Database["public"]["Enums"]["event_category_color"]
          created_at?: string
          family_id: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: Database["public"]["Enums"]["event_category_color"]
          created_at?: string
          family_id?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          remind_at: string
          sent: boolean
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          remind_at: string
          sent?: boolean
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          remind_at?: string
          sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs_admin: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          published: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          published?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          published?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          current_amount: number
          deadline: string | null
          family_id: string
          icon: string | null
          id: string
          name: string
          target_amount: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          current_amount?: number
          deadline?: string | null
          family_id: string
          icon?: string | null
          id?: string
          name: string
          target_amount: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          current_amount?: number
          deadline?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          date: string
          family_id: string
          id: string
          meal_type: string
          notes: string | null
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          family_id: string
          id?: string
          meal_type: string
          notes?: string | null
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          family_id?: string
          id?: string
          meal_type?: string
          notes?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers_admin: {
        Row: {
          created_at: string
          display_order: number | null
          features: Json
          id: string
          is_popular: boolean
          name: string
          price_monthly: number
          price_yearly: number
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          features?: Json
          id?: string
          is_popular?: boolean
          name: string
          price_monthly: number
          price_yearly: number
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          features?: Json
          id?: string
          is_popular?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          cook_time: number | null
          created_at: string
          created_by: string
          description: string | null
          family_id: string
          id: string
          image_url: string | null
          ingredients: string[]
          instructions: string | null
          name: string
          prep_time: number | null
          servings: number | null
          updated_at: string
        }
        Insert: {
          cook_time?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          family_id: string
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string | null
          name: string
          prep_time?: number | null
          servings?: number | null
          updated_at?: string
        }
        Update: {
          cook_time?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          family_id?: string
          id?: string
          image_url?: string | null
          ingredients?: string[]
          instructions?: string | null
          name?: string
          prep_time?: number | null
          servings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          category: string | null
          checked: boolean
          created_at: string
          id: string
          name: string
          quantity: string | null
          shopping_list_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          name: string
          quantity?: string | null
          shopping_list_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          name?: string
          quantity?: string | null
          shopping_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          created_by: string
          family_id: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          id: string
          max_accounts: number | null
          max_budget_categories: number | null
          max_wallets: number | null
          name: string
          price_monthly: number
          price_yearly: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          max_accounts?: number | null
          max_budget_categories?: number | null
          max_wallets?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          max_accounts?: number | null
          max_budget_categories?: number | null
          max_wallets?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          family_id: string
          id: string
          started_at: string
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          family_id: string
          id?: string
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          family_id?: string
          id?: string
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials_admin: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          published: boolean
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          published?: boolean
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          published?: boolean
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          budget_category_id: string | null
          created_at: string
          created_by: string
          date: string
          description: string
          family_id: string
          id: string
          notes: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          budget_category_id?: string | null
          created_at?: string
          created_by: string
          date?: string
          description: string
          family_id: string
          id?: string
          notes?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          budget_category_id?: string | null
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          family_id?: string
          id?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_budget_category_id_fkey"
            columns: ["budget_category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          id: string
          key: string
          published: boolean
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          key: string
          published?: boolean
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          key?: string
          published?: boolean
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_family_role: {
        Args: { _family_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "bank" | "cash" | "ewallet" | "investment"
      app_role: "admin" | "member" | "child"
      event_category_color:
        | "blue"
        | "green"
        | "orange"
        | "purple"
        | "pink"
        | "red"
      subscription_tier: "free" | "family" | "premium"
      transaction_type: "income" | "expense" | "transfer"
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
      account_type: ["bank", "cash", "ewallet", "investment"],
      app_role: ["admin", "member", "child"],
      event_category_color: [
        "blue",
        "green",
        "orange",
        "purple",
        "pink",
        "red",
      ],
      subscription_tier: ["free", "family", "premium"],
      transaction_type: ["income", "expense", "transfer"],
    },
  },
} as const
