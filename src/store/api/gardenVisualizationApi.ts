import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Garden Visualization API slice
 * Manages garden canvas data for the visualization view
 */

export interface CropSummary {
  id: string;
  name: string;
  plantTypeId: string;
  status: string;
  plantedDate: string;
  quantity: number | null;
  harvestYield: number | null;
}

export interface PlotSummary {
  id: string;
  name: string;
  sizeSqFt: number | null;
  soilType: string | null;
  plotRow: number;
  plotCol: number;
  crops: CropSummary[];
}

export interface ZoneLayout {
  id: string;
  name: string;
  type: string;
  row: number;
  col: number;
  plots: PlotSummary[];
}

export interface GardenVisualization {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  zones: ZoneLayout[];
  zoneGridCols: number;
}

export const gardenVisualizationApi = createApi({
  reducerPath: 'gardenVisualizationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['GardenVisualization', 'Zone', 'Plot'],
  endpoints: (builder) => ({
    /** GET /api/gardens/[id]/visualization */
    getGardenVisualization: builder.query<GardenVisualization, string>({
      query: (gardenId) => `/gardens/${gardenId}/visualization`,
      providesTags: (_result, _error, gardenId) => [{ type: 'GardenVisualization', id: gardenId }],
    }),

    /** POST /api/gardens/[id]/zones */
    createZone: builder.mutation<
      { id: string; name: string; type: string },
      { gardenId: string; name: string; type?: string }
    >({
      query: ({ gardenId, ...body }) => ({
        url: `/gardens/${gardenId}/zones`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [
        { type: 'GardenVisualization', id: gardenId },
      ],
    }),

    /** POST /api/zones/[id]/plots */
    createPlot: builder.mutation<
      { id: string; name: string },
      { zoneId: string; gardenId: string; name: string; sizeSqFt?: number; soilType?: string }
    >({
      query: ({ zoneId, gardenId: _gardenId, ...body }) => ({
        url: `/zones/${zoneId}/plots`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [
        { type: 'GardenVisualization', id: gardenId },
      ],
    }),

    /** POST /api/plots/[id]/crops */
    createCrop: builder.mutation<
      { id: string; plantTypeId: string; plantedDate: string },
      {
        plotId: string;
        gardenId: string;
        plantTypeId: string;
        plantedDate: string;
        quantity?: number;
      }
    >({
      query: ({ plotId, gardenId: _gardenId, ...body }) => ({
        url: `/plots/${plotId}/crops`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [
        { type: 'GardenVisualization', id: gardenId },
      ],
    }),

    /** DELETE /api/zones/[id] */
    deleteZone: builder.mutation<void, { zoneId: string; gardenId: string }>({
      query: ({ zoneId }) => ({
        url: `/zones/${zoneId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [
        { type: 'GardenVisualization', id: gardenId },
      ],
    }),

    /** DELETE /api/plots/[id] */
    deletePlot: builder.mutation<void, { plotId: string; gardenId: string }>({
      query: ({ plotId }) => ({
        url: `/plots/${plotId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { gardenId }) => [
        { type: 'GardenVisualization', id: gardenId },
      ],
    }),
  }),
});

export const {
  useGetGardenVisualizationQuery,
  useCreateZoneMutation,
  useCreatePlotMutation,
  useCreateCropMutation,
  useDeleteZoneMutation,
  useDeletePlotMutation,
} = gardenVisualizationApi;
