import { Module } from '@nestjs/common';
import { UciController } from './uci.controller';
import { UciService } from './uci.service';

@Module({
  controllers: [UciController],
  providers: [UciService]
})
export class UciModule {}
