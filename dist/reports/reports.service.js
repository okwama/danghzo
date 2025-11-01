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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feedback_report_entity_1 = require("../entities/feedback-report.entity");
const product_report_entity_1 = require("../entities/product-report.entity");
const visibility_report_entity_1 = require("../entities/visibility-report.entity");
const competitor_report_entity_1 = require("../entities/competitor-report.entity");
let ReportsService = class ReportsService {
    constructor(feedbackReportRepository, productReportRepository, visibilityReportRepository, competitorReportRepository, dataSource) {
        this.feedbackReportRepository = feedbackReportRepository;
        this.productReportRepository = productReportRepository;
        this.visibilityReportRepository = visibilityReportRepository;
        this.competitorReportRepository = competitorReportRepository;
        this.dataSource = dataSource;
    }
    async submitReport(reportData, authenticatedUserId) {
        try {
            console.log('📋 ===== REPORT SUBMISSION START =====');
            console.log('📋 Received report data:', JSON.stringify(reportData, null, 2));
            console.log('📋 Authenticated user ID:', authenticatedUserId);
            const reportType = reportData.type || reportData.reportType;
            const { type, reportType: _, details, salesRepId, userId, journeyPlanId, ...mainData } = reportData;
            const finalUserId = authenticatedUserId || userId || salesRepId;
            if (!finalUserId) {
                throw new Error('No valid user ID found. Authentication required.');
            }
            const mappedMainData = {
                ...mainData,
                reportId: journeyPlanId,
                userId: finalUserId,
            };
            console.log('📋 Processing report type:', reportType);
            console.log('📋 Journey Plan ID:', reportData.journeyPlanId);
            console.log('📋 Sales Rep ID:', salesRepId);
            console.log('📋 Request User ID:', userId);
            console.log('📋 Authenticated User ID:', authenticatedUserId);
            console.log('📋 Final User ID:', finalUserId);
            console.log('📋 Client ID:', reportData.clientId);
            console.log('📋 Report details:', JSON.stringify(details, null, 2));
            switch (reportType) {
                case 'FEEDBACK':
                    console.log('📋 ===== FEEDBACK REPORT CREATION =====');
                    console.log('📋 Final User ID for feedback report:', finalUserId);
                    console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
                    const { reportId: feedbackReportId, ...feedbackDetails } = details || {};
                    const feedbackDataToSave = {
                        ...mappedMainData,
                        ...feedbackDetails,
                        userId: finalUserId
                    };
                    console.log('📋 Feedback data to save:', JSON.stringify(feedbackDataToSave, null, 2));
                    const today = new Date();
                    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
                    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
                    const existingFeedbackReport = await this.feedbackReportRepository.findOne({
                        where: {
                            clientId: mappedMainData.clientId,
                            createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay)
                        }
                    });
                    let savedFeedbackReport;
                    if (existingFeedbackReport) {
                        console.log('📋 Updating existing feedback report for same day:', existingFeedbackReport.id);
                        Object.assign(existingFeedbackReport, feedbackDataToSave);
                        savedFeedbackReport = await this.feedbackReportRepository.save(existingFeedbackReport);
                        console.log('✅ Existing feedback report updated successfully!');
                    }
                    else {
                        console.log('📋 Creating new feedback report with data:', JSON.stringify(feedbackDataToSave, null, 2));
                        const feedbackReport = this.feedbackReportRepository.create(feedbackDataToSave);
                        console.log('📋 Feedback report entity created:', JSON.stringify(feedbackReport, null, 2));
                        savedFeedbackReport = await this.feedbackReportRepository.save(feedbackReport);
                        console.log('✅ New feedback report saved successfully!');
                    }
                    console.log('✅ Feedback report ID:', savedFeedbackReport.id);
                    console.log('✅ Feedback report comment:', savedFeedbackReport.comment);
                    console.log('✅ Feedback report created at:', savedFeedbackReport.createdAt);
                    console.log('📋 ===== FEEDBACK REPORT CREATION COMPLETE =====');
                    return savedFeedbackReport;
                case 'PRODUCT_AVAILABILITY':
                    console.log('📋 ===== PRODUCT AVAILABILITY REPORT CREATION =====');
                    console.log('📋 Final User ID for product report:', finalUserId);
                    console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
                    if (Array.isArray(details)) {
                        console.log('📋 Processing multiple products:', details.length);
                        try {
                            console.log('🚀 Attempting bulk insert with stored procedure...');
                            const bulkResult = await this.bulkInsertProductReports(mappedMainData.reportId, mappedMainData.clientId, finalUserId, details);
                            console.log('✅ Stored procedure bulk insert successful:', bulkResult);
                            console.log(`✅ Inserted ${bulkResult.inserted_count} product reports`);
                            return {
                                id: bulkResult.inserted_count > 0 ? 'bulk_' + Date.now() : null,
                                reportId: mappedMainData.reportId,
                                clientId: mappedMainData.clientId,
                                userId: finalUserId,
                                productName: details[0]?.productName || 'Bulk Products',
                                quantity: details[0]?.quantity || 0,
                                comment: `Bulk insert of ${bulkResult.inserted_count} products`,
                                productId: details[0]?.productId || null,
                                createdAt: new Date(),
                                bulkInserted: true,
                                insertedCount: bulkResult.inserted_count
                            };
                        }
                        catch (storedProcedureError) {
                            console.log('⚠️ Stored procedure failed, falling back to individual inserts:', storedProcedureError.message);
                            const savedProductReports = [];
                            for (let i = 0; i < details.length; i++) {
                                const productDetail = details[i];
                                console.log(`📋 Processing product ${i + 1}:`, JSON.stringify(productDetail, null, 2));
                                const { reportId: productReportId, ...productDetailsWithoutReportId } = productDetail;
                                const productDataToSave = {
                                    ...mappedMainData,
                                    ...productDetailsWithoutReportId,
                                    userId: finalUserId
                                };
                                console.log(`📋 Creating product report ${i + 1} with data:`, JSON.stringify(productDataToSave, null, 2));
                                const productReport = this.productReportRepository.create(productDataToSave);
                                console.log(`📋 Product report ${i + 1} entity created:`, JSON.stringify(productReport, null, 2));
                                const savedProductReport = await this.productReportRepository.save(productReport);
                                console.log(`✅ Product report ${i + 1} saved successfully!`);
                                console.log(`✅ Product report ${i + 1} ID:`, savedProductReport.id);
                                console.log(`✅ Product name:`, savedProductReport.productName);
                                console.log(`✅ Product quantity:`, savedProductReport.quantity);
                                console.log(`✅ Product comment:`, savedProductReport.comment);
                                console.log(`✅ Product report ${i + 1} created at:`, savedProductReport.createdAt);
                                savedProductReports.push(savedProductReport);
                            }
                            console.log('📋 ===== FALLBACK MULTIPLE PRODUCT REPORTS CREATION COMPLETE =====');
                            console.log(`✅ Total products saved via fallback: ${savedProductReports.length}`);
                            return savedProductReports[0];
                        }
                    }
                    else {
                        console.log('📋 Processing single product');
                        const { reportId: singleProductReportId, ...singleProductDetails } = details || {};
                        const singleProductDataToSave = {
                            ...mappedMainData,
                            ...singleProductDetails,
                            userId: finalUserId
                        };
                        console.log('📋 Creating single product report with data:', JSON.stringify(singleProductDataToSave, null, 2));
                        const singleProductReport = this.productReportRepository.create(singleProductDataToSave);
                        console.log('📋 Single product report entity created:', JSON.stringify(singleProductReport, null, 2));
                        const savedSingleProductReport = await this.productReportRepository.save(singleProductReport);
                        console.log('✅ Single product report saved successfully!');
                        console.log('✅ Product report ID:', savedSingleProductReport.id);
                        console.log('✅ Product name:', savedSingleProductReport.productName);
                        console.log('✅ Product quantity:', savedSingleProductReport.quantity);
                        console.log('✅ Product comment:', savedSingleProductReport.comment);
                        console.log('✅ Product report created at:', savedSingleProductReport.createdAt);
                        console.log('📋 ===== SINGLE PRODUCT REPORT CREATION COMPLETE =====');
                        return savedSingleProductReport;
                    }
                case 'VISIBILITY_ACTIVITY':
                    console.log('📋 ===== VISIBILITY ACTIVITY REPORT CREATION =====');
                    console.log('📋 Final User ID for visibility report:', finalUserId);
                    console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
                    const { reportId: visibilityReportId, ...visibilityDetails } = details || {};
                    const visibilityDataToSave = {
                        ...mappedMainData,
                        ...visibilityDetails,
                        userId: finalUserId
                    };
                    console.log('📋 Visibility data to save:', JSON.stringify(visibilityDataToSave, null, 2));
                    const todayVis = new Date();
                    const startOfDayVis = new Date(todayVis.getFullYear(), todayVis.getMonth(), todayVis.getDate(), 0, 0, 0, 0);
                    const endOfDayVis = new Date(todayVis.getFullYear(), todayVis.getMonth(), todayVis.getDate(), 23, 59, 59, 999);
                    const existingVisibilityReport = await this.visibilityReportRepository.findOne({
                        where: {
                            clientId: mappedMainData.clientId,
                            createdAt: (0, typeorm_2.Between)(startOfDayVis, endOfDayVis)
                        }
                    });
                    let savedVisibilityReport;
                    if (existingVisibilityReport) {
                        console.log('📋 Updating existing visibility report for same day:', existingVisibilityReport.id);
                        Object.assign(existingVisibilityReport, visibilityDataToSave);
                        savedVisibilityReport = await this.visibilityReportRepository.save(existingVisibilityReport);
                        console.log('✅ Existing visibility report updated successfully!');
                    }
                    else {
                        console.log('📋 Creating new visibility report with data:', JSON.stringify(visibilityDataToSave, null, 2));
                        const visibilityReport = this.visibilityReportRepository.create(visibilityDataToSave);
                        console.log('📋 Visibility report entity created:', JSON.stringify(visibilityReport, null, 2));
                        savedVisibilityReport = await this.visibilityReportRepository.save(visibilityReport);
                        console.log('✅ New visibility report saved successfully!');
                    }
                    console.log('✅ Visibility report ID:', savedVisibilityReport.id);
                    console.log('✅ Visibility comment:', savedVisibilityReport.comment);
                    console.log('✅ Visibility image URL:', savedVisibilityReport.imageUrl);
                    console.log('✅ Visibility report created at:', savedVisibilityReport.createdAt);
                    console.log('📋 ===== VISIBILITY ACTIVITY REPORT CREATION COMPLETE =====');
                    return savedVisibilityReport;
                case 'COMPETITOR':
                    console.log('📋 ===== COMPETITOR REPORT CREATION =====');
                    console.log('📋 Final User ID for competitor report:', finalUserId);
                    console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
                    if (Array.isArray(details)) {
                        console.log('📋 Processing multiple competitors:', details.length);
                        const savedCompetitorReports = [];
                        for (let i = 0; i < details.length; i++) {
                            const competitorDetail = details[i];
                            console.log(`📋 Processing competitor ${i + 1}:`, JSON.stringify(competitorDetail, null, 2));
                            const { reportId: competitorReportId, ...competitorDetailsWithoutReportId } = competitorDetail;
                            const competitorDataToSave = {
                                ...mappedMainData,
                                ...competitorDetailsWithoutReportId,
                                userId: finalUserId
                            };
                            console.log(`📋 Creating competitor report ${i + 1} with data:`, JSON.stringify(competitorDataToSave, null, 2));
                            const competitorReport = this.competitorReportRepository.create(competitorDataToSave);
                            console.log(`📋 Competitor report ${i + 1} entity created:`, JSON.stringify(competitorReport, null, 2));
                            const savedCompetitorReport = await this.competitorReportRepository.save(competitorReport);
                            console.log(`✅ Competitor report ${i + 1} saved successfully!`);
                            console.log(`✅ Competitor report ${i + 1} ID:`, savedCompetitorReport.id);
                            console.log(`✅ Competitor name:`, savedCompetitorReport.competitorName);
                            console.log(`✅ Product name:`, savedCompetitorReport.productName);
                            console.log(`✅ Price:`, savedCompetitorReport.price);
                            console.log(`✅ Competitor report ${i + 1} created at:`, savedCompetitorReport.createdAt);
                            savedCompetitorReports.push(savedCompetitorReport);
                        }
                        console.log('📋 ===== MULTIPLE COMPETITOR REPORTS CREATION COMPLETE =====');
                        console.log(`✅ Total competitors saved: ${savedCompetitorReports.length}`);
                        return savedCompetitorReports[0];
                    }
                    else {
                        console.log('📋 Processing single competitor');
                        const { reportId: singleCompetitorReportId, ...singleCompetitorDetails } = details || {};
                        const singleCompetitorDataToSave = {
                            ...mappedMainData,
                            ...singleCompetitorDetails,
                            userId: finalUserId
                        };
                        console.log('📋 Creating single competitor report with data:', JSON.stringify(singleCompetitorDataToSave, null, 2));
                        const singleCompetitorReport = this.competitorReportRepository.create(singleCompetitorDataToSave);
                        console.log('📋 Single competitor report entity created:', JSON.stringify(singleCompetitorReport, null, 2));
                        const savedSingleCompetitorReport = await this.competitorReportRepository.save(singleCompetitorReport);
                        console.log('✅ Single competitor report saved successfully!');
                        console.log('✅ Competitor report ID:', savedSingleCompetitorReport.id);
                        console.log('✅ Competitor name:', savedSingleCompetitorReport.competitorName);
                        console.log('✅ Product name:', savedSingleCompetitorReport.productName);
                        console.log('✅ Price:', savedSingleCompetitorReport.price);
                        console.log('✅ Competitor report created at:', savedSingleCompetitorReport.createdAt);
                        console.log('📋 ===== SINGLE COMPETITOR REPORT CREATION COMPLETE =====');
                        return savedSingleCompetitorReport;
                    }
                default:
                    console.error('❌ ===== UNKNOWN REPORT TYPE =====');
                    console.error('❌ Unknown report type:', reportType);
                    console.error('❌ Available types: FEEDBACK, PRODUCT_AVAILABILITY, VISIBILITY_ACTIVITY, COMPETITOR');
                    console.error('❌ Received data:', JSON.stringify(reportData, null, 2));
                    throw new Error(`Unknown report type: ${reportType}`);
            }
            console.log('📋 ===== REPORT SUBMISSION COMPLETE =====');
        }
        catch (error) {
            console.error('❌ ===== REPORT SUBMISSION ERROR =====');
            console.error('❌ Error submitting report:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Original report data:', JSON.stringify(reportData, null, 2));
            if (error.message && error.message.includes('ETIMEDOUT')) {
                console.error('❌ Database connection timeout detected');
                throw new Error('Database connection timeout. Please try again.');
            }
            if (error.message && (error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND'))) {
                console.error('❌ Database connection error detected');
                throw new Error('Database connection error. Please try again.');
            }
            throw new Error(`Failed to submit report: ${error.message}`);
        }
    }
    async getReportsByJourneyPlan(journeyPlanId, options) {
        try {
            console.log(`🔍 Getting reports for journey plan: ${journeyPlanId}`);
            const limit = options?.limit || 50;
            const offset = options?.offset || 0;
            const includeRelations = options?.includeRelations || false;
            const targetDate = options?.date || new Date();
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
            console.log(`📅 Filtering reports for ${targetDate.toDateString()}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
            const feedbackQuery = this.feedbackReportRepository
                .createQueryBuilder('feedback')
                .where('feedback.reportId = :journeyPlanId', { journeyPlanId })
                .andWhere('feedback.createdAt >= :startOfDay', { startOfDay })
                .andWhere('feedback.createdAt <= :endOfDay', { endOfDay })
                .orderBy('feedback.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const productQuery = this.productReportRepository
                .createQueryBuilder('product')
                .where('product.reportId = :journeyPlanId', { journeyPlanId })
                .andWhere('product.createdAt >= :startOfDay', { startOfDay })
                .andWhere('product.createdAt <= :endOfDay', { endOfDay })
                .orderBy('product.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const visibilityQuery = this.visibilityReportRepository
                .createQueryBuilder('visibility')
                .where('visibility.reportId = :journeyPlanId', { journeyPlanId })
                .andWhere('visibility.createdAt >= :startOfDay', { startOfDay })
                .andWhere('visibility.createdAt <= :endOfDay', { endOfDay })
                .orderBy('visibility.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const competitorQuery = this.competitorReportRepository
                .createQueryBuilder('competitor')
                .where('competitor.reportId = :journeyPlanId', { journeyPlanId })
                .andWhere('competitor.createdAt >= :startOfDay', { startOfDay })
                .andWhere('competitor.createdAt <= :endOfDay', { endOfDay })
                .orderBy('competitor.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            if (includeRelations) {
                feedbackQuery.leftJoinAndSelect('feedback.user', 'user');
                feedbackQuery.leftJoinAndSelect('feedback.client', 'client');
                productQuery.leftJoinAndSelect('product.user', 'user');
                productQuery.leftJoinAndSelect('product.client', 'client');
                visibilityQuery.leftJoinAndSelect('visibility.user', 'user');
                visibilityQuery.leftJoinAndSelect('visibility.client', 'client');
                competitorQuery.leftJoinAndSelect('competitor.user', 'user');
                competitorQuery.leftJoinAndSelect('competitor.client', 'client');
            }
            const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
                feedbackQuery.getMany(),
                productQuery.getMany(),
                visibilityQuery.getMany(),
                competitorQuery.getMany(),
            ]);
            console.log(`✅ Found ${feedbackReports.length} feedback reports, ${productReports.length} product reports, ${visibilityReports.length} visibility reports, ${competitorReports.length} competitor reports`);
            return {
                feedbackReports,
                productReports,
                visibilityReports,
                competitorReports,
                pagination: {
                    limit,
                    offset,
                    hasMore: feedbackReports.length === limit || productReports.length === limit || visibilityReports.length === limit || competitorReports.length === limit
                }
            };
        }
        catch (error) {
            console.error('❌ Error getting reports by journey plan:', error);
            throw new Error(`Failed to get reports: ${error.message}`);
        }
    }
    async getTodayReportsByJourneyPlan(journeyPlanId, options) {
        return this.getReportsByJourneyPlan(journeyPlanId, {
            ...options,
            date: new Date(),
        });
    }
    async findAll(options) {
        try {
            console.log('🔍 Getting all reports with optimized query');
            const limit = options?.limit || 100;
            const offset = options?.offset || 0;
            const includeRelations = options?.includeRelations || false;
            const feedbackQuery = this.feedbackReportRepository
                .createQueryBuilder('feedback')
                .orderBy('feedback.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const productQuery = this.productReportRepository
                .createQueryBuilder('product')
                .orderBy('product.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const visibilityQuery = this.visibilityReportRepository
                .createQueryBuilder('visibility')
                .orderBy('visibility.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            const competitorQuery = this.competitorReportRepository
                .createQueryBuilder('competitor')
                .orderBy('competitor.createdAt', 'DESC')
                .limit(limit)
                .offset(offset);
            if (options?.userId) {
                feedbackQuery.andWhere('feedback.userId = :userId', { userId: options.userId });
                productQuery.andWhere('product.userId = :userId', { userId: options.userId });
                visibilityQuery.andWhere('visibility.userId = :userId', { userId: options.userId });
                competitorQuery.andWhere('competitor.userId = :userId', { userId: options.userId });
            }
            if (options?.clientId) {
                feedbackQuery.andWhere('feedback.clientId = :clientId', { clientId: options.clientId });
                productQuery.andWhere('product.clientId = :clientId', { clientId: options.clientId });
                visibilityQuery.andWhere('visibility.clientId = :clientId', { clientId: options.clientId });
                competitorQuery.andWhere('competitor.clientId = :clientId', { clientId: options.clientId });
            }
            if (options?.startDate) {
                feedbackQuery.andWhere('feedback.createdAt >= :startDate', { startDate: options.startDate });
                productQuery.andWhere('product.createdAt >= :startDate', { startDate: options.startDate });
                visibilityQuery.andWhere('visibility.createdAt >= :startDate', { startDate: options.startDate });
                competitorQuery.andWhere('competitor.createdAt >= :startDate', { startDate: options.startDate });
            }
            if (options?.endDate) {
                feedbackQuery.andWhere('feedback.createdAt <= :endDate', { endDate: options.endDate });
                productQuery.andWhere('product.createdAt <= :endDate', { endDate: options.endDate });
                visibilityQuery.andWhere('visibility.createdAt <= :endDate', { endDate: options.endDate });
                competitorQuery.andWhere('competitor.createdAt <= :endDate', { endDate: options.endDate });
            }
            if (includeRelations) {
                feedbackQuery.leftJoinAndSelect('feedback.user', 'user');
                feedbackQuery.leftJoinAndSelect('feedback.client', 'client');
                productQuery.leftJoinAndSelect('product.user', 'user');
                productQuery.leftJoinAndSelect('product.client', 'client');
                visibilityQuery.leftJoinAndSelect('visibility.user', 'user');
                visibilityQuery.leftJoinAndSelect('visibility.client', 'client');
                competitorQuery.leftJoinAndSelect('competitor.user', 'user');
                competitorQuery.leftJoinAndSelect('competitor.client', 'client');
            }
            const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
                feedbackQuery.getMany(),
                productQuery.getMany(),
                visibilityQuery.getMany(),
                competitorQuery.getMany(),
            ]);
            console.log(`✅ Found ${feedbackReports.length} feedback reports, ${productReports.length} product reports, ${visibilityReports.length} visibility reports, ${competitorReports.length} competitor reports`);
            return {
                feedbackReports,
                productReports,
                visibilityReports,
                competitorReports,
                pagination: {
                    limit,
                    offset,
                    hasMore: feedbackReports.length === limit || productReports.length === limit || visibilityReports.length === limit || competitorReports.length === limit
                }
            };
        }
        catch (error) {
            console.error('❌ Error getting all reports:', error);
            throw new Error(`Failed to get all reports: ${error.message}`);
        }
    }
    async getReportCounts(journeyPlanId) {
        try {
            console.log(`🔍 Getting report counts${journeyPlanId ? ` for journey plan: ${journeyPlanId}` : ''}`);
            const feedbackQuery = this.feedbackReportRepository.createQueryBuilder('feedback');
            const productQuery = this.productReportRepository.createQueryBuilder('product');
            const visibilityQuery = this.visibilityReportRepository.createQueryBuilder('visibility');
            const competitorQuery = this.competitorReportRepository.createQueryBuilder('competitor');
            if (journeyPlanId) {
                feedbackQuery.where('feedback.reportId = :journeyPlanId', { journeyPlanId });
                productQuery.where('product.reportId = :journeyPlanId', { journeyPlanId });
                visibilityQuery.where('visibility.reportId = :journeyPlanId', { journeyPlanId });
                competitorQuery.where('competitor.reportId = :journeyPlanId', { journeyPlanId });
            }
            const [feedbackCount, productCount, visibilityCount, competitorCount] = await Promise.all([
                feedbackQuery.getCount(),
                productQuery.getCount(),
                visibilityQuery.getCount(),
                competitorQuery.getCount(),
            ]);
            console.log(`✅ Report counts - Feedback: ${feedbackCount}, Product: ${productCount}, Visibility: ${visibilityCount}, Competitor: ${competitorCount}`);
            return {
                feedbackCount,
                productCount,
                visibilityCount,
                competitorCount,
                totalCount: feedbackCount + productCount + visibilityCount + competitorCount
            };
        }
        catch (error) {
            console.error('❌ Error getting report counts:', error);
            throw new Error(`Failed to get report counts: ${error.message}`);
        }
    }
    async getVisitsByDate(date, userId) {
        try {
            console.log(`🔍 Getting visits for date: ${date}${userId ? ` for user: ${userId}` : ''}`);
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
            const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
                this.feedbackReportRepository.find({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                        userId: userId,
                    },
                    relations: ['client', 'user'],
                }),
                this.productReportRepository.find({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                        userId: userId,
                    },
                    relations: ['client', 'user'],
                }),
                this.visibilityReportRepository.find({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                        userId: userId,
                    },
                    relations: ['client', 'user'],
                }),
                this.competitorReportRepository.find({
                    where: {
                        createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                        userId: userId,
                    },
                    relations: ['client', 'user'],
                }),
            ]);
            const visitsMap = new Map();
            feedbackReports.forEach(report => {
                const clientId = report.clientId;
                if (!visitsMap.has(clientId)) {
                    visitsMap.set(clientId, {
                        clientId: clientId,
                        clientName: report.client?.name || 'Unknown Client',
                        userId: report.userId,
                        userName: report.user?.name || 'Unknown User',
                        date: date,
                        feedbackReports: [],
                        productReports: [],
                        visibilityReports: [],
                        competitorReports: [],
                        totalReports: 0,
                        isComplete: false,
                    });
                }
                visitsMap.get(clientId).feedbackReports.push(report);
                visitsMap.get(clientId).totalReports++;
            });
            productReports.forEach(report => {
                const clientId = report.clientId;
                if (!visitsMap.has(clientId)) {
                    visitsMap.set(clientId, {
                        clientId: clientId,
                        clientName: report.client?.name || 'Unknown Client',
                        userId: report.userId,
                        userName: report.user?.name || 'Unknown User',
                        date: date,
                        feedbackReports: [],
                        productReports: [],
                        visibilityReports: [],
                        competitorReports: [],
                        totalReports: 0,
                        isComplete: false,
                    });
                }
                visitsMap.get(clientId).productReports.push(report);
                visitsMap.get(clientId).totalReports++;
            });
            visibilityReports.forEach(report => {
                const clientId = report.clientId;
                if (!visitsMap.has(clientId)) {
                    visitsMap.set(clientId, {
                        clientId: clientId,
                        clientName: report.client?.name || 'Unknown Client',
                        userId: report.userId,
                        userName: report.user?.name || 'Unknown User',
                        date: date,
                        feedbackReports: [],
                        productReports: [],
                        visibilityReports: [],
                        competitorReports: [],
                        totalReports: 0,
                        isComplete: false,
                    });
                }
                visitsMap.get(clientId).visibilityReports.push(report);
                visitsMap.get(clientId).totalReports++;
            });
            competitorReports.forEach(report => {
                const clientId = report.clientId;
                if (!visitsMap.has(clientId)) {
                    visitsMap.set(clientId, {
                        clientId: clientId,
                        clientName: report.client?.name || 'Unknown Client',
                        userId: report.userId,
                        userName: report.user?.name || 'Unknown User',
                        date: date,
                        feedbackReports: [],
                        productReports: [],
                        visibilityReports: [],
                        competitorReports: [],
                        totalReports: 0,
                        isComplete: false,
                    });
                }
                visitsMap.get(clientId).competitorReports.push(report);
                visitsMap.get(clientId).totalReports++;
            });
            const visits = Array.from(visitsMap.values()).map(visit => ({
                ...visit,
                isComplete: visit.totalReports >= 3,
                completionPercentage: (visit.totalReports / 3) * 100,
            }));
            console.log(`✅ Found ${visits.length} visits for date ${date}`);
            return visits;
        }
        catch (error) {
            console.error('❌ Error getting visits by date:', error);
            throw new Error(`Failed to get visits by date: ${error.message}`);
        }
    }
    async getWeeklyVisits(userId, weekStart) {
        try {
            console.log(`🔍 Getting weekly reports for user: ${userId} for week starting: ${weekStart.toISOString()}`);
            console.log(`🔍 User ID: ${userId} (type: ${typeof userId})`);
            const getDateKey = (date) => {
                return date.toISOString().split('T')[0];
            };
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            console.log(`🔍 Week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
            console.log(`🔍 Fetching reports for user ${userId} between ${weekStart.toISOString()} and ${weekEnd.toISOString()}...`);
            const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
                this.feedbackReportRepository.find({
                    where: {
                        userId,
                        createdAt: (0, typeorm_2.Between)(weekStart, weekEnd)
                    },
                    relations: ['client', 'user'],
                }),
                this.productReportRepository.find({
                    where: {
                        userId,
                        createdAt: (0, typeorm_2.Between)(weekStart, weekEnd)
                    },
                    relations: ['client', 'user'],
                }),
                this.visibilityReportRepository.find({
                    where: {
                        userId,
                        createdAt: (0, typeorm_2.Between)(weekStart, weekEnd)
                    },
                    relations: ['client', 'user'],
                }),
                this.competitorReportRepository.find({
                    where: {
                        userId,
                        createdAt: (0, typeorm_2.Between)(weekStart, weekEnd)
                    },
                    relations: ['client', 'user'],
                }),
            ]);
            console.log(`🔍 ALL reports found for user ${userId}:`);
            console.log(`  - Feedback reports: ${feedbackReports.length}`);
            console.log(`  - Product reports: ${productReports.length}`);
            console.log(`  - Visibility reports: ${visibilityReports.length}`);
            console.log(`  - Competitor reports: ${competitorReports.length}`);
            if (feedbackReports.length > 0) {
                console.log(`  - Sample feedback: ID ${feedbackReports[0].id}, Client ${feedbackReports[0].clientId}, Date ${feedbackReports[0].createdAt}`);
            }
            if (productReports.length > 0) {
                console.log(`  - Sample product: ID ${productReports[0].id}, Client ${productReports[0].clientId}, Date ${productReports[0].createdAt}`);
            }
            if (visibilityReports.length > 0) {
                console.log(`  - Sample visibility: ID ${visibilityReports[0].id}, Client ${visibilityReports[0].clientId}, Date ${visibilityReports[0].createdAt}`);
            }
            if (competitorReports.length > 0) {
                console.log(`  - Sample competitor: ID ${competitorReports[0].id}, Client ${competitorReports[0].clientId}, Date ${competitorReports[0].createdAt}`);
            }
            const totalReports = feedbackReports.length + productReports.length + visibilityReports.length + competitorReports.length;
            console.log(`📊 Total reports found: ${totalReports}`);
            if (totalReports === 0) {
                console.log('⚠️ No reports found for this user in the specified week');
                const result = {};
                for (let i = 0; i < 7; i++) {
                    const date = new Date(weekStart);
                    date.setDate(weekStart.getDate() + i);
                    result[getDateKey(date)] = [];
                }
                return result;
            }
            console.log('✅ Reports found! Processing data...');
            console.log('🔍 Processing reports - grouping by date and journey plan...');
            const result = {};
            const allReports = [
                ...feedbackReports.map(r => ({ ...r, type: 'feedback' })),
                ...productReports.map(r => ({ ...r, type: 'product' })),
                ...visibilityReports.map(r => ({ ...r, type: 'visibility' })),
                ...competitorReports.map(r => ({ ...r, type: 'competitor' }))
            ];
            console.log(`🔍 Processing ${allReports.length} total reports...`);
            allReports.forEach(report => {
                if (!report || !report.createdAt) {
                    console.warn('⚠️ Skipping report with missing createdAt:', report);
                    return;
                }
                if (!report.clientId || !report.userId) {
                    console.warn('⚠️ Skipping report with missing clientId or userId:', report);
                    return;
                }
                let dateKey;
                try {
                    dateKey = getDateKey(report.createdAt);
                    console.log(`📅 Report on ${dateKey}: ${report.type} for client ${report.clientId}, JP: ${report.reportId}`);
                    if (!result[dateKey]) {
                        result[dateKey] = [];
                    }
                }
                catch (error) {
                    console.error('❌ Error processing report date:', error, report);
                    return;
                }
                const existingVisitIndex = result[dateKey].findIndex(visit => visit.reportId === report.reportId);
                if (existingVisitIndex >= 0) {
                    const existingVisit = result[dateKey][existingVisitIndex];
                    if (report.type === 'feedback') {
                        if (!existingVisit.feedbackReports)
                            existingVisit.feedbackReports = [];
                        existingVisit.feedbackReports.push({
                            id: report.id,
                            comment: report.comment,
                            createdAt: report.createdAt,
                            type: 'feedback'
                        });
                    }
                    else if (report.type === 'product') {
                        if (!existingVisit.productReports)
                            existingVisit.productReports = [];
                        existingVisit.productReports.push({
                            id: report.id,
                            productName: report.productName,
                            quantity: report.quantity,
                            comment: report.comment,
                            productId: report.productId,
                            createdAt: report.createdAt,
                            type: 'product'
                        });
                    }
                    else if (report.type === 'visibility') {
                        if (!existingVisit.visibilityReports)
                            existingVisit.visibilityReports = [];
                        existingVisit.visibilityReports.push({
                            id: report.id,
                            comment: report.comment,
                            imageUrl: report.imageUrl,
                            createdAt: report.createdAt,
                            type: 'visibility'
                        });
                    }
                    else if (report.type === 'competitor') {
                        if (!existingVisit.competitorReports)
                            existingVisit.competitorReports = [];
                        existingVisit.competitorReports.push({
                            id: report.id,
                            competitorName: report.competitorName,
                            productName: report.productName,
                            price: report.price,
                            quantity: report.quantity,
                            promotion: report.promotion,
                            comment: report.comment,
                            imageUrl: report.imageUrl,
                            createdAt: report.createdAt,
                            type: 'competitor'
                        });
                    }
                    existingVisit.totalReports = (existingVisit.feedbackReports?.length || 0) +
                        (existingVisit.productReports?.length || 0) +
                        (existingVisit.visibilityReports?.length || 0) +
                        (existingVisit.competitorReports?.length || 0);
                    existingVisit.isComplete = existingVisit.totalReports >= 3;
                }
                else {
                    const newVisit = {
                        id: report.id,
                        reportId: report.reportId,
                        clientId: report.clientId,
                        clientName: report.client?.name || `Client ${report.clientId}`,
                        userId: report.userId,
                        userName: report.user?.name || `User ${report.userId}`,
                        date: dateKey,
                        visitTime: report.createdAt,
                        createdAt: report.createdAt,
                        totalReports: 1,
                        isComplete: false,
                        feedbackReports: [],
                        productReports: [],
                        visibilityReports: [],
                        competitorReports: []
                    };
                    if (report.type === 'feedback') {
                        newVisit.feedbackReports = [{
                                id: report.id,
                                comment: report.comment,
                                createdAt: report.createdAt,
                                type: 'feedback'
                            }];
                    }
                    else if (report.type === 'product') {
                        newVisit.productReports = [{
                                id: report.id,
                                productName: report.productName,
                                quantity: report.quantity,
                                comment: report.comment,
                                productId: report.productId,
                                createdAt: report.createdAt,
                                type: 'product'
                            }];
                    }
                    else if (report.type === 'visibility') {
                        newVisit.visibilityReports = [{
                                id: report.id,
                                comment: report.comment,
                                imageUrl: report.imageUrl,
                                createdAt: report.createdAt,
                                type: 'visibility'
                            }];
                    }
                    else if (report.type === 'competitor') {
                        newVisit.competitorReports = [{
                                id: report.id,
                                competitorName: report.competitorName,
                                productName: report.productName,
                                price: report.price,
                                quantity: report.quantity,
                                promotion: report.promotion,
                                comment: report.comment,
                                imageUrl: report.imageUrl,
                                createdAt: report.createdAt,
                                type: 'competitor'
                            }];
                    }
                    result[dateKey].push(newVisit);
                }
            });
            console.log(`✅ Grouped reports into ${Object.keys(result).length} dates`);
            console.log(`📊 Dates with visits: ${Object.keys(result)}`);
            Object.keys(result).forEach(dateKey => {
                const visits = result[dateKey];
                console.log(`📅 ${dateKey}: ${visits.length} visits`);
                visits.forEach((visit, index) => {
                    console.log(`  Visit ${index + 1}: JP ${visit.reportId}, Client ${visit.clientId} (${visit.clientName}), Reports: ${visit.totalReports}, Complete: ${visit.isComplete}`);
                });
            });
            const weeklyResult = {};
            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                const dateKey = getDateKey(date);
                weeklyResult[dateKey] = result[dateKey] || [];
            }
            console.log(`🔍 Final result structure:`, JSON.stringify(weeklyResult, null, 2));
            console.log(`🔍 Final result type: ${typeof weeklyResult}`);
            console.log(`🔍 Final result keys: ${Object.keys(weeklyResult)}`);
            return weeklyResult;
        }
        catch (error) {
            console.error('❌ Error getting weekly visits:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            return {};
        }
    }
    async bulkInsertProductReports(journeyPlanId, clientId, userId, products) {
        try {
            console.log('🚀 BulkInsertProductReports: Starting bulk insert');
            console.log(`🚀 Journey Plan ID: ${journeyPlanId}`);
            console.log(`🚀 Client ID: ${clientId}`);
            console.log(`🚀 User ID: ${userId}`);
            console.log(`🚀 Products count: ${products.length}`);
            if (!journeyPlanId || journeyPlanId <= 0) {
                throw new Error('Invalid journey plan ID');
            }
            if (!clientId || clientId <= 0) {
                throw new Error('Invalid client ID');
            }
            if (!userId || userId <= 0) {
                throw new Error('Invalid user ID');
            }
            if (!products || products.length === 0) {
                throw new Error('No products provided');
            }
            const productsJson = JSON.stringify(products);
            console.log('🚀 Products JSON:', productsJson);
            const result = await this.dataSource.query('CALL BulkInsertProductReports(?, ?, ?, ?)', [journeyPlanId, clientId, userId, productsJson]);
            console.log('🚀 Stored procedure result:', result);
            if (result && result.length > 0 && result[0].length > 0) {
                const procedureResult = result[0][0];
                console.log('✅ Stored procedure executed successfully:', procedureResult);
                if (procedureResult.status === 'SUCCESS') {
                    return {
                        status: 'SUCCESS',
                        message: procedureResult.message,
                        inserted_count: procedureResult.inserted_count,
                        journey_plan_id: procedureResult.journey_plan_id,
                        client_id: procedureResult.client_id,
                        user_id: procedureResult.user_id
                    };
                }
                else {
                    throw new Error(`Stored procedure error: ${procedureResult.message}`);
                }
            }
            else {
                throw new Error('No result returned from stored procedure');
            }
        }
        catch (error) {
            console.error('❌ BulkInsertProductReports error:', error);
            throw error;
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_report_entity_1.FeedbackReport)),
    __param(1, (0, typeorm_1.InjectRepository)(product_report_entity_1.ProductReport)),
    __param(2, (0, typeorm_1.InjectRepository)(visibility_report_entity_1.VisibilityReport)),
    __param(3, (0, typeorm_1.InjectRepository)(competitor_report_entity_1.CompetitorReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ReportsService);
//# sourceMappingURL=reports.service.js.map