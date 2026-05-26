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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../permissions/permissions.guard");
const require_permissions_decorator_1 = require("../permissions/require-permissions.decorator");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
const create_extension_dto_1 = require("./dto/create-extension.dto");
const create_task_dto_1 = require("./dto/create-task.dto");
const decide_extension_dto_1 = require("./dto/decide-extension.dto");
const list_tasks_dto_1 = require("./dto/list-tasks.dto");
const resolve_occurrence_dto_1 = require("./dto/resolve-occurrence.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const tasks_service_1 = require("./tasks.service");
function authedUser(req) {
    return req.user;
}
function userId(req) {
    return authedUser(req).id;
}
function canViewAll(req) {
    const u = authedUser(req);
    return u.isSuperAdmin || (u.permissions ?? []).includes(permissions_catalog_1.PERMISSIONS.TASKS_VIEW_ALL);
}
let TasksController = class TasksController {
    tasks;
    constructor(tasks) {
        this.tasks = tasks;
    }
    create(req, dto) {
        return this.tasks.create(userId(req), dto);
    }
    list(req, query) {
        return this.tasks.list(userId(req), query, canViewAll(req));
    }
    today(req) {
        return this.tasks.occurrencesDueToday(userId(req));
    }
    detail(req, id) {
        return this.tasks.detail(userId(req), id);
    }
    update(req, id, dto) {
        return this.tasks.update(userId(req), id, dto);
    }
    close(req, id) {
        return this.tasks.close(userId(req), id);
    }
    start(req, id) {
        return this.tasks.markInProgress(userId(req), id);
    }
    resolve(req, id, dto) {
        return this.tasks.resolveOccurrence(userId(req), id, dto);
    }
    reopen(req, id) {
        return this.tasks.reopenOccurrence(userId(req), id);
    }
    requestExtension(req, id, dto) {
        return this.tasks.requestExtension(userId(req), id, dto);
    }
    decideExtension(req, id, dto) {
        return this.tasks.decideExtension(userId(req), id, dto);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_CREATE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_VIEW),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_tasks_dto_1.ListTasksDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('occurrences/today'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_VIEW),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "today", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_VIEW),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_UPDATE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_DELETE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_UPDATE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('occurrences/:id/resolve'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_RESOLVE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, resolve_occurrence_dto_1.ResolveOccurrenceDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('occurrences/:id/reopen'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_UPDATE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)('occurrences/:id/extensions'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_EXTEND),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_extension_dto_1.CreateExtensionDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "requestExtension", null);
__decorate([
    (0, common_1.Patch)('extensions/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)(permissions_catalog_1.PERMISSIONS.TASKS_APPROVE_EXTENSION),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, decide_extension_dto_1.DecideExtensionDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "decideExtension", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map