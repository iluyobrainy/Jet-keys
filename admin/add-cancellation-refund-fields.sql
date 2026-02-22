-- Add cancellation and refund fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS account_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS refund_processed_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS refund_processed_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS refund_reference VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_cancellation ON bookings(cancellation_date);
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON bookings(refund_status);




