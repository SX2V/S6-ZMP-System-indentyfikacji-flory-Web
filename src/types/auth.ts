export interface LoginResponse {
    message?: string;
    warning?: string;
    id: string;
    username: string;
    email: string;
    verified: boolean;
    admin: boolean;
    token: string;
    refreshToken: string;
}

export interface RegisterResponse {
    message: string;
    id: string;
    username: string;
    email: string;
}

export interface RefreshResponse {
    token: string;
    refreshToken: string;
}

export interface PlantPhotoResponse {
    id: string;
    plantId: string;
    url: string;
    description?: string;
    confidence?: number;
    createdAt: string;
}

export interface PlantResponse {
    id: string;
    herbariumId: string;
    name: string;
    detectedSpecies?: string;
    family?: string;
    genus?: string;
    commonNames?: string;
    photos?: PlantPhotoResponse[];
}

export interface HerbariumResponse {
    id: string;
    name: string;
    description?: string;
    public: boolean;
    plantCount: number;
    ownerId?: string;
    ownerUsername?: string;
}

export interface FriendResponse {
    friendshipId: string;
    userId: string;
    username: string;
    status: string;
    direction?: string;
    createdAt: string;
}

export interface NotificationResponse {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}
