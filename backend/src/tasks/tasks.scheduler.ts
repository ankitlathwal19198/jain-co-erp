import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksScheduler {
  private readonly logger = new Logger(TasksScheduler.name);

  constructor(private readonly tasks: TasksService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateOccurrences() {
    const created = await this.tasks.materializeRecurringOccurrences();
    this.logger.log(`Materialized ${created} recurring task occurrence(s)`);
  }
}
