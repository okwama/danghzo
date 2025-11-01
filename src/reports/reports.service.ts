import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { FeedbackReport } from '../entities/feedback-report.entity';
import { ProductReport } from '../entities/product-report.entity';
import { VisibilityReport } from '../entities/visibility-report.entity';
import { CompetitorReport } from '../entities/competitor-report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(FeedbackReport)
    private feedbackReportRepository: Repository<FeedbackReport>,
    @InjectRepository(ProductReport)
    private productReportRepository: Repository<ProductReport>,
    @InjectRepository(VisibilityReport)
    private visibilityReportRepository: Repository<VisibilityReport>,
    @InjectRepository(CompetitorReport)
    private competitorReportRepository: Repository<CompetitorReport>,
    private dataSource: DataSource,
  ) {}

  async submitReport(reportData: any, authenticatedUserId?: number): Promise<any> {
    try {
      console.log('📋 ===== REPORT SUBMISSION START =====');
      console.log('📋 Received report data:', JSON.stringify(reportData, null, 2));
      console.log('📋 Authenticated user ID:', authenticatedUserId);
      
      // Handle both 'type' and 'reportType' for compatibility
      const reportType = reportData.type || reportData.reportType;
      const { type, reportType: _, details, salesRepId, userId, journeyPlanId, ...mainData } = reportData;
      
      // Ensure we always have a valid userId - prioritize authenticated user, then request body, then salesRepId
      const finalUserId = authenticatedUserId || userId || salesRepId;
      
      if (!finalUserId) {
        throw new Error('No valid user ID found. Authentication required.');
      }
      
      // Map journeyPlanId to reportId for database compatibility
      const mappedMainData = {
        ...mainData,
        reportId: journeyPlanId, // Map journeyPlanId to reportId
        userId: finalUserId, // Always include the final userId
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
          
          // Extract reportId from details and exclude it to avoid duplicate key errors
          const { reportId: feedbackReportId, ...feedbackDetails } = details || {};
          
          // Combine main data with details and map userId/salesRepId properly
          const feedbackDataToSave = {
            ...mappedMainData,
            ...feedbackDetails,
            userId: finalUserId // Use the final userId that we ensured is valid
          };

          console.log('📋 Feedback data to save:', JSON.stringify(feedbackDataToSave, null, 2));

          // Check if a feedback report already exists for this client on the same day
          // Note: FeedbackReport has unique constraint on (clientId, DATE(createdAt)), so only one report per client per day
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
          
          const existingFeedbackReport = await this.feedbackReportRepository.findOne({
            where: { 
              clientId: mappedMainData.clientId,
              createdAt: Between(startOfDay, endOfDay)
            }
          });

          let savedFeedbackReport;
          
          if (existingFeedbackReport) {
            console.log('📋 Updating existing feedback report for same day:', existingFeedbackReport.id);
            // Update existing report (keep same timestamp for same day)
            Object.assign(existingFeedbackReport, feedbackDataToSave);
            savedFeedbackReport = await this.feedbackReportRepository.save(existingFeedbackReport);
            console.log('✅ Existing feedback report updated successfully!');
          } else {
            console.log('📋 Creating new feedback report with data:', JSON.stringify(feedbackDataToSave, null, 2));
            // Create new report
            const feedbackReport = this.feedbackReportRepository.create(feedbackDataToSave);
            console.log('📋 Feedback report entity created:', JSON.stringify(feedbackReport, null, 2));
            savedFeedbackReport = await this.feedbackReportRepository.save(feedbackReport);
            console.log('✅ New feedback report saved successfully!');
          }
          
          console.log('✅ Feedback report ID:', (savedFeedbackReport as any).id);
          console.log('✅ Feedback report comment:', (savedFeedbackReport as any).comment);
          console.log('✅ Feedback report created at:', (savedFeedbackReport as any).createdAt);
          console.log('📋 ===== FEEDBACK REPORT CREATION COMPLETE =====');
          return savedFeedbackReport;

        case 'PRODUCT_AVAILABILITY':
          console.log('📋 ===== PRODUCT AVAILABILITY REPORT CREATION =====');
          console.log('📋 Final User ID for product report:', finalUserId);
          console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
          
          // Check if details is an array (multiple products) or object (single product)
          if (Array.isArray(details)) {
            console.log('📋 Processing multiple products:', details.length);
            
            // Try stored procedure first for bulk operations
            try {
              console.log('🚀 Attempting bulk insert with stored procedure...');
              const bulkResult = await this.bulkInsertProductReports(
                mappedMainData.reportId,
                mappedMainData.clientId,
                finalUserId,
                details
              );
              
              console.log('✅ Stored procedure bulk insert successful:', bulkResult);
              console.log(`✅ Inserted ${bulkResult.inserted_count} product reports`);
              
              // Return a representative result for backward compatibility
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
              
            } catch (storedProcedureError) {
              console.log('⚠️ Stored procedure failed, falling back to individual inserts:', storedProcedureError.message);
              
              // Fallback to individual inserts
              const savedProductReports = [];
              
              for (let i = 0; i < details.length; i++) {
                const productDetail = details[i];
                console.log(`📋 Processing product ${i + 1}:`, JSON.stringify(productDetail, null, 2));
                
                // Extract reportId from product detail and exclude it
                const { reportId: productReportId, ...productDetailsWithoutReportId } = productDetail;
                
                // Combine main data with product details
                const productDataToSave = {
                  ...mappedMainData,
                  ...productDetailsWithoutReportId,
                  userId: finalUserId // Use userId if provided, otherwise use salesRepId
                };

                console.log(`📋 Creating product report ${i + 1} with data:`, JSON.stringify(productDataToSave, null, 2));
                const productReport = this.productReportRepository.create(productDataToSave);
                console.log(`📋 Product report ${i + 1} entity created:`, JSON.stringify(productReport, null, 2));
                const savedProductReport = await this.productReportRepository.save(productReport);
                
                console.log(`✅ Product report ${i + 1} saved successfully!`);
                console.log(`✅ Product report ${i + 1} ID:`, (savedProductReport as any).id);
                console.log(`✅ Product name:`, (savedProductReport as any).productName);
                console.log(`✅ Product quantity:`, (savedProductReport as any).quantity);
                console.log(`✅ Product comment:`, (savedProductReport as any).comment);
                console.log(`✅ Product report ${i + 1} created at:`, (savedProductReport as any).createdAt);
                
                savedProductReports.push(savedProductReport);
              }
              
              console.log('📋 ===== FALLBACK MULTIPLE PRODUCT REPORTS CREATION COMPLETE =====');
              console.log(`✅ Total products saved via fallback: ${savedProductReports.length}`);
              
              // Return the first saved report for backward compatibility
              return savedProductReports[0];
            }
          } else {
            // Single product report (existing logic)
            console.log('📋 Processing single product');
            
            // Extract reportId from details and exclude it to avoid duplicate key errors
            const { reportId: singleProductReportId, ...singleProductDetails } = details || {};
            
            // Combine main data with details and map userId/salesRepId properly
            const singleProductDataToSave = {
              ...mappedMainData,
              ...singleProductDetails,
              userId: finalUserId // Use userId if provided, otherwise use salesRepId
            };

            console.log('📋 Creating single product report with data:', JSON.stringify(singleProductDataToSave, null, 2));
            const singleProductReport = this.productReportRepository.create(singleProductDataToSave);
            console.log('📋 Single product report entity created:', JSON.stringify(singleProductReport, null, 2));
            const savedSingleProductReport = await this.productReportRepository.save(singleProductReport);
            console.log('✅ Single product report saved successfully!');
            console.log('✅ Product report ID:', (savedSingleProductReport as any).id);
            console.log('✅ Product name:', (savedSingleProductReport as any).productName);
            console.log('✅ Product quantity:', (savedSingleProductReport as any).quantity);
            console.log('✅ Product comment:', (savedSingleProductReport as any).comment);
            console.log('✅ Product report created at:', (savedSingleProductReport as any).createdAt);
            console.log('📋 ===== SINGLE PRODUCT REPORT CREATION COMPLETE =====');
            return savedSingleProductReport;
          }

        case 'VISIBILITY_ACTIVITY':
          console.log('📋 ===== VISIBILITY ACTIVITY REPORT CREATION =====');
          console.log('📋 Final User ID for visibility report:', finalUserId);
          console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
          
          // Extract reportId from details and exclude it to avoid duplicate key errors
          const { reportId: visibilityReportId, ...visibilityDetails } = details || {};
          
          // Combine main data with details and map userId/salesRepId properly
          const visibilityDataToSave = {
            ...mappedMainData,
            ...visibilityDetails,
            userId: finalUserId // Use the final userId that we ensured is valid
          };

          console.log('📋 Visibility data to save:', JSON.stringify(visibilityDataToSave, null, 2));

          // Check if a visibility report already exists for this client on the same day
          const todayVis = new Date();
          const startOfDayVis = new Date(todayVis.getFullYear(), todayVis.getMonth(), todayVis.getDate(), 0, 0, 0, 0);
          const endOfDayVis = new Date(todayVis.getFullYear(), todayVis.getMonth(), todayVis.getDate(), 23, 59, 59, 999);
          
          const existingVisibilityReport = await this.visibilityReportRepository.findOne({
            where: { 
              clientId: mappedMainData.clientId,
              createdAt: Between(startOfDayVis, endOfDayVis)
            }
          });

          let savedVisibilityReport;
          
          if (existingVisibilityReport) {
            console.log('📋 Updating existing visibility report for same day:', existingVisibilityReport.id);
            // Update existing report (keep same timestamp for same day)
            Object.assign(existingVisibilityReport, visibilityDataToSave);
            savedVisibilityReport = await this.visibilityReportRepository.save(existingVisibilityReport);
            console.log('✅ Existing visibility report updated successfully!');
          } else {
            console.log('📋 Creating new visibility report with data:', JSON.stringify(visibilityDataToSave, null, 2));
            // Create new report
            const visibilityReport = this.visibilityReportRepository.create(visibilityDataToSave);
            console.log('📋 Visibility report entity created:', JSON.stringify(visibilityReport, null, 2));
            savedVisibilityReport = await this.visibilityReportRepository.save(visibilityReport);
            console.log('✅ New visibility report saved successfully!');
          }
          
          console.log('✅ Visibility report ID:', (savedVisibilityReport as any).id);
          console.log('✅ Visibility comment:', (savedVisibilityReport as any).comment);
          console.log('✅ Visibility image URL:', (savedVisibilityReport as any).imageUrl);
          console.log('✅ Visibility report created at:', (savedVisibilityReport as any).createdAt);
          console.log('📋 ===== VISIBILITY ACTIVITY REPORT CREATION COMPLETE =====');
          return savedVisibilityReport;

        case 'COMPETITOR':
          console.log('📋 ===== COMPETITOR REPORT CREATION =====');
          console.log('📋 Final User ID for competitor report:', finalUserId);
          console.log('📋 Mapped main data:', JSON.stringify(mappedMainData, null, 2));
          
          // Check if details is an array (multiple competitors) or object (single competitor)
          if (Array.isArray(details)) {
            console.log('📋 Processing multiple competitors:', details.length);
            
            // Handle bulk competitor reports
            const savedCompetitorReports = [];
            
            for (let i = 0; i < details.length; i++) {
              const competitorDetail = details[i];
              console.log(`📋 Processing competitor ${i + 1}:`, JSON.stringify(competitorDetail, null, 2));
              
              // Extract reportId from competitor detail and exclude it
              const { reportId: competitorReportId, ...competitorDetailsWithoutReportId } = competitorDetail;
              
              // Combine main data with competitor details
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
              console.log(`✅ Competitor report ${i + 1} ID:`, (savedCompetitorReport as any).id);
              console.log(`✅ Competitor name:`, (savedCompetitorReport as any).competitorName);
              console.log(`✅ Product name:`, (savedCompetitorReport as any).productName);
              console.log(`✅ Price:`, (savedCompetitorReport as any).price);
              console.log(`✅ Competitor report ${i + 1} created at:`, (savedCompetitorReport as any).createdAt);
              
              savedCompetitorReports.push(savedCompetitorReport);
            }
            
            console.log('📋 ===== MULTIPLE COMPETITOR REPORTS CREATION COMPLETE =====');
            console.log(`✅ Total competitors saved: ${savedCompetitorReports.length}`);
            
            // Return the first saved report for backward compatibility
            return savedCompetitorReports[0];
          } else {
            // Single competitor report
            console.log('📋 Processing single competitor');
            
            // Extract reportId from details and exclude it to avoid duplicate key errors
            const { reportId: singleCompetitorReportId, ...singleCompetitorDetails } = details || {};
            
            // Combine main data with details and map userId/salesRepId properly
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
            console.log('✅ Competitor report ID:', (savedSingleCompetitorReport as any).id);
            console.log('✅ Competitor name:', (savedSingleCompetitorReport as any).competitorName);
            console.log('✅ Product name:', (savedSingleCompetitorReport as any).productName);
            console.log('✅ Price:', (savedSingleCompetitorReport as any).price);
            console.log('✅ Competitor report created at:', (savedSingleCompetitorReport as any).createdAt);
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
    } catch (error) {
      console.error('❌ ===== REPORT SUBMISSION ERROR =====');
      console.error('❌ Error submitting report:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Original report data:', JSON.stringify(reportData, null, 2));
      
      // Handle database timeout errors specifically
      if (error.message && error.message.includes('ETIMEDOUT')) {
        console.error('❌ Database connection timeout detected');
        throw new Error('Database connection timeout. Please try again.');
      }
      
      // Handle other database connection errors
      if (error.message && (error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND'))) {
        console.error('❌ Database connection error detected');
        throw new Error('Database connection error. Please try again.');
      }
      
      throw new Error(`Failed to submit report: ${error.message}`);
    }
  }

  async getReportsByJourneyPlan(journeyPlanId: number, options?: {
    limit?: number;
    offset?: number;
    includeRelations?: boolean;
    date?: Date; // Optional date filter, defaults to today
  }): Promise<any> {
    try {
      console.log(`🔍 Getting reports for journey plan: ${journeyPlanId}`);
      
      const limit = options?.limit || 50; // Default limit to prevent slow queries
      const offset = options?.offset || 0;
      const includeRelations = options?.includeRelations || false;

      // Get date range (default to today if not specified)
      const targetDate = options?.date || new Date();
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      console.log(`📅 Filtering reports for ${targetDate.toDateString()}: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

      // Build optimized queries with pagination and filtering by today's date
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

      // Only add relations if specifically requested
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
    } catch (error) {
      console.error('❌ Error getting reports by journey plan:', error);
      throw new Error(`Failed to get reports: ${error.message}`);
    }
  }

  /// Get today's reports for a journey plan
  async getTodayReportsByJourneyPlan(journeyPlanId: number, options?: {
    limit?: number;
    offset?: number;
    includeRelations?: boolean;
  }): Promise<any> {
    return this.getReportsByJourneyPlan(journeyPlanId, {
      ...options,
      date: new Date(), // Today's date
    });
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    includeRelations?: boolean;
    userId?: number;
    clientId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      console.log('🔍 Getting all reports with optimized query');
      
      const limit = options?.limit || 100; // Default limit to prevent slow queries
      const offset = options?.offset || 0;
      const includeRelations = options?.includeRelations || false;

      // Build base queries with pagination
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

      // Add filters if provided
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

      // Only add relations if specifically requested
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
    } catch (error) {
      console.error('❌ Error getting all reports:', error);
      throw new Error(`Failed to get all reports: ${error.message}`);
    }
  }

  // New method to get report counts for dashboard
  async getReportCounts(journeyPlanId?: number): Promise<any> {
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
    } catch (error) {
      console.error('❌ Error getting report counts:', error);
      throw new Error(`Failed to get report counts: ${error.message}`);
    }
  }

  // New method to get visits with reports grouped by date and client
  async getVisitsByDate(date: string, userId: number): Promise<any> {
    try {
      console.log(`🔍 Getting visits for date: ${date}${userId ? ` for user: ${userId}` : ''}`);
      
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      // Get all reports for the specified date - always filter by authenticated user for security
      const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
        this.feedbackReportRepository.find({
          where: {
            createdAt: Between(startOfDay, endOfDay),
            userId: userId, // Always filter by authenticated user
          },
          relations: ['client', 'user'],
        }),
        this.productReportRepository.find({
          where: {
            createdAt: Between(startOfDay, endOfDay),
            userId: userId, // Always filter by authenticated user
          },
          relations: ['client', 'user'],
        }),
        this.visibilityReportRepository.find({
          where: {
            createdAt: Between(startOfDay, endOfDay),
            userId: userId, // Always filter by authenticated user
          },
          relations: ['client', 'user'],
        }),
        this.competitorReportRepository.find({
          where: {
            createdAt: Between(startOfDay, endOfDay),
            userId: userId, // Always filter by authenticated user
          },
          relations: ['client', 'user'],
        }),
      ]);

      // Group reports by client
      const visitsMap = new Map();

      // Process feedback reports
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

      // Process product reports
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

      // Process visibility reports
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

      // Process competitor reports
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

      // Calculate completion status and convert to array
      const visits = Array.from(visitsMap.values()).map(visit => ({
        ...visit,
        isComplete: visit.totalReports >= 3, // Consider complete if all 3 core report types exist (competitor is optional)
        completionPercentage: (visit.totalReports / 3) * 100,
      }));

      console.log(`✅ Found ${visits.length} visits for date ${date}`);
      return visits;
    } catch (error) {
      console.error('❌ Error getting visits by date:', error);
      throw new Error(`Failed to get visits by date: ${error.message}`);
    }
  }

  // Simplified method to get ALL reports for user (no date filtering)
  async getWeeklyVisits(userId: number, weekStart: Date): Promise<{ [date: string]: any[] }> {
    try {
      console.log(`🔍 Getting weekly reports for user: ${userId} for week starting: ${weekStart.toISOString()}`);
      console.log(`🔍 User ID: ${userId} (type: ${typeof userId})`);
      
      // Helper function to get date key
      const getDateKey = (date: Date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      // Calculate the week range (Monday to Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // End of Sunday
      
      console.log(`🔍 Week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
      
      // Get reports for this specific week
      console.log(`🔍 Fetching reports for user ${userId} between ${weekStart.toISOString()} and ${weekEnd.toISOString()}...`);
      
      const [feedbackReports, productReports, visibilityReports, competitorReports] = await Promise.all([
        this.feedbackReportRepository.find({ 
          where: { 
            userId,
            createdAt: Between(weekStart, weekEnd)
          },
          relations: ['client', 'user'],
        }),
        this.productReportRepository.find({ 
          where: { 
            userId,
            createdAt: Between(weekStart, weekEnd)
          },
          relations: ['client', 'user'],
        }),
        this.visibilityReportRepository.find({ 
          where: { 
            userId,
            createdAt: Between(weekStart, weekEnd)
          },
          relations: ['client', 'user'],
        }),
        this.competitorReportRepository.find({ 
          where: { 
            userId,
            createdAt: Between(weekStart, weekEnd)
          },
          relations: ['client', 'user'],
        }),
      ]);
      
      console.log(`🔍 ALL reports found for user ${userId}:`);
      console.log(`  - Feedback reports: ${feedbackReports.length}`);
      console.log(`  - Product reports: ${productReports.length}`);
      console.log(`  - Visibility reports: ${visibilityReports.length}`);
      console.log(`  - Competitor reports: ${competitorReports.length}`);
      
      // Log sample data if found
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

      // Check if we found any reports
      const totalReports = feedbackReports.length + productReports.length + visibilityReports.length + competitorReports.length;
      console.log(`📊 Total reports found: ${totalReports}`);
      
      if (totalReports === 0) {
        console.log('⚠️ No reports found for this user in the specified week');
        // Return empty arrays for all 7 days of the week
        const result: { [date: string]: any[] } = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          result[getDateKey(date)] = [];
        }
        return result;
      }
      
      console.log('✅ Reports found! Processing data...');

      // Group reports by date and then by journey plan (reportId)
      console.log('🔍 Processing reports - grouping by date and journey plan...');
      const result: { [date: string]: any[] } = {};
      
      // Process all reports and group by date and journey plan
      const allReports = [
        ...feedbackReports.map(r => ({ ...r, type: 'feedback' as const })),
        ...productReports.map(r => ({ ...r, type: 'product' as const })),
        ...visibilityReports.map(r => ({ ...r, type: 'visibility' as const })),
        ...competitorReports.map(r => ({ ...r, type: 'competitor' as const }))
      ];
      
      console.log(`🔍 Processing ${allReports.length} total reports...`);
      
      // Group by date first, then by journey plan (reportId)
      allReports.forEach(report => {
        // Robust data validation
        if (!report || !report.createdAt) {
          console.warn('⚠️ Skipping report with missing createdAt:', report);
          return;
        }
        
        if (!report.clientId || !report.userId) {
          console.warn('⚠️ Skipping report with missing clientId or userId:', report);
          return;
        }
        
        let dateKey: string;
        try {
          dateKey = getDateKey(report.createdAt);
          console.log(`📅 Report on ${dateKey}: ${report.type} for client ${report.clientId}, JP: ${report.reportId}`);
          
          if (!result[dateKey]) {
            result[dateKey] = [];
          }
        } catch (error) {
          console.error('❌ Error processing report date:', error, report);
          return;
        }
        
        // Check if we already have a visit for this journey plan on this date
        const existingVisitIndex = result[dateKey].findIndex(visit => visit.reportId === report.reportId);
        
        if (existingVisitIndex >= 0) {
          // Update existing visit with additional report
          const existingVisit = result[dateKey][existingVisitIndex];
          
          // Add report to appropriate array
          if (report.type === 'feedback') {
            if (!existingVisit.feedbackReports) existingVisit.feedbackReports = [];
            existingVisit.feedbackReports.push({
              id: report.id,
              comment: report.comment,
              createdAt: report.createdAt,
              type: 'feedback'
            });
          } else if (report.type === 'product') {
            if (!existingVisit.productReports) existingVisit.productReports = [];
            existingVisit.productReports.push({
              id: report.id,
              productName: report.productName,
              quantity: report.quantity,
              comment: report.comment,
              productId: report.productId,
              createdAt: report.createdAt,
              type: 'product'
            });
          } else if (report.type === 'visibility') {
            if (!existingVisit.visibilityReports) existingVisit.visibilityReports = [];
            existingVisit.visibilityReports.push({
              id: report.id,
              comment: report.comment,
              imageUrl: report.imageUrl,
              createdAt: report.createdAt,
              type: 'visibility'
            });
          } else if (report.type === 'competitor') {
            if (!existingVisit.competitorReports) existingVisit.competitorReports = [];
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
          
          // Update completion status
          existingVisit.totalReports = (existingVisit.feedbackReports?.length || 0) + 
                                     (existingVisit.productReports?.length || 0) + 
                                     (existingVisit.visibilityReports?.length || 0) +
                                     (existingVisit.competitorReports?.length || 0);
          existingVisit.isComplete = existingVisit.totalReports >= 3;
          
        } else {
          // Create new visit for this journey plan
          const newVisit = {
            id: report.id,
            reportId: report.reportId, // Journey Plan ID
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
          
          // Add the first report
          if (report.type === 'feedback') {
            newVisit.feedbackReports = [{
              id: report.id,
              comment: report.comment,
              createdAt: report.createdAt,
              type: 'feedback'
            }];
          } else if (report.type === 'product') {
            newVisit.productReports = [{
              id: report.id,
              productName: report.productName,
              quantity: report.quantity,
              comment: report.comment,
              productId: report.productId,
              createdAt: report.createdAt,
              type: 'product'
            }];
          } else if (report.type === 'visibility') {
            newVisit.visibilityReports = [{
              id: report.id,
              comment: report.comment,
              imageUrl: report.imageUrl,
              createdAt: report.createdAt,
              type: 'visibility'
            }];
          } else if (report.type === 'competitor') {
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
      
      // Log detailed visit information for debugging
      Object.keys(result).forEach(dateKey => {
        const visits = result[dateKey];
        console.log(`📅 ${dateKey}: ${visits.length} visits`);
        visits.forEach((visit, index) => {
          console.log(`  Visit ${index + 1}: JP ${visit.reportId}, Client ${visit.clientId} (${visit.clientName}), Reports: ${visit.totalReports}, Complete: ${visit.isComplete}`);
        });
      });
      
      // Ensure all 7 days of the week are included, even if no visits
      const weeklyResult: { [date: string]: any[] } = {};
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
    } catch (error) {
      console.error('❌ Error getting weekly visits:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      // Return empty structure instead of throwing to see what's happening
      return {};
    }
  }

  /**
   * Bulk insert product reports using stored procedure
   * @param journeyPlanId Journey Plan ID (maps to reportId)
   * @param clientId Client ID
   * @param userId Sales Rep ID
   * @param products Array of product data
   * @returns Result of bulk insert operation
   */
  private async bulkInsertProductReports(
    journeyPlanId: number,
    clientId: number,
    userId: number,
    products: any[]
  ): Promise<any> {
    try {
      console.log('🚀 BulkInsertProductReports: Starting bulk insert');
      console.log(`🚀 Journey Plan ID: ${journeyPlanId}`);
      console.log(`🚀 Client ID: ${clientId}`);
      console.log(`🚀 User ID: ${userId}`);
      console.log(`🚀 Products count: ${products.length}`);
      
      // Validate input parameters
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
      
      // Convert products array to JSON string for stored procedure
      const productsJson = JSON.stringify(products);
      console.log('🚀 Products JSON:', productsJson);
      
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL BulkInsertProductReports(?, ?, ?, ?)',
        [journeyPlanId, clientId, userId, productsJson]
      );
      
      console.log('🚀 Stored procedure result:', result);
      
      // Extract result from stored procedure response
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
        } else {
          throw new Error(`Stored procedure error: ${procedureResult.message}`);
        }
      } else {
        throw new Error('No result returned from stored procedure');
      }
      
    } catch (error) {
      console.error('❌ BulkInsertProductReports error:', error);
      throw error;
    }
  }
}
