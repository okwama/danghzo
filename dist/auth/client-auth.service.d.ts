import { Repository } from 'typeorm';
import { Clients } from '../entities/clients.entity';
export declare class ClientAuthService {
    private clientRepository;
    private readonly logger;
    constructor(clientRepository: Repository<Clients>);
    validateClient(identifier: string, password: string): Promise<Clients | null>;
    findById(id: number): Promise<Clients | null>;
    findByEmail(email: string): Promise<Clients | null>;
    findByName(name: string): Promise<Clients | null>;
}
