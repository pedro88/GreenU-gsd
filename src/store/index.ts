import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import dashboardReducer from './slices/dashboardSlice';
import { authApi } from './api/authApi';
import { gardenVisualizationApi } from './api/gardenVisualizationApi';
import { calendarApi } from './api/calendarApi';
import { analyticsApi } from './api/analyticsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
    [authApi.reducerPath]: authApi.reducer,
    [gardenVisualizationApi.reducerPath]: gardenVisualizationApi.reducer,
    [calendarApi.reducerPath]: calendarApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      gardenVisualizationApi.middleware,
      calendarApi.middleware,
      analyticsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
