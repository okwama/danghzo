export declare class CreateUpliftSaleItemDto {
    productId: number;
    quantity: number;
    unitPrice: number;
    total: number;
}
export declare class CreateUpliftSaleDto {
    clientId: number;
    status?: string;
    totalAmount?: number;
    upliftSaleItems?: CreateUpliftSaleItemDto[];
}
