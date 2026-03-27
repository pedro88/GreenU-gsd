import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CalendarTask {
  id: string;
  date: string;
  type: string;
  icon: string;
  label: string;
  cropId: string;
  cropName: string;
  plotName: string;
  zoneName: string;
  gardenId: string;
  status: 'overdue' | 'today' | 'upcoming';
}

export interface CalendarResponse {
  gardenId: string;
  gardenName: string;
  climateZone: string;
  lastSpringFrost: string;
  firstFallFrost: string;
  tasks: CalendarTask[];
}

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Calendar'],
  endpoints: (builder) => ({
    getCalendar: builder.query<CalendarResponse, string>({
      query: (gardenId) => `/calendar/${gardenId}`,
      providesTags: (_result, _error, gardenId) => [{ type: 'Calendar', id: gardenId }],
    }),
  }),
});

export const { useGetCalendarQuery } = calendarApi;
