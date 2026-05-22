import api from './axiosConfig';
import type { HerbariumResponse, PlantResponse } from '../types/auth';

export const herbariaApi = {
    getMyHerbaria: () => api.get<HerbariumResponse[]>('/herbaria/me'),

    createHerbarium: (name: string, description: string, isPublic: boolean) =>
        api.post<HerbariumResponse>('/herbaria', { name, description, public: isPublic }),

    getHerbarium: (id: string) => api.get<HerbariumResponse>(`/herbaria/${id}`),

    updateHerbarium: (id: string, name: string, description: string, isPublic: boolean) =>
        api.put<HerbariumResponse>(`/herbaria/${id}`, { name, description, public: isPublic }),

    deleteHerbarium: (id: string) => api.delete(`/herbaria/${id}`),

    getPublicHerbaria: () => api.get<HerbariumResponse[]>('/herbaria/public'),

    getPlants: (herbariumId: string) => api.get<PlantResponse[]>(`/herbaria/${herbariumId}/plants`),

    getPlant: (herbariumId: string, plantId: string) =>
        api.get<PlantResponse>(`/herbaria/${herbariumId}/plants/${plantId}`),

    updatePlant: (herbariumId: string, plantId: string, name: string) =>
        api.put<PlantResponse>(`/herbaria/${herbariumId}/plants/${plantId}`, { name }),

    deletePlant: (herbariumId: string, plantId: string) =>
        api.delete(`/herbaria/${herbariumId}/plants/${plantId}`),

    uploadPhoto: (herbariumId: string, plantId: string, file: File, description?: string) => {
        const form = new FormData();
        form.append('file', file);
        if (description) form.append('description', description);
        return api.post(`/herbaria/${herbariumId}/plants/${plantId}/photos`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    identifyPhoto: (herbariumId: string, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post(`/herbaria/${herbariumId}/plants/identify`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    confirmIdentification: (
        herbariumId: string,
        pendingPhotoId: string,
        decisionType: string,
        existingPlantId?: string
    ) =>
        api.post(`/herbaria/${herbariumId}/plants/confirm`, {
            pendingPhotoId,
            decisionType,
            existingPlantId,
        }),

    deletePhoto: (herbariumId: string, plantId: string, photoId: string) =>
        api.delete(`/herbaria/${herbariumId}/plants/${plantId}/photos/${photoId}`),

    updatePhotoDescription: (
        herbariumId: string,
        plantId: string,
        photoId: string,
        description: string
    ) => api.put(`/herbaria/${herbariumId}/plants/${plantId}/photos/${photoId}`, { description }),
};
