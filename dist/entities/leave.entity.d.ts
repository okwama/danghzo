export declare class Leave {
    id: number;
    userId: number;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    attachment: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    get durationInDays(): number;
}
