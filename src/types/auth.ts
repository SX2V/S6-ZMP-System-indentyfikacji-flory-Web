export interface LoginResponse {
    message?: string;
    warning?: string;
    id: string;
    username: string;
    email: string;
    verified: boolean;
    admin: boolean;
    token: string;
}

export interface RegisterResponse {
    message: string;
    id: string;
    username: string;
    email: string;
}