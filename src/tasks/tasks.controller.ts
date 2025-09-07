import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() query: any) {
    const salesRepId = query.userId ? parseInt(query.userId, 10) : undefined;
    const status = query.status;
    return this.tasksService.findAll(salesRepId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Post()
  async create(@Body() createTaskDto: any) {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: any) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.tasksService.update(+id, { status: body.status });
  }

  @Patch(':id/complete')
  async completeTask(@Param('id') id: string) {
    return this.tasksService.completeTask(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
} 