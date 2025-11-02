export interface ApplicationDocument {
    id: number;
    file_name: string;
    original_name?: string;
    file_path: string;
    file_size: number;
    file_type: string;
    document_type?: string;
    uploaded_at: string;
    file_url?: string;
    download_url?: string;
    is_image?: boolean;
    is_pdf?: boolean;
    is_audio?: boolean;
    file_size_formatted?: string;
}
