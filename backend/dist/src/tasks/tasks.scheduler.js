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
var TasksScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const tasks_service_1 = require("./tasks.service");
let TasksScheduler = TasksScheduler_1 = class TasksScheduler {
    tasks;
    logger = new common_1.Logger(TasksScheduler_1.name);
    constructor(tasks) {
        this.tasks = tasks;
    }
    async generateOccurrences() {
        const created = await this.tasks.materializeRecurringOccurrences();
        this.logger.log(`Materialized ${created} recurring task occurrence(s)`);
    }
};
exports.TasksScheduler = TasksScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksScheduler.prototype, "generateOccurrences", null);
exports.TasksScheduler = TasksScheduler = TasksScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksScheduler);
//# sourceMappingURL=tasks.scheduler.js.map