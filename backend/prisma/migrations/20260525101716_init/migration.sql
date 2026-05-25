-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "empId" TEXT,
    "name" TEXT,
    "contactNo" TEXT,
    "designation" TEXT,
    "workState" TEXT,
    "workLocation" TEXT,
    "reportingManager" TEXT,
    "reportingNo" TEXT,
    "leaveApproval" TEXT,
    "leaveAppNo" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_empId_key" ON "users"("empId");
