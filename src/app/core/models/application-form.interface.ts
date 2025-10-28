export interface ApplicationForm {
    id: number;
    client_id: number;
    agent_id: number;
    agent_name: string;

    // Application Data
    applicant_name: string;
    dob: string;
    address: string;
    unit_apt?: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    phone2?: string;
    email: string;
    gender: string;
    ssn: string;
    legal_status: string;
    document_number: string;
    insurance_company: string;
    insurance_plan: string;
    subsidy: number;
    final_cost: number;
    employment_type: string;
    employment_company_name?: string;
    work_phone?: string;
    wages?: number;
    wages_frequency?: string;

    // Póliza Data
    poliza_number?: string;
    poliza_category?: string;
    poliza_amount?: number;
    poliza_payment_day?: string;
    poliza_beneficiary?: string;

    // Person 1 Data
    person1_name?: string;
    person1_relation?: string;
    person1_is_applicant?: boolean;
    person1_legal_status?: string;
    person1_document_number?: string;
    person1_dob?: string;
    person1_company_name?: string;
    person1_ssn?: string;
    person1_gender?: string;
    person1_wages?: number;
    person1_frequency?: string;

    // Person 2 Data
    person2_name?: string;
    person2_relation?: string;
    person2_is_applicant?: boolean;
    person2_legal_status?: string;
    person2_document_number?: string;
    person2_dob?: string;
    person2_company_name?: string;
    person2_ssn?: string;
    person2_gender?: string;
    person2_wages?: number;
    person2_frequency?: string;

    // Person 3 Data
    person3_name?: string;
    person3_relation?: string;
    person3_is_applicant?: boolean;
    person3_legal_status?: string;
    person3_document_number?: string;
    person3_dob?: string;
    person3_company_name?: string;
    person3_ssn?: string;
    person3_gender?: string;
    person3_wages?: number;
    person3_frequency?: string;

    // Person 4 Data
    person4_name?: string;
    person4_relation?: string;
    person4_is_applicant?: boolean;
    person4_legal_status?: string;
    person4_document_number?: string;
    person4_dob?: string;
    person4_company_name?: string;
    person4_ssn?: string;
    person4_gender?: string;
    person4_wages?: number;
    person4_frequency?: string;

    // Payment Method Data
    card_type?: string;
    card_number?: string;
    card_expiration?: string;
    card_cvv?: string;
    bank_name?: string;
    bank_routing?: string;
    bank_account?: string;

    // Status and Confirmation
    status: 'pendiente' | 'activo' | 'inactivo' | 'rechazado';
    status_comment?: string;
    confirmed: boolean;
    reviewed_by?: number;
    reviewed_at?: string;

    // Pending Changes (for Active forms edited by agents)
    pending_changes?: any;
    has_pending_changes?: boolean;
    pending_changes_at?: string;
    pending_changes_by?: number;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Relations
    client?: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    agent?: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    reviewed_by_user?: {
        id: number;
        name: string;
        email: string;
    };
    pending_changes_by_user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface UpdateStatusRequest {
    status: 'pendiente' | 'activo' | 'inactivo' | 'rechazado';
    status_comment: string;
}
