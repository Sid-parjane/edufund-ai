import {
  Controller, Post, Get, Patch, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import {
  PersonalDetailsDto,
  AcademicDetailsDto,
  FinancialDetailsDto,
  LoanDetailsDto,
  UpdateApplicationStatusDto,
} from './applications.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createApplication(@CurrentUser('id') userId: string) {
    return this.applicationsService.createApplication(userId);
  }

  @Get()
  getApplications(@CurrentUser('id') userId: string) {
    return this.applicationsService.getApplications(userId);
  }

  @Get(':id')
  getApplication(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationsService.getApplication(id, userId);
  }

  @Patch(':id/personal')
  savePersonalDetails(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PersonalDetailsDto,
  ) {
    return this.applicationsService.savePersonalDetails(id, userId, dto);
  }

  @Patch(':id/academic')
  saveAcademicDetails(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AcademicDetailsDto,
  ) {
    return this.applicationsService.saveAcademicDetails(id, userId, dto);
  }

  @Patch(':id/financial')
  saveFinancialDetails(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: FinancialDetailsDto,
  ) {
    return this.applicationsService.saveFinancialDetails(id, userId, dto);
  }

  @Patch(':id/loan')
  saveLoanDetails(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: LoanDetailsDto,
  ) {
    return this.applicationsService.saveLoanDetails(id, userId, dto);
  }

  @Post(':id/submit')
  submitApplication(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationsService.submitApplication(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applicationsService.updateStatus(id, dto);
  }
}
