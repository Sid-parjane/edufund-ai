import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('applications')
  getApplications(
    @Query('status') status?: string,
    @Query('leadCategory') leadCategory?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getApplications({
      status,
      leadCategory,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }
}
