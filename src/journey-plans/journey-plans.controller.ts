import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, HttpCode, HttpStatus, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JourneyPlansService } from './journey-plans.service';
import { CreateJourneyPlanDto } from './dto/create-journey-plan.dto';
import { UpdateJourneyPlanDto } from './dto/update-journey-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('journey-plans')
@UseGuards(JwtAuthGuard)
export class JourneyPlansController {
  constructor(private readonly journeyPlansService: JourneyPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJourneyPlanDto: CreateJourneyPlanDto, @Req() req: Request) {
    // Extract userId from JWT token
    const userId = (req.user as any)?.id;
    return this.journeyPlansService.create(createJourneyPlanDto, userId);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('timezone') timezone: string = 'Africa/Nairobi',
    @Query('date') date?: string,
  ) {
    const userId = (req.user as any)?.id;
    return this.journeyPlansService.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      timezone,
      date,
      userId,
    });
  }

  @Get('by-date')
  findByDate(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('timezone') timezone: string = 'Africa/Nairobi',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = (req.user as any)?.id;
    
    // Use today's date if no dates provided
    const today = new Date().toISOString().split('T')[0];
    const finalStartDate = startDate || today;
    const finalEndDate = endDate || today;
    
    return this.journeyPlansService.findByDateRange({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      timezone,
      startDate: finalStartDate,
      endDate: finalEndDate,
      userId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journeyPlansService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateJourneyPlanDto: UpdateJourneyPlanDto) {
    return this.journeyPlansService.update(+id, updateJourneyPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journeyPlansService.remove(+id);
  }

  @Post(':id/checkout')
  @HttpCode(HttpStatus.OK)
  checkout(
    @Param('id') id: string,
    @Body() checkoutDto: {
      checkoutTime?: string;
      checkoutLatitude?: number;
      checkoutLongitude?: number;
    },
  ) {
    return this.journeyPlansService.checkout(+id, checkoutDto);
  }

  @Post(':id/upload-photo')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadCheckInPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No photo file provided');
    }

    try {
      const photoUrl = await this.journeyPlansService.uploadCheckInPhoto(+id, file);
      return { photoUrl };
    } catch (error) {
      throw error;
    }
  }
} 