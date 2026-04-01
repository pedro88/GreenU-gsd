-- Migration: Add garden details (type, size, sun, soil, tags, cover)
-- Run this manually if prisma migrate fails due to shadow DB permissions

-- Create GardenType enum if not exists
DO $$ BEGIN
    CREATE TYPE "GardenType" AS ENUM ('COLLECTIF', 'AMATEUR', 'PROFESSIONNEL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create SunExposure enum if not exists
DO $$ BEGIN
    CREATE TYPE "SunExposure" AS ENUM ('NORTH', 'SOUTH', 'EAST', 'WEST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create SoilType enum if not exists
DO $$ BEGIN
    CREATE TYPE "SoilType" AS ENUM ('CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEAT', 'CHALK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to Garden table
ALTER TABLE "Garden" 
ADD COLUMN IF NOT EXISTS "type" "GardenType",
ADD COLUMN IF NOT EXISTS "width" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "length" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "sunExposure" "SunExposure",
ADD COLUMN IF NOT EXISTS "soilType" "SoilType",
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
