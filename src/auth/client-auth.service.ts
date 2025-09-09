import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clients } from '../entities/clients.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientAuthService {
  private readonly logger = new Logger(ClientAuthService.name);

  constructor(
    @InjectRepository(Clients)
    private clientRepository: Repository<Clients>,
  ) {}

  /**
   * Validate client credentials using name/email and password
   */
  async validateClient(identifier: string, password: string): Promise<Clients | null> {
    this.logger.log(`🔍 Validating client with identifier: ${identifier}`);
    
    // Try to find client by name or email
    const client = await this.clientRepository.findOne({
      where: [
        { name: identifier, status: 1 }, // Active clients only
        { email: identifier, status: 1 }
      ],
    });

    if (!client) {
      this.logger.warn(`❌ Client not found for identifier: ${identifier}`);
      return null;
    }
    
    this.logger.log(`👤 Client found: ${client.name} (ID: ${client.id}, Status: ${client.status})`);
    
    if (client.status !== 1) {
      this.logger.warn(`❌ Client ${client.name} is inactive (status: ${client.status})`);
      throw new UnauthorizedException('Your account is inactive. Please contact support.');
    }
    
    // Validate password using entity method
    const isValidPassword = await client.validatePassword(password);
    this.logger.log(`🔐 Password validation for ${client.name}: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    
    if (isValidPassword) {
      this.logger.log(`✅ Client ${client.name} validated successfully`);
      return client;
    }
    
    this.logger.warn(`❌ Invalid password for client: ${client.name}`);
    return null;
  }

  /**
   * Find client by ID
   */
  async findById(id: number): Promise<Clients | null> {
    return this.clientRepository.findOne({
      where: { id, status: 1 },
    });
  }

  /**
   * Find client by email
   */
  async findByEmail(email: string): Promise<Clients | null> {
    return this.clientRepository.findOne({
      where: { email, status: 1 },
    });
  }

  /**
   * Find client by name
   */
  async findByName(name: string): Promise<Clients | null> {
    return this.clientRepository.findOne({
      where: { name, status: 1 },
    });
  }
}
