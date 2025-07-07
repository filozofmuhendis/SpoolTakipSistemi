-- Migration script to fix foreign key type compatibility issues
-- Run this if you have an existing database with type mismatches

-- First, check if personnel table exists and what type its id column is
DO $$
BEGIN
    -- Check if personnel table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personnel') THEN
        -- Check the data type of the id column
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'personnel' 
            AND column_name = 'id' 
            AND data_type = 'bigint'
        ) THEN
            -- If personnel.id is bigint, we need to convert it to UUID
            RAISE NOTICE 'Converting personnel.id from bigint to UUID...';
            
            -- Create a new personnel table with UUID id
            CREATE TABLE personnel_new (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                department TEXT NOT NULL,
                position TEXT NOT NULL,
                hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
                status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Copy data from old table to new table
            INSERT INTO personnel_new (name, email, phone, department, position, hire_date, status, created_at, updated_at)
            SELECT name, email, phone, department, position, hire_date, status, created_at, updated_at
            FROM personnel;
            
            -- Drop the old table
            DROP TABLE personnel CASCADE;
            
            -- Rename new table to original name
            ALTER TABLE personnel_new RENAME TO personnel;
            
            RAISE NOTICE 'Personnel table converted successfully';
        ELSE
            RAISE NOTICE 'Personnel table already has UUID id column';
        END IF;
    ELSE
        RAISE NOTICE 'Personnel table does not exist, will be created with UUID id';
    END IF;
END $$;

-- Now check and fix work_orders table if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'work_orders') THEN
        -- Check if work_orders.assigned_to column exists and its type
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'work_orders' 
            AND column_name = 'assigned_to'
        ) THEN
            -- Drop the foreign key constraint if it exists
            ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS work_orders_assigned_to_fkey;
            
            -- Add the correct foreign key constraint
            ALTER TABLE work_orders 
            ADD CONSTRAINT work_orders_assigned_to_fkey 
            FOREIGN KEY (assigned_to) REFERENCES personnel(id);
            
            RAISE NOTICE 'Work orders foreign key constraint fixed';
        END IF;
    END IF;
END $$;

-- Check and fix spools table if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spools') THEN
        -- Check if spools.assigned_to column exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'spools' 
            AND column_name = 'assigned_to'
        ) THEN
            -- Drop the foreign key constraint if it exists
            ALTER TABLE spools DROP CONSTRAINT IF EXISTS spools_assigned_to_fkey;
            
            -- Add the correct foreign key constraint
            ALTER TABLE spools 
            ADD CONSTRAINT spools_assigned_to_fkey 
            FOREIGN KEY (assigned_to) REFERENCES personnel(id);
            
            RAISE NOTICE 'Spools foreign key constraint fixed';
        END IF;
    END IF;
END $$;

-- Recreate indexes if needed
CREATE INDEX IF NOT EXISTS idx_spools_assigned_to ON spools(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);

RAISE NOTICE 'Migration completed successfully'; 