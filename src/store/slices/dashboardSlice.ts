import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

export interface Garden {
  id: string;
  name: string;
  description?: string;
  location?: string;
  stats: {
    zoneCount: number;
    plotCount: number;
    activeCropCount: number;
    harvestCount: number;
    gardenerCount: number;
    followerCount: number;
    todoCount: number;
  };
}

export interface Crop {
  id: string;
  name: string;
  plantType: string;
  status: string;
  gardenName: string;
  plotName: string;
  plantedAt: string;
  harvestDate?: string;
}

export interface Harvest {
  id: string;
  cropName: string;
  gardenName: string;
  quantity: number;
  unit: string;
  harvestDate: string;
  notes?: string;
}

export interface DashboardStats {
  gardenCount: number;
  cropCount: number;
  harvestCount: number;
  totalXP: number;
  trend: {
    gardenCountChange: number;
    cropCountChange: number;
    harvestCountChange: number;
    totalXPChange: number;
  };
}

export interface DashboardState {
  stats: DashboardStats | null;
  gardens: Garden[];
  crops: Crop[];
  recentHarvests: Harvest[];
  isLoading: boolean;
  error: string | null;
  expandedCard: 'gardens' | 'crops' | 'harvests' | null;
}

const initialState: DashboardState = {
  stats: null,
  gardens: [],
  crops: [],
  recentHarvests: [],
  isLoading: false,
  error: null,
  expandedCard: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all data in parallel
      const [gardensRes, gameStatsRes] = await Promise.all([
        fetch('/api/gardens'),
        fetch('/api/profile/game-stats'),
      ]);

      if (!gardensRes.ok) {
        return rejectWithValue('Failed to fetch gardens');
      }

      const gardensData = await gardensRes.json();
      const gameStats = gameStatsRes.ok ? await gameStatsRes.json() : { totalXp: 0 };

      // Calculate totals
      const totalCrops = gardensData.gardens.reduce(
        (acc: number, garden: { stats: { activeCropCount: number } }) =>
          acc + garden.stats.activeCropCount,
        0
      );
      const totalHarvests = gardensData.gardens.reduce(
        (acc: number, garden: { stats: { harvestCount: number } }) =>
          acc + garden.stats.harvestCount,
        0
      );

      // Calculate trends (mocked for now - would need historical data)
      const stats = {
        gardenCount: gardensData.gardens.length,
        cropCount: totalCrops,
        harvestCount: totalHarvests,
        totalXP: gameStats.totalXp || 0,
        trend: {
          gardenCountChange: 0,
          cropCountChange: 0,
          harvestCountChange: 0,
          totalXPChange: 0,
        },
      };

      return {
        stats,
        gardens: gardensData.gardens,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

export const fetchDashboardHarvests = createAsyncThunk(
  'dashboard/fetchHarvests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/crops/harvests');
      if (!res.ok) return rejectWithValue('Failed to fetch harvests');
      return await res.json();
    } catch {
      return rejectWithValue('Failed to fetch harvests');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setExpandedCard: (state, action: PayloadAction<'gardens' | 'crops' | 'harvests' | null>) => {
      state.expandedCard = state.expandedCard === action.payload ? null : action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.gardens = action.payload.gardens;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDashboardHarvests.fulfilled, (state, action) => {
        state.recentHarvests = action.payload;
      });
  },
});

export const { setExpandedCard, clearError, resetDashboard } = dashboardSlice.actions;

// Selectors
export const selectStats = (state: RootState) => state.dashboard.stats;
export const selectGardens = (state: RootState) => state.dashboard.gardens;
export const selectExpandedCard = (state: RootState) => state.dashboard.expandedCard;
export const selectIsLoading = (state: RootState) => state.dashboard.isLoading;
export const selectError = (state: RootState) => state.dashboard.error;

export default dashboardSlice.reducer;
