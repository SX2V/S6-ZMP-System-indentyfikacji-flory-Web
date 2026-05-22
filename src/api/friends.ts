import api from './axiosConfig';
import type { FriendResponse } from '../types/auth';

export const friendsApi = {
    getFriends: () => api.get<FriendResponse[]>('/friends'),

    sendRequest: (username: string) => api.post('/friends/request', { username }),

    acceptRequest: (friendshipId: string) => api.post(`/friends/${friendshipId}/accept`),

    getRequests: () => api.get<FriendResponse[]>('/friends/requests'),

    removeFriend: (friendshipId: string) => api.delete(`/friends/${friendshipId}`),

    getFriendHerbaria: (friendId: string) => api.get(`/herbaria/user/${friendId}`),
};
