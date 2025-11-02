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
    is_restricted?: boolean; // Usuario restringido/bloqueado
    total_active_time?: number; // Total de minutos acumulados activo
    current_session_start?: string; // Timestamp del inicio de sesión actual
    last_session_duration?: number; // Duración de la última sesión en minutos
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

export interface GoogleLoginRequest {
    token: string;
    provider: string;
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