import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('scoring')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ScoringController {
  constructor(private scoringService: ScoringService) {}

  @Post('evaluate/:applicationId')
  evaluate(@Param('applicationId') applicationId: string) {
    return this.scoringService.evaluateApplication(applicationId);
  }
}
