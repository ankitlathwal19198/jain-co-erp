import { TasksService } from './tasks.service';
export declare class TasksScheduler {
    private readonly tasks;
    private readonly logger;
    constructor(tasks: TasksService);
    generateOccurrences(): Promise<void>;
}
