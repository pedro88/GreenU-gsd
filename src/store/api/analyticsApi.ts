import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AnalyticsResponse {
  gardenId: string;
  gardenName: string;
  summary: {
    totalPlanted: number;
    totalHarvested: number;
    totalFailed: number;
    activeCrops: number;
    successRate: number;
  };
  topCrops: { name: string; totalYield: number; count: number }[];
  cropsByFamily: { name: string; count: number }[];
  monthlyActivity: { month: string; label: string; harvests: number }[];
  zones: { zone: string; crops: number; harvests: number }[];
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getAnalytics: builder.query<AnalyticsResponse, string>({
      query: (gardenId) => `/analytics/${gardenId}`,
      providesTags: (_result, _error, gardenId) => [{ type: 'Analytics', id: gardenId }],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
