import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * UserSettings type matching Prisma model
 */
export interface UserSettings {
  id: string;
  userId: string;
  
  // Profile
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  
  // Location
  country: string | null;
  timezone: string | null;
  climateZone: string | null;
  
  // Notifications
  emailHarvest: boolean;
  emailCompanion: boolean;
  emailWeekly: boolean;
  pushStreak: boolean;
  pushAchievement: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: true,
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  error: null,
};

/**
 * Calculate profile completion percentage
 */
export function calculateCompletion(settings: UserSettings | null): number {
  if (!settings) return 0;
  
  const fields = [
    settings.avatarUrl,
    settings.displayName,
    settings.bio,
    settings.country,
    settings.timezone,
    settings.climateZone,
  ];
  
  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Async thunk to load settings from API
 */
export const loadSettings = createAsyncThunk(
  'settings/load',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to load settings');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error loading settings');
    }
  }
);

/**
 * Async thunk to save settings to API
 */
export const saveSettings = createAsyncThunk(
  'settings/save',
  async (settings: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to save settings');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error saving settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * Update a single setting locally (before save)
     */
    updateLocalSetting: <K extends keyof UserSettings>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: UserSettings[K] }>
    ) => {
      if (state.settings) {
        state.settings[action.payload.key] = action.payload.value;
        state.hasUnsavedChanges = true;
        
        // Persist theme to localStorage for flash prevention
        if (action.payload.key === 'theme') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('greenu-theme', action.payload.value as string);
          }
        }
      }
    },
    
    /**
     * Reset settings to server state (discard changes)
     */
    discardChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
    
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Set theme locally (for immediate UI feedback)
     */
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      if (state.settings) {
        state.settings.theme = action.payload;
        state.hasUnsavedChanges = true;
      }
    },
  },
  
  extraReducers: (builder) => {
    // Load settings
    builder.addCase(loadSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.settings = action.payload as UserSettings;
      state.hasUnsavedChanges = false;
    });
    
    builder.addCase(loadSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Save settings
    builder.addCase(saveSettings.pending, (state) => {
      state.isSaving = true;
      state.error = null;
    });
    
    builder.addCase(saveSettings.fulfilled, (state, action) => {
      state.isSaving = false;
      state.settings = action.payload as UserSettings;
      state.hasUnsavedChanges = false;
      state.lastSaved = new Date().toISOString();
    });
    
    builder.addCase(saveSettings.rejected, (state, action) => {
      state.isSaving = false;
      state.error = action.payload as string;
    });
  },
});

export const { updateLocalSetting, discardChanges, clearError, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings;
export const selectIsLoading = (state: { settings: SettingsState }) => state.settings.isLoading;
export const selectIsSaving = (state: { settings: SettingsState }) => state.settings.isSaving;
export const selectHasUnsavedChanges = (state: { settings: SettingsState }) => state.settings.hasUnsavedChanges;
export const selectLastSaved = (state: { settings: SettingsState }) => state.settings.lastSaved;
export const selectError = (state: { settings: SettingsState }) => state.settings.error;
export const selectCompletion = (state: { settings: SettingsState }) => 
  calculateCompletion(state.settings.settings);
export const selectTheme = (state: { settings: SettingsState }) => 
  state.settings.settings?.theme || 'system';
