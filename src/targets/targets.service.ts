import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JourneyPlan } from '../journey-plans/entities/journey-plan.entity';
import { SalesRep } from '../entities/sales-rep.entity';
import { Clients } from '../entities/clients.entity';
import { UpliftSale } from '../entities/uplift-sale.entity';

@Injectable()
export class TargetsService {
  constructor(
    @InjectRepository(JourneyPlan)
    private journeyPlanRepository: Repository<JourneyPlan>,
    @InjectRepository(SalesRep)
    private salesRepRepository: Repository<SalesRep>,
    @InjectRepository(Clients)
    private clientsRepository: Repository<Clients>,
    @InjectRepository(UpliftSale)
    private upliftSaleRepository: Repository<UpliftSale>,
  ) {}



  async getMonthlyVisits(userId: number): Promise<any[]> {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get daily visit target from SalesRep table
      const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
      const dailyVisitTarget = salesRep?.visits_targets || 0;

      // Get ONLY completed visits grouped by date
      const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
      queryBuilder
        .select([
          'DATE(journey.date) as visitDate',
          'COUNT(*) as completedVisits'
        ])
        .where('journey.userId = :userId', { userId })
        .andWhere('journey.date >= :startDate', { startDate: startOfMonth })
                .andWhere('journey.date <= :endDate', { endDate: endOfMonth })
        .andWhere('journey.status = :status', { status: 3 }) // 3 = completed visits
        .groupBy('DATE(journey.date)')
      .orderBy('visitDate', 'ASC');

      const dailyVisits = await queryBuilder.getRawMany();

      // Format the visits data with target comparison
      return dailyVisits.map(visit => {
        const completedVisits = parseInt(visit.completedVisits);
        const progress = dailyVisitTarget > 0 ? Math.round((completedVisits / dailyVisitTarget) * 100) : 0;
        
        return {
          date: visit.visitDate,
          visits: completedVisits,
          completed: completedVisits,
          target: dailyVisitTarget,
          progress: progress,
          status: progress >= 100 ? 'Target Achieved' : 'In Progress',
        };
      });
    } catch (error) {
      console.error('Error fetching monthly visits:', error);
      throw new Error('Failed to fetch monthly visits');
    }
  }

  async getDashboard(userId: number, period: string = 'current_month'): Promise<any> {
    try {
      const currentDate = new Date();
      let startDate: Date;
      let endDate: Date;

      // Calculate date range based on period
      switch (period) {
        case 'current_month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
          break;
        case 'current_year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      // Get visit targets
      const visitTargets = await this.getVisitTargets(userId, startDate, endDate);
      
      // Get new clients progress
      const newClientsProgress = await this.getNewClientsProgress(userId, startDate, endDate);
      
      // Get product sales progress
      const productSalesProgress = await this.getProductSalesProgress(userId, startDate, endDate);

      const dashboardData = {
        userId: userId,
        period: period,
        visitTargets: visitTargets,
        newClients: newClientsProgress,
        productSales: productSalesProgress,
        generatedAt: new Date().toISOString(),
      };
      
      console.log('🔍 Dashboard data for user', userId, ':', JSON.stringify(dashboardData, null, 2));
      
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  private async getVisitTargets(userId: number, startDate: Date, endDate: Date): Promise<any> {
    // Get daily visit target from SalesRep table
    const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
    const dailyVisitTarget = salesRep?.visits_targets || 0;

    // Get ONLY completed visits for the period from JourneyPlanss table
    // Status values: 0=pending, 1=in_progress, 2=cancelled, 3=completed
    const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
    queryBuilder
      .where('journey.userId = :userId', { userId })
      .andWhere('journey.date >= :startDate', { startDate })
      .andWhere('journey.date <= :endDate', { endDate })
      .andWhere('journey.status = :status', { status: 3 }); // 3 = completed only

    const completedVisits = await queryBuilder.getCount();
    
    // Calculate total days in the period
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalVisitTarget = dailyVisitTarget * totalDays;
    const progress = totalVisitTarget > 0 ? Math.round((completedVisits / totalVisitTarget) * 100) : 0;

    // Get daily breakdown for completed visits only
    const dailyVisits = await this.getDailyVisitsBreakdown(userId, startDate, endDate);

    const visitTargetsData = {
      userId: userId.toString(),
      date: startDate.toISOString().split('T')[0],
      visitTarget: totalVisitTarget,
      completedVisits: completedVisits,
      remainingVisits: Math.max(0, totalVisitTarget - completedVisits),
      progress: progress,
      status: progress >= 100 ? 'Target Achieved' : 'In Progress',
      dailyBreakdown: dailyVisits,
    };
    
    console.log('🔍 Visit targets data for user', userId, ':', JSON.stringify(visitTargetsData, null, 2));
    
    return visitTargetsData;
  }

  private async getDailyVisitsBreakdown(userId: number, startDate: Date, endDate: Date): Promise<any[]> {
    // Get ONLY completed journeys for the period with daily grouping
    const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
    queryBuilder
      .select([
        'DATE(journey.date) as visitDate',
        'COUNT(*) as completedVisits'
      ])
      .where('journey.userId = :userId', { userId })
      .andWhere('journey.date >= :startDate', { startDate })
      .andWhere('journey.date <= :endDate', { endDate })
      .andWhere('journey.status = :status', { status: 3 }) // 3 = completed visits
      .groupBy('DATE(journey.date)')
      .orderBy('visitDate', 'ASC');

    const dailyVisits = await queryBuilder.getRawMany();

    // Format the daily visits data
    return dailyVisits.map(visit => ({
      date: visit.visitDate,
      completedVisits: parseInt(visit.completedVisits),
      progress: 100, // All tracked visits are completed
    }));
  }

  async getVisitStatistics(userId: number, period: string = 'current_month'): Promise<any> {
    try {
      const currentDate = new Date();
      let startDate: Date;
      let endDate: Date;

      // Calculate date range based on period
      switch (period) {
        case 'current_month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'last_month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
          break;
        case 'current_year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          endDate = new Date(currentDate.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      // Get daily visit target from SalesRep table
      const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
      const dailyVisitTarget = salesRep?.visits_targets || 0;

      // Get ONLY completed visit statistics
      const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
      queryBuilder
        .select([
          'COUNT(*) as completedVisits',
          'COUNT(DISTINCT DATE(journey.date)) as activeDays'
        ])
        .where('journey.userId = :userId', { userId })
        .andWhere('journey.date >= :startDate', { startDate })
        .andWhere('journey.date <= :endDate', { endDate })
        .andWhere('journey.status = :status', { status: 3 }); // 3 = completed visits

      const stats = await queryBuilder.getRawOne();
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const totalVisitTarget = dailyVisitTarget * totalDays;
      const targetProgress = totalVisitTarget > 0 ? Math.round((stats.completedVisits / totalVisitTarget) * 100) : 0;

      return {
        period: period,
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        targets: {
          dailyTarget: dailyVisitTarget,
          totalTarget: totalVisitTarget,
          totalDays: totalDays,
        },
        actual: {
          completedVisits: parseInt(stats.completedVisits),
          activeDays: parseInt(stats.activeDays),
        },
        progress: {
          targetProgress: targetProgress,
          averageVisitsPerDay: stats.activeDays > 0 ? Math.round(stats.completedVisits / stats.activeDays) : 0,
        },
        status: targetProgress >= 100 ? 'Target Achieved' : 'In Progress',
      };
    } catch (error) {
      console.error('Error fetching visit statistics:', error);
      throw new Error('Failed to fetch visit statistics');
    }
  }

  async checkJourneyData(userId: number): Promise<any> {
    try {
      // Get all journey plans for the user
      const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
      queryBuilder
        .select([
          'journey.id',
          'journey.date',
          'journey.status',
          'journey.checkInTime',
          'journey.checkoutTime',
          'journey.clientId'
        ])
        .where('journey.userId = :userId', { userId })
        .orderBy('journey.date', 'DESC')
        .limit(20);

      const journeyPlans = await queryBuilder.getRawMany();

      // Get overall statistics
      const statsQuery = this.journeyPlanRepository.createQueryBuilder('journey');
      statsQuery
        .select([
          'COUNT(*) as totalVisits',
          'SUM(CASE WHEN journey.status = 1 THEN 1 ELSE 0 END) as completedVisits',
          'SUM(CASE WHEN journey.status = 0 THEN 1 ELSE 0 END) as pendingVisits',
          'COUNT(DISTINCT DATE(journey.date)) as activeDays'
        ])
        .where('journey.userId = :userId', { userId });

      const stats = await statsQuery.getRawOne();

      // Get monthly breakdown
      const monthlyQuery = this.journeyPlanRepository.createQueryBuilder('journey');
      monthlyQuery
        .select([
          'DATE_FORMAT(journey.date, "%Y-%m") as month',
          'COUNT(*) as totalVisits',
          'SUM(CASE WHEN journey.status = 1 THEN 1 ELSE 0 END) as completedVisits'
        ])
        .where('journey.userId = :userId', { userId })
        .groupBy('DATE_FORMAT(journey.date, "%Y-%m")')
        .orderBy('month', 'DESC');

      const monthlyStats = await monthlyQuery.getRawMany();

      return {
        userId: userId,
        recentJourneyPlans: journeyPlans.map(plan => ({
          id: plan.journey_id,
          date: plan.journey_date,
          status: plan.journey_status,
          checkInTime: plan.journey_checkInTime,
          checkoutTime: plan.journey_checkoutTime,
          clientId: plan.journey_clientId,
        })),
        overallStats: {
          totalVisits: parseInt(stats.totalVisits),
          completedVisits: parseInt(stats.completedVisits),
          pendingVisits: parseInt(stats.pendingVisits),
          activeDays: parseInt(stats.activeDays),
        },
        monthlyBreakdown: monthlyStats.map(month => ({
          month: month.month,
          totalVisits: parseInt(month.totalVisits),
          completedVisits: parseInt(month.completedVisits),
          completionRate: month.totalVisits > 0 ? 
            Math.round((month.completedVisits / month.totalVisits) * 100) : 0,
        })),
      };
    } catch (error) {
      console.error('Error checking journey data:', error);
      throw new Error('Failed to check journey data');
    }
  }

  private async getNewClientsProgress(userId: number, startDate: Date, endDate: Date): Promise<any> {
    // Get new clients target from SalesRep table
    const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
    const newClientsTarget = salesRep?.new_clients || 0;

    // Count new clients added in the period
    const queryBuilder = this.clientsRepository.createQueryBuilder('client');
    queryBuilder
      .where('client.added_by = :userId', { userId })
      .andWhere('client.created_at >= :startDate', { startDate })
      .andWhere('client.created_at <= :endDate', { endDate });

    const newClientsAdded = await queryBuilder.getCount();
    const progress = newClientsTarget > 0 ? Math.round((newClientsAdded / newClientsTarget) * 100) : 0;

    return {
      userId: userId,
      salesRepName: salesRep?.name || '',
      period: 'current_month',
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      newClientsTarget: newClientsTarget,
      newClientsAdded: newClientsAdded,
      remainingClients: Math.max(0, newClientsTarget - newClientsAdded),
      progress: progress,
      status: progress >= 100 ? 'Target Achieved' : 'In Progress',
      generatedAt: new Date().toISOString(),
    };
  }

  private async getProductSalesProgress(userId: number, startDate: Date, endDate: Date): Promise<any> {
    // Get product targets from SalesRep table
    const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
    const vapesTarget = salesRep?.vapes_targets || 0;
    const pouchesTarget = salesRep?.pouches_targets || 0;

    // Get sales data for the period
    const queryBuilder = this.upliftSaleRepository.createQueryBuilder('sale');
    queryBuilder
      .leftJoinAndSelect('sale.upliftSaleItems', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('sale.userId = :userId', { userId })
      .andWhere('sale.createdAt >= :startDate', { startDate })
      .andWhere('sale.createdAt <= :endDate', { endDate })
      .andWhere('sale.status = :status', { status: 'completed' });

    const sales = await queryBuilder.getMany();

    // Calculate vapes and pouches sold
    let vapesSold = 0;
    let pouchesSold = 0;
    let totalOrders = 0;
    let totalQuantitySold = 0;

    sales.forEach(sale => {
      totalOrders++;
      sale.upliftSaleItems.forEach(item => {
        totalQuantitySold += item.quantity;
        // Determine if product is vape or pouch based on category
        if (item.product?.category?.toLowerCase().includes('vape')) {
          vapesSold += item.quantity;
        } else if (item.product?.category?.toLowerCase().includes('pouch')) {
          pouchesSold += item.quantity;
        }
      });
    });

    const vapesProgress = vapesTarget > 0 ? Math.round((vapesSold / vapesTarget) * 100) : 0;
    const pouchesProgress = pouchesTarget > 0 ? Math.round((pouchesSold / pouchesTarget) * 100) : 0;

    return {
      userId: userId,
      salesRepName: salesRep?.name || '',
      period: 'current_month',
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalOrders: totalOrders,
        totalQuantitySold: totalQuantitySold,
        vapes: {
          target: vapesTarget,
          sold: vapesSold,
          remaining: Math.max(0, vapesTarget - vapesSold),
          progress: vapesProgress,
          status: vapesProgress >= 100 ? 'Target Achieved' : 'In Progress',
        },
        pouches: {
          target: pouchesTarget,
          sold: pouchesSold,
          remaining: Math.max(0, pouchesTarget - pouchesSold),
          progress: pouchesProgress,
          status: pouchesProgress >= 100 ? 'Target Achieved' : 'In Progress',
        },
      },
      productBreakdown: [], // Could be populated with detailed product breakdown
      generatedAt: new Date().toISOString(),
    };
  }
} 