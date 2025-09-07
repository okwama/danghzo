import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(salesRepId?: number, status?: string): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');
    
    if (salesRepId) {
      query.where('task.salesRepId = :salesRepId', { salesRepId });
    }
    
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    
    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Task> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async create(createTaskDto: any): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    const result = await this.taskRepository.save(task);
    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: number, updateTaskDto: any): Promise<Task> {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async completeTask(id: number): Promise<Task> {
    const updateData = {
      status: 'COMPLETED',
      isCompleted: true,
      completedAt: new Date()
    };
    
    await this.taskRepository.update(id, updateData);
    return this.findOne(id);
  }
} 