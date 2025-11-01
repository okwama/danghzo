export declare class LeaveRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: Date;
    end_date: Date;
    is_half_day: boolean;
    reason: string;
    attachment_url: string;
    status: number;
    approved_by: number;
    employee_type_id: number;
    notes: string;
    salesrep: number;
    applied_at: Date;
    created_at: Date;
    updated_at: Date;
}
