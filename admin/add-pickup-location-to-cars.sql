-- Add pickup_location field to cars table
-- This allows assigning specific cars to specific pickup locations

-- Add pickup_location column to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS pickup_location UUID REFERENCES locations(id);

-- Create index for pickup_location queries
CREATE INDEX IF NOT EXISTS idx_cars_pickup_location ON cars(pickup_location);

-- Update existing cars to have pickup_location as NULL (can be assigned later)
-- This allows for flexible assignment where cars can be available at any location initially
UPDATE cars SET pickup_location = NULL WHERE pickup_location IS NULL;

-- Add comment to explain the field
COMMENT ON COLUMN cars.pickup_location IS 'Specific pickup location for this car. NULL means car can be picked up from any location.';
