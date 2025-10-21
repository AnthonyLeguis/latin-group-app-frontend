// User interfaces
export interface User {
    id: number;
    name: string;
    email: string;
    type: 'admin' | 'agent' | 'client';
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    created_by?: number;
}

export interface AuthResponse {
    user: User;
    token: string;
    token_type: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    type: 'admin' | 'agent' | 'client';
}

// API Response interfaces
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}