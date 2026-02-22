-- Check what values are allowed in the type column constraint
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'website_settings'::regclass
AND conname LIKE '%type%';

-- Also check if there are any existing records to see what type values are used
SELECT DISTINCT type FROM website_settings WHERE type IS NOT NULL;

-- Check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'website_settings'
ORDER BY ordinal_position;

