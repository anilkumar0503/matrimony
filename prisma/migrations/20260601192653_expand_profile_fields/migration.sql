/*
  Warnings:

  - You are about to drop the column `incomePref` on the `PartnerPreference` table. All the data in the column will be lost.
  - You are about to drop the column `locationPref` on the `PartnerPreference` table. All the data in the column will be lost.
  - You are about to drop the column `citizenship` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `siblingsCount` on the `UserProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PhysicalStatus" AS ENUM ('NORMAL', 'PHYSICALLY_CHALLENGED');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'VEGAN');

-- CreateEnum
CREATE TYPE "Smoking" AS ENUM ('NO', 'YES', 'OCCASIONALLY');

-- CreateEnum
CREATE TYPE "Drinking" AS ENUM ('NO', 'YES', 'OCCASIONALLY', 'SOCIAL');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'ATHLETE');

-- CreateEnum
CREATE TYPE "SleepSchedule" AS ENUM ('EARLY_BIRD', 'NIGHT_OWL', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "PersonalityType" AS ENUM ('INTROVERT', 'EXTROVERT', 'AMBIVERT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'SELF_EMPLOYED', 'FREELANCE', 'CONTRACT', 'BUSINESS_OWNER', 'RETIRED', 'STUDENT', 'HOMEMAKER', 'UNEMPLOYED');

-- CreateEnum
CREATE TYPE "ProfileCreatedBy" AS ENUM ('SELF', 'PARENT', 'SIBLING', 'RELATIVE', 'FRIEND');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "PartnerPreference" DROP COLUMN "incomePref",
DROP COLUMN "locationPref",
ADD COLUMN     "cityPref" TEXT,
ADD COLUMN     "countryPref" TEXT,
ADD COLUMN     "degreePref" TEXT,
ADD COLUMN     "dietPref" "Diet",
ADD COLUMN     "drinkingPref" "Drinking",
ADD COLUMN     "incomeMax" TEXT,
ADD COLUMN     "incomeMin" TEXT,
ADD COLUMN     "manglikPref" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "motherTongue" TEXT,
ADD COLUMN     "occupationPref" TEXT,
ADD COLUMN     "smokingPref" "Smoking",
ADD COLUMN     "statePref" TEXT,
ADD COLUMN     "subCaste" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "citizenship",
DROP COLUMN "siblingsCount",
ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "bloodGroup" "BloodGroup",
ADD COLUMN     "brothersCount" INTEGER,
ADD COLUMN     "community" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currentAddress" TEXT,
ADD COLUMN     "dasaDetails" TEXT,
ADD COLUMN     "diet" "Diet",
ADD COLUMN     "drinking" "Drinking",
ADD COLUMN     "exerciseHabits" TEXT,
ADD COLUMN     "fatherIncome" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fitnessLevel" "FitnessLevel",
ADD COLUMN     "futureGoals" TEXT,
ADD COLUMN     "gana" TEXT,
ADD COLUMN     "hasPets" BOOLEAN,
ADD COLUMN     "isCareerOriented" BOOLEAN,
ADD COLUMN     "isExtrovert" BOOLEAN,
ADD COLUMN     "isFamilyOriented" BOOLEAN,
ADD COLUMN     "isIntrovert" BOOLEAN,
ADD COLUMN     "lagna" TEXT,
ADD COLUMN     "languagesKnown" TEXT[],
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "lifePriorities" TEXT,
ADD COLUMN     "mahendra" TEXT,
ADD COLUMN     "marriedBrothers" INTEGER,
ADD COLUMN     "marriedSisters" INTEGER,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "nadi" TEXT,
ADD COLUMN     "partnerExpectations" TEXT,
ADD COLUMN     "permanentAddress" TEXT,
ADD COLUMN     "personalityType" "PersonalityType",
ADD COLUMN     "petsDetails" TEXT,
ADD COLUMN     "physicalStatus" "PhysicalStatus",
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "profileCreatedBy" "ProfileCreatedBy",
ADD COLUMN     "rajju" TEXT,
ADD COLUMN     "religiousBeliefs" TEXT,
ADD COLUMN     "sistersCount" INTEGER,
ADD COLUMN     "sleepSchedule" "SleepSchedule",
ADD COLUMN     "smoking" "Smoking",
ADD COLUMN     "vedha" TEXT,
ADD COLUMN     "yoni" TEXT;

-- CreateTable
CREATE TABLE "EducationDetail" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "highestQualification" TEXT,
    "degree" TEXT,
    "specialization" TEXT,
    "collegeName" TEXT,
    "universityName" TEXT,
    "passingYear" INTEGER,
    "additionalCerts" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerDetail" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "occupation" TEXT,
    "designation" TEXT,
    "companyName" TEXT,
    "industry" TEXT,
    "employmentType" "EmploymentType",
    "workLocation" TEXT,
    "experience" TEXT,
    "annualIncome" TEXT,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDetail" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "ownHouse" BOOLEAN,
    "ownFlat" BOOLEAN,
    "agriculturalLand" BOOLEAN,
    "commercialProperty" BOOLEAN,
    "vehicleDetails" TEXT,
    "investments" TEXT,
    "familyBusinessDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHobby" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "hobby" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerification" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "verificationType" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_profileId_interest_key" ON "UserInterest"("profileId", "interest");

-- CreateIndex
CREATE UNIQUE INDEX "UserHobby_profileId_hobby_key" ON "UserHobby"("profileId", "hobby");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_profileId_category_value_key" ON "UserFavorite"("profileId", "category", "value");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerification_profileId_verificationType_key" ON "UserVerification"("profileId", "verificationType");

-- AddForeignKey
ALTER TABLE "EducationDetail" ADD CONSTRAINT "EducationDetail_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDetail" ADD CONSTRAINT "CareerDetail_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDetail" ADD CONSTRAINT "AssetDetail_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHobby" ADD CONSTRAINT "UserHobby_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
