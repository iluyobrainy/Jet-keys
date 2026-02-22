-- Check what type values are actually used in the existing records
SELECT DISTINCT type FROM website_settings WHERE type IS NOT NULL;

-- Show all existing records to see the pattern
SELECT key, value, type, description FROM website_settings ORDER BY key;

-- Check the constraint definition again
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'website_settings'::regclass
AND conname LIKE '%type%';

