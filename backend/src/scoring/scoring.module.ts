import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { AiService } from './ai.service';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService, AiService],
  exports: [ScoringService],
})
export class ScoringModule {}
