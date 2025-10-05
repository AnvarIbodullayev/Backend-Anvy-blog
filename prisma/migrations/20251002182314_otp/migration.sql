-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpAttemts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
