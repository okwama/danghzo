import { CreateProductReturnDto } from './create-product-return.dto';
declare const UpdateProductReturnDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProductReturnDto>>;
export declare class UpdateProductReturnDto extends UpdateProductReturnDto_base {
    status?: string;
}
export {};
