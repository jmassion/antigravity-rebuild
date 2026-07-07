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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asset_projects: {
        Row: {
          asset_id: string
          created_at: string
          folder_path: string | null
          id: string
          project_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          folder_path?: string | null
          id?: string
          project_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          folder_path?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_projects_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_versions: {
        Row: {
          ai_description: string | null
          ai_tags: string[] | null
          asset_id: string
          created_at: string
          created_by: string
          file_url: string
          id: string
          notes: string | null
          thumbnail_url: string | null
          version_number: number
        }
        Insert: {
          ai_description?: string | null
          ai_tags?: string[] | null
          asset_id: string
          created_at?: string
          created_by: string
          file_url: string
          id?: string
          notes?: string | null
          thumbnail_url?: string | null
          version_number?: number
        }
        Update: {
          ai_description?: string | null
          ai_tags?: string[] | null
          asset_id?: string
          created_at?: string
          created_by?: string
          file_url?: string
          id?: string
          notes?: string | null
          thumbnail_url?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          ai_description: string | null
          ai_tags: string[] | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          name: string
          owner_id: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          ai_description?: string | null
          ai_tags?: string[] | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          metadata?: Json | null
          name: string
          owner_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          ai_description?: string | null
          ai_tags?: string[] | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          name?: string
          owner_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      canvas_layouts: {
        Row: {
          created_at: string
          id: string
          layout: Json
          name: string
          owner_id: string
          updated_at: string
          viewport: Json
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          owner_id: string
          updated_at?: string
          viewport?: Json
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          owner_id?: string
          updated_at?: string
          viewport?: Json
        }
        Relationships: []
      }
      character_assets: {
        Row: {
          asset_id: string
          character_id: string
          created_at: string
          id: string
          label: string | null
          sort_order: number | null
        }
        Insert: {
          asset_id: string
          character_id: string
          created_at?: string
          id?: string
          label?: string | null
          sort_order?: number | null
        }
        Update: {
          asset_id?: string
          character_id?: string
          created_at?: string
          id?: string
          label?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "character_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_assets_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          owner_id: string
          project_id: string | null
          role: string | null
          sort_order: number | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          owner_id: string
          project_id?: string | null
          role?: string | null
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          owner_id?: string
          project_id?: string | null
          role?: string | null
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          owner_id: string
          role: string
          tool_calls: Json | null
          tool_results: Json | null
        }
        Insert: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          owner_id: string
          role?: string
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          role?: string
          tool_calls?: Json | null
          tool_results?: Json | null
        }
        Relationships: []
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          default_value: string | null
          entity_type: string
          field_label: string
          field_name: string
          field_type: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          owner_id: string
          scope: string | null
          scope_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          entity_type: string
          field_label: string
          field_name: string
          field_type?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          owner_id: string
          scope?: string | null
          scope_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_value?: string | null
          entity_type?: string
          field_label?: string
          field_name?: string
          field_type?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          owner_id?: string
          scope?: string | null
          scope_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field_id: string
          id: string
          owner_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field_id: string
          id?: string
          owner_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field_id?: string
          id?: string
          owner_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      docs: {
        Row: {
          category: string
          content: string
          created_at: string
          icon: string
          id: string
          owner_id: string
          parent_id: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          icon?: string
          id?: string
          owner_id: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          icon?: string
          id?: string
          owner_id?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "docs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
        ]
      }
      frame_versions: {
        Row: {
          ai_description: string | null
          ai_tags: string[] | null
          annotations: Json | null
          asset_id: string | null
          audio_url: string | null
          created_at: string
          created_by: string
          duration_seconds: number | null
          frame_id: string
          id: string
          notes: string | null
          snapshot_reason: string | null
          status: string
          title: string | null
          version_number: number
        }
        Insert: {
          ai_description?: string | null
          ai_tags?: string[] | null
          annotations?: Json | null
          asset_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by: string
          duration_seconds?: number | null
          frame_id: string
          id?: string
          notes?: string | null
          snapshot_reason?: string | null
          status?: string
          title?: string | null
          version_number?: number
        }
        Update: {
          ai_description?: string | null
          ai_tags?: string[] | null
          annotations?: Json | null
          asset_id?: string | null
          audio_url?: string | null
          created_at?: string
          created_by?: string
          duration_seconds?: number | null
          frame_id?: string
          id?: string
          notes?: string | null
          snapshot_reason?: string | null
          status?: string
          title?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "frame_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frame_versions_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "storyboard_frames"
            referencedColumns: ["id"]
          },
        ]
      }
      graph_presets: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          owner_id: string
          project_id: string | null
          sort_order: number
          tags: string[] | null
          title: string
          tool_icon_url: string | null
          tool_name: string | null
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          project_id?: string | null
          sort_order?: number
          tags?: string[] | null
          title: string
          tool_icon_url?: string | null
          tool_name?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          project_id?: string | null
          sort_order?: number
          tags?: string[] | null
          title?: string
          tool_icon_url?: string | null
          tool_name?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          brief: string | null
          content_type: string | null
          created_at: string
          deliverables: string[] | null
          goals: string[] | null
          id: string
          owner_id: string
          project_id: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          brief?: string | null
          content_type?: string | null
          created_at?: string
          deliverables?: string[] | null
          goals?: string[] | null
          id?: string
          owner_id: string
          project_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          brief?: string | null
          content_type?: string | null
          created_at?: string
          deliverables?: string[] | null
          goals?: string[] | null
          id?: string
          owner_id?: string
          project_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          team_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          team_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          parent_id: string | null
          phase: string
          tags: string[] | null
          thumbnail_fit: string
          thumbnail_focus_x: number
          thumbnail_focus_y: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          parent_id?: string | null
          phase?: string
          tags?: string[] | null
          thumbnail_fit?: string
          thumbnail_focus_x?: number
          thumbnail_focus_y?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          parent_id?: string | null
          phase?: string
          tags?: string[] | null
          thumbnail_fit?: string
          thumbnail_focus_x?: number
          thumbnail_focus_y?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      provenance_edges: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          owner_id: string
          relationship: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          owner_id: string
          relationship?: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          owner_id?: string
          relationship?: string
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      role_audit_log: {
        Row: {
          action: string
          changed_by: string
          created_at: string
          id: string
          new_role: string
          note: string | null
          previous_role: string | null
          target_user_id: string
        }
        Insert: {
          action?: string
          changed_by: string
          created_at?: string
          id?: string
          new_role: string
          note?: string | null
          previous_role?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_role?: string
          note?: string | null
          previous_role?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      storyboard_frames: {
        Row: {
          ai_description: string | null
          ai_tags: string[] | null
          annotations: Json | null
          asset_id: string | null
          assignee_id: string | null
          audio_url: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          notes: string | null
          sort_order: number
          status: string
          storyboard_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_description?: string | null
          ai_tags?: string[] | null
          annotations?: Json | null
          asset_id?: string | null
          assignee_id?: string | null
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          storyboard_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_description?: string | null
          ai_tags?: string[] | null
          annotations?: Json | null
          asset_id?: string | null
          assignee_id?: string | null
          audio_url?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          storyboard_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyboard_frames_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyboard_frames_assignee_team_member_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyboard_frames_storyboard_id_fkey"
            columns: ["storyboard_id"]
            isOneToOne: false
            referencedRelation: "storyboards"
            referencedColumns: ["id"]
          },
        ]
      }
      storyboard_projects: {
        Row: {
          created_at: string
          id: string
          project_id: string
          storyboard_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          storyboard_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          storyboard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyboard_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storyboard_projects_storyboard_id_fkey"
            columns: ["storyboard_id"]
            isOneToOne: false
            referencedRelation: "storyboards"
            referencedColumns: ["id"]
          },
        ]
      }
      storyboards: {
        Row: {
          content_type: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          project_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          project_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          project_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storyboards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      style_guide_entries: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          label: string
          metadata: Json | null
          owner_id: string
          project_id: string | null
          sort_order: number
          tags: string[] | null
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          owner_id: string
          project_id?: string | null
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          owner_id?: string
          project_id?: string | null
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_guide_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          asset_id: string | null
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          frame_id: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          frame_id?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          frame_id?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assignee_team_member_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "storyboard_frames"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          member_type: string
          owner_id: string
          primary_project_id: string | null
          role: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          member_type?: string
          owner_id: string
          primary_project_id?: string | null
          role?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          member_type?: string
          owner_id?: string
          primary_project_id?: string | null
          role?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_primary_project_id_fkey"
            columns: ["primary_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_logs: {
        Row: {
          asset_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_name: string
          file_size: number
          file_type: string
          folder_path: string | null
          id: string
          owner_id: string
          progress: number
          project_id: string | null
          source: string
          started_at: string
          status: string
        }
        Insert: {
          asset_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_name: string
          file_size?: number
          file_type?: string
          folder_path?: string | null
          id?: string
          owner_id: string
          progress?: number
          project_id?: string | null
          source?: string
          started_at?: string
          status?: string
        }
        Update: {
          asset_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          folder_path?: string | null
          id?: string
          owner_id?: string
          progress?: number
          project_id?: string | null
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_project_access: {
        Args: { _min_role?: string; _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "member" | "viewer"
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
      app_role: ["super_admin", "admin", "manager", "member", "viewer"],
    },
  },
} as const
