"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const journey_plan_entity_1 = require("../journey-plans/entities/journey-plan.entity");
const sales_rep_entity_1 = require("../entities/sales-rep.entity");
const clients_entity_1 = require("../entities/clients.entity");
const uplift_sale_entity_1 = require("../entities/uplift-sale.entity");
let TargetsService = class TargetsService {
    constructor(journeyPlanRepository, salesRepRepository, clientsRepository, upliftSaleRepository) {
        this.journeyPlanRepository = journeyPlanRepository;
        this.salesRepRepository = salesRepRepository;
        this.clientsRepository = clientsRepository;
        this.upliftSaleRepository = upliftSaleRepository;
    }
    async getMonthlyVisits(userId) {
        try {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
            const dailyVisitTarget = salesRep?.visits_targets || 0;
            const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
            queryBuilder
                .select([
                'DATE(journey.date) as visitDate',
                'COUNT(*) as completedVisits'
            ])
                .where('journey.userId = :userId', { userId })
                .andWhere('journey.date >= :startDate', { startDate: startOfMonth })
                .andWhere('journey.date <= :endDate', { endDate: endOfMonth })
                .andWhere('journey.status = :status', { status: 3 })
                .groupBy('DATE(journey.date)')
                .orderBy('visitDate', 'ASC');
            const dailyVisits = await queryBuilder.getRawMany();
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
        }
        catch (error) {
            console.error('Error fetching monthly visits:', error);
            throw new Error('Failed to fetch monthly visits');
        }
    }
    async getDashboard(userId, period = 'current_month') {
        try {
            const currentDate = new Date();
            let startDate;
            let endDate;
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
            const visitTargets = await this.getVisitTargets(userId, startDate, endDate);
            const newClientsProgress = await this.getNewClientsProgress(userId, startDate, endDate);
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
        }
        catch (error) {
            console.error('Error fetching dashboard:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }
    async getVisitTargets(userId, startDate, endDate) {
        const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
        const dailyVisitTarget = salesRep?.visits_targets || 0;
        const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
        queryBuilder
            .where('journey.userId = :userId', { userId })
            .andWhere('journey.date >= :startDate', { startDate })
            .andWhere('journey.date <= :endDate', { endDate })
            .andWhere('journey.status = :status', { status: 3 });
        const completedVisits = await queryBuilder.getCount();
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const totalVisitTarget = dailyVisitTarget * totalDays;
        const progress = totalVisitTarget > 0 ? Math.round((completedVisits / totalVisitTarget) * 100) : 0;
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
    async getDailyVisitsBreakdown(userId, startDate, endDate) {
        const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
        queryBuilder
            .select([
            'DATE(journey.date) as visitDate',
            'COUNT(*) as completedVisits'
        ])
            .where('journey.userId = :userId', { userId })
            .andWhere('journey.date >= :startDate', { startDate })
            .andWhere('journey.date <= :endDate', { endDate })
            .andWhere('journey.status = :status', { status: 3 })
            .groupBy('DATE(journey.date)')
            .orderBy('visitDate', 'ASC');
        const dailyVisits = await queryBuilder.getRawMany();
        return dailyVisits.map(visit => ({
            date: visit.visitDate,
            completedVisits: parseInt(visit.completedVisits),
            progress: 100,
        }));
    }
    async getVisitStatistics(userId, period = 'current_month') {
        try {
            const currentDate = new Date();
            let startDate;
            let endDate;
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
            const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
            const dailyVisitTarget = salesRep?.visits_targets || 0;
            const queryBuilder = this.journeyPlanRepository.createQueryBuilder('journey');
            queryBuilder
                .select([
                'COUNT(*) as completedVisits',
                'COUNT(DISTINCT DATE(journey.date)) as activeDays'
            ])
                .where('journey.userId = :userId', { userId })
                .andWhere('journey.date >= :startDate', { startDate })
                .andWhere('journey.date <= :endDate', { endDate })
                .andWhere('journey.status = :status', { status: 3 });
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
        }
        catch (error) {
            console.error('Error fetching visit statistics:', error);
            throw new Error('Failed to fetch visit statistics');
        }
    }
    async checkJourneyData(userId) {
        try {
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
        }
        catch (error) {
            console.error('Error checking journey data:', error);
            throw new Error('Failed to check journey data');
        }
    }
    async getNewClientsProgress(userId, startDate, endDate) {
        const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
        const newClientsTarget = salesRep?.new_clients || 0;
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
    async getProductSalesProgress(userId, startDate, endDate) {
        const salesRep = await this.salesRepRepository.findOne({ where: { id: userId } });
        const vapesTarget = salesRep?.vapes_targets || 0;
        const pouchesTarget = salesRep?.pouches_targets || 0;
        const queryBuilder = this.upliftSaleRepository.createQueryBuilder('sale');
        queryBuilder
            .leftJoinAndSelect('sale.upliftSaleItems', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .where('sale.userId = :userId', { userId })
            .andWhere('sale.createdAt >= :startDate', { startDate })
            .andWhere('sale.createdAt <= :endDate', { endDate })
            .andWhere('sale.status = :status', { status: 'completed' });
        const sales = await queryBuilder.getMany();
        let vapesSold = 0;
        let pouchesSold = 0;
        let totalOrders = 0;
        let totalQuantitySold = 0;
        sales.forEach(sale => {
            totalOrders++;
            sale.upliftSaleItems.forEach(item => {
                totalQuantitySold += item.quantity;
                if (item.product?.category?.toLowerCase().includes('vape')) {
                    vapesSold += item.quantity;
                }
                else if (item.product?.category?.toLowerCase().includes('pouch')) {
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
            productBreakdown: [],
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.TargetsService = TargetsService;
exports.TargetsService = TargetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(journey_plan_entity_1.JourneyPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_rep_entity_1.SalesRep)),
    __param(2, (0, typeorm_1.InjectRepository)(clients_entity_1.Clients)),
    __param(3, (0, typeorm_1.InjectRepository)(uplift_sale_entity_1.UpliftSale)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TargetsService);
//# sourceMappingURL=targets.service.js.map