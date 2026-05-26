-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TaskFrequency" AS ENUM ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('open', 'in_progress', 'resolved', 'reopened', 'closed');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('pending', 'resolved', 'reopened');

-- CreateEnum
CREATE TYPE "ExtensionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reportingManagerId" TEXT;

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "frequency" "TaskFrequency" NOT NULL DEFAULT 'none',
    "startDate" TIMESTAMP(3),
    "initialPlannedDate" TIMESTAMP(3) NOT NULL,
    "recurrenceEndDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'open',
    "lastGeneratedThrough" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignerId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_occurrences" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "extendedDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'pending',
    "delayDays" INTEGER,
    "resolvedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_extension_requests" (
    "id" TEXT NOT NULL,
    "occurrenceId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "ExtensionStatus" NOT NULL DEFAULT 'pending',
    "decidedById" TEXT,
    "decidedDate" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_extension_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_assigneeId_status_idx" ON "tasks"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "tasks_assignerId_status_idx" ON "tasks"("assignerId", "status");

-- CreateIndex
CREATE INDEX "task_occurrences_status_plannedDate_idx" ON "task_occurrences"("status", "plannedDate");

-- CreateIndex
CREATE UNIQUE INDEX "task_occurrences_taskId_plannedDate_key" ON "task_occurrences"("taskId", "plannedDate");

-- CreateIndex
CREATE INDEX "task_extension_requests_occurrenceId_status_idx" ON "task_extension_requests"("occurrenceId", "status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_extension_requests" ADD CONSTRAINT "task_extension_requests_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "task_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_extension_requests" ADD CONSTRAINT "task_extension_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_extension_requests" ADD CONSTRAINT "task_extension_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
