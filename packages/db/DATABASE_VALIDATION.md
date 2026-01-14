# Database Schema Validation Guide

## Overview

This guide provides comprehensive information about the B2B-First database schema, validation procedures, and setup instructions.

---

## Database Configuration

### Connection Details

**Database**: PostgreSQL 12+
**Connection String**: `postgresql://postgres:postgres@localhost:5432/hotbray?schema=public`

### Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hotbray?schema=public"
```

---

## Schema Overview

### Core Tables

| Table | Purpose | Records | Dependencies |
|-------|---------|---------|--------------|
| `AppUser` | User authentication and authorization | Required | None |
| `DealerAccount` | Dealer company accounts | Required | None |
| `DealerUser` | Dealer user associations | Required | AppUser, DealerAccount |
| `DealerBandAssignment` | Pricing band assignments | Required | DealerAccount |
| `Product` | Product catalog | Required | None |
| `ProductStock` | Inventory levels | Optional | Product |
| `ProductPriceReference` | Reference pricing | Optional | Product |
| `ProductPriceBand` | Tiered pricing | Required | Product |
| `Cart` | Shopping carts | Dynamic | DealerAccount, DealerUser |
| `CartItem` | Cart line items | Dynamic | Cart, Product |
| `OrderHeader` | Order headers | Dynamic | DealerAccount, DealerUser |
| `OrderLine` | Order line items | Dynamic | OrderHeader, Product |
| `ImportBatch` | Data import tracking | Dynamic | AppUser |

### Supporting Tables

- **StgProductPriceRow**: Staging table for product imports
- **StgBackorderRow**: Staging table for backorder imports
- **BackorderDataset**: Backorder datasets
- **BackorderLine**: Backorder line items
- **AuditLog**: Audit trail for all actions
- **EmailLog**: Email sending log
- **ImportError**: Import validation errors
- **ProductAlias**: Product code aliases (e.g., Land Rover, Jaguar part numbers)

### Content Management Tables

- **NewsPost**: News and announcements
- **ExclusiveDoc**: Dealer-exclusive documents
- **ExternalLink**: External resource links
- **ContentAttachment**: File attachments
- **UploadTemplate**: CSV upload templates

---

## Enums

### UserRole
- `ADMIN` - System administrators
- `DEALER` - Dealer users

### AdminRole (for ADMIN users)
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Standard admin access
- `OPS` - Operations staff

### DealerStatus
- `ACTIVE` - Active account, can place orders
- `INACTIVE` - Inactive, cannot login
- `SUSPENDED` - Suspended, orders held

### Entitlement
- `GENUINE_ONLY` - Can only see genuine parts
- `AFTERMARKET_ONLY` - Can only see aftermarket parts
- `SHOW_ALL` - Can see all part types

### PartType
- `GENUINE` - Original equipment manufacturer (OEM) parts
- `AFTERMARKET` - Third-party manufactured parts
- `BRANDED` - Branded aftermarket parts

### ImportType
- `PRODUCTS_GENUINE` - Genuine parts pricing/stock
- `PRODUCTS_AFTERMARKET` - Aftermarket parts pricing/stock
- `BACKORDERS` - Customer backorder data
- `SUPERSESSION` - Part supersession mapping
- `FULFILLMENT_STATUS` - Order fulfillment updates

### ImportStatus
- `PROCESSING` - Import in progress
- `SUCCEEDED` - Import completed successfully
- `FAILED` - Import failed
- `SUCCEEDED_WITH_ERRORS` - Import completed with some errors

### OrderStatus
- `SUSPENDED` - Order on hold (dealer suspended)
- `PROCESSING` - Order being processed
- `SHIPPED` - Order shipped
- `CANCELLED` - Order cancelled

---

## Business Rules & Constraints

### Critical Business Rules

#### 1. Dealer Band Assignments
**Rule**: Every `DealerAccount` MUST have exactly 3 `DealerBandAssignment` records (one for each `PartType`)

**Enforcement**:
- Application level validation in seed scripts
- Unique constraint: `@@unique([dealerAccountId, partType])`
- Index: `@@index([dealerAccountId, partType])`

**Validation Query**:
```sql
SELECT da.id, da."accountNo", COUNT(dba.id) as band_count
FROM "DealerAccount" da
LEFT JOIN "DealerBandAssignment" dba ON da.id = dba."dealerAccountId"
GROUP BY da.id, da."accountNo"
HAVING COUNT(dba.id) != 3;
-- Should return 0 rows
```

#### 2. User Email Uniqueness
**Rule**: User emails MUST be unique system-wide

**Enforcement**:
- Database constraint: `@@unique` on `AppUser.email`
- Index: `@@index([email])`

#### 3. Dealer-User Association
**Rule**: One user can only be associated with ONE dealer account

**Enforcement**:
- Unique constraint: `@unique` on `DealerUser.userId`
- Foreign key cascade on delete

#### 4. Product Code Uniqueness
**Rule**: Product codes MUST be unique

**Enforcement**:
- Database constraint: `@@unique` on `Product.productCode`
- Index: `@@index([productCode])`

#### 5. Price Band Uniqueness
**Rule**: Each product can have only ONE price per band

**Enforcement**:
- Unique constraint: `@@unique([productId, bandCode])`
- Valid bandCode values: "1", "2", "3", "4"
- Decimal precision: `@db.Decimal(10, 2)`

#### 6. Cart Uniqueness
**Rule**: One cart per dealer user

**Enforcement**:
- Unique constraint: `@unique` on `Cart.dealerUserId`

#### 7. Order Number Uniqueness
**Rule**: Order numbers MUST be unique

**Enforcement**:
- Unique constraint: `@unique` on `OrderHeader.orderNo`

---

## Indexes for Performance

### Primary Indexes (Automatically created with @unique/@id)

- `AppUser.email`
- `DealerAccount.accountNo`
- `DealerAccount.erpAccountNo`
- `Product.productCode`
- `OrderHeader.orderNo`

### Secondary Indexes (Explicitly defined)

```prisma
// User lookups
@@index([email])
@@index([role, isActive])

// Dealer lookups
@@index([accountNo])
@@index([status, entitlement])
@@index([mainEmail])

// Product search
@@index([productCode])
@@index([partType, isActive])
@@index([description])

// Orders
@@index([dealerAccountId, createdAt])

// Carts
@@index([cartId])

// Backorders
@@index([accountNo])
@@index([datasetId])

// Import tracking
@@index([batchId])
@@index([batchId, isValid])

// Audit logs
@@index([createdAt])
@@index([entityType, entityId])

// Email logs
@@index([recipientEmail])
@@index([sentAt])
```

---

## Validation Procedures

### 1. Database Connection Test

```bash
# Using Prisma CLI
pnpm db:studio

# Using validation script
pnpm validate
```

### 2. Schema Validation

```bash
# Check schema is in sync with database
prisma db pull --print

# View differences
prisma db diff
```

### 3. Migration Status

```sql
SELECT migration_name, finished_at, applied_steps_count
FROM "_prisma_migrations"
ORDER BY finished_at DESC
LIMIT 10;
```

### 4. Data Integrity Checks

#### Check Dealer Band Assignments
```sql
SELECT
    da."companyName",
    COUNT(DISTINCT dba."partType") as unique_part_types,
    STRING_AGG(dba."partType"::text, ', ') as part_types
FROM "DealerAccount" da
LEFT JOIN "DealerBandAssignment" dba ON da.id = dba."dealerAccountId"
GROUP BY da.id, da."companyName"
HAVING COUNT(DISTINCT dba."partType") != 3;
```

#### Check Product Pricing
```sql
SELECT
    p."productCode",
    p."partType",
    COUNT(ppb.id) as price_band_count,
    STRING_AGG(ppb."bandCode", ', ') as bands
FROM "Product" p
LEFT JOIN "ProductPriceBand" ppb ON p.id = ppb."productId"
WHERE p."isActive" = true
GROUP BY p.id, p."productCode", p."partType"
HAVING COUNT(ppb.id) = 0;
```

#### Check Orders Without Lines
```sql
SELECT oh."orderNo", oh.status, COUNT(ol.id) as line_count
FROM "OrderHeader" oh
LEFT JOIN "OrderLine" ol ON oh.id = ol."orderId"
GROUP BY oh.id, oh."orderNo", oh.status
HAVING COUNT(ol.id) = 0;
```

#### Check Duplicate Product Codes
```sql
SELECT "productCode", COUNT(*) as count
FROM "Product"
GROUP BY "productCode"
HAVING COUNT(*) > 1;
```

### 5. Row Count Validation

```sql
SELECT
    'AppUser' as table_name, COUNT(*) as row_count FROM "AppUser"
UNION ALL SELECT 'DealerAccount', COUNT(*) FROM "DealerAccount"
UNION ALL SELECT 'DealerUser', COUNT(*) FROM "DealerUser"
UNION ALL SELECT 'DealerBandAssignment', COUNT(*) FROM "DealerBandAssignment"
UNION ALL SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL SELECT 'ProductStock', COUNT(*) FROM "ProductStock"
UNION ALL SELECT 'ProductPriceBand', COUNT(*) FROM "ProductPriceBand"
UNION ALL SELECT 'Cart', COUNT(*) FROM "Cart"
UNION ALL SELECT 'CartItem', COUNT(*) FROM "CartItem"
UNION ALL SELECT 'OrderHeader', COUNT(*) FROM "OrderHeader"
UNION ALL SELECT 'OrderLine', COUNT(*) FROM "OrderLine"
UNION ALL SELECT 'ImportBatch', COUNT(*) FROM "ImportBatch";
```

---

## Setup Instructions

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Docker
docker run --name postgres-hotbray \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hotbray \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Create Database

```sql
CREATE DATABASE hotbray;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE hotbray TO postgres;
```

### 3. Run Migrations

```bash
cd packages/db

# Apply all migrations
prisma migrate deploy

# Or create new migration from schema
prisma migrate dev --name init
```

### 4. Generate Prisma Client

```bash
pnpm generate
```

### 5. Seed Database

```bash
pnpm seed
```

This will create:
- Admin user: `admin@hotbray.com` / `admin123`
- Sample dealer accounts with users
- Sample products with pricing
- Band assignments for all dealers

### 6. Run Validation

```bash
pnpm validate
```

---

## Validation Script Output

### Expected Success Output

```
🚀 Starting Database Validation...
📌 Database: postgresql://postgres:postgres@localhost:5432/hotbray?schema=public

🔌 Testing Database Connection...
✅ [Connection] Database Connection: Successfully connected to database
✅ [Connection] Query Execution: Can execute queries

📊 Validating Tables...
✅ [Tables] Table: AppUser: Exists (5 records)
✅ [Tables] Table: DealerAccount: Exists (3 records)
✅ [Tables] Table: DealerUser: Exists (3 records)
✅ [Tables] Table: DealerBandAssignment: Exists (9 records)
✅ [Tables] Table: Product: Exists (150 records)
✅ [Tables] Table: ProductStock: Exists (150 records)
...

🏷️  Validating Enums...
✅ [Enums] Enum: UserRole: Exists with 2 values
✅ [Enums] Enum: DealerStatus: Exists with 3 values
...

📇 Validating Indexes...
✅ [Indexes] Index Count: Found 45 indexes
✅ [Indexes] Index: AppUser_email_key: Exists
...

🔒 Validating Constraints...
✅ [Constraints] Unique Constraints: Found 18 unique constraints
✅ [Constraints] Foreign Keys: Found 25 foreign key constraints

📋 Validating Business Rules...
✅ [Business Rules] Dealer Band Assignments: All dealers have exactly 3 band assignments
✅ [Business Rules] Product Code Uniqueness: No duplicate product codes
✅ [Business Rules] Order Lines: All orders have order lines
✅ [Business Rules] Product Pricing: All active products have band pricing

🗄️  Validating Sample Data...
✅ [Data] User Count: 5 users in database
✅ [Data] Dealer Count: 3 dealers in database
✅ [Data] Product Count: 150 products in database
✅ [Data] Test Users: Found 2 test/demo users

📝 Validating Migrations...
✅ [Migrations] Applied Migrations: 7 migrations applied
✅ [Migrations] Latest Migration: add_validation_triggers (2026-01-13)

================================================================================
📊 DATABASE VALIDATION REPORT
================================================================================

Summary:
  Total Tests:  52
  ✅ Passed:    52
  ❌ Failed:    0
  ⚠️  Warnings:  0

Connection: 2/2 passed
Tables: 17/17 passed
Enums: 5/5 passed
Indexes: 6/6 passed
Constraints: 2/2 passed
Business Rules: 4/4 passed
Data: 5/5 passed
Migrations: 3/3 passed

================================================================================

✅ ALL VALIDATIONS PASSED!
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Refused

**Error**: `Can't reach database server at 127.0.0.1:5432`

**Solutions**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check port
sudo lsof -i :5432
```

### Issue 2: Database Does Not Exist

**Error**: `database "hotbray" does not exist`

**Solution**:
```sql
CREATE DATABASE hotbray;
```

### Issue 3: Permission Denied

**Error**: `permission denied for schema public`

**Solution**:
```sql
GRANT ALL PRIVILEGES ON DATABASE hotbray TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
```

### Issue 4: Migration Out of Sync

**Error**: `Database schema is not in sync with Prisma schema`

**Solution**:
```bash
# Reset and re-apply migrations
prisma migrate reset

# Or push schema directly
prisma db push
```

### Issue 5: Missing Prisma Client

**Error**: `Cannot find module '.prisma/client'`

**Solution**:
```bash
pnpm generate
```

---

## Maintenance Tasks

### Daily Checks

- [ ] Verify database is reachable
- [ ] Check recent imports for errors
- [ ] Review audit logs for anomalies

### Weekly Checks

- [ ] Run validation script
- [ ] Check slow query logs
- [ ] Verify backup completion

### Monthly Checks

- [ ] Review and optimize indexes
- [ ] Analyze table statistics
- [ ] Clean up old audit logs
- [ ] Review and archive old imports

---

## Performance Tuning

### Index Usage

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey';

-- Find missing indexes
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 1000
AND correlation < 0.1;
```

### Table Statistics

```sql
-- Analyze all tables
ANALYZE;

-- Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Backup & Recovery

### Backup Database

```bash
# Full backup
pg_dump -U postgres hotbray > hotbray_backup.sql

# Schema only
pg_dump -U postgres --schema-only hotbray > hotbray_schema.sql

# Data only
pg_dump -U postgres --data-only hotbray > hotbray_data.sql
```

### Restore Database

```bash
# Restore full backup
psql -U postgres hotbray < hotbray_backup.sql

# Restore from Docker
docker exec -i postgres-hotbray psql -U postgres hotbray < hotbray_backup.sql
```

---

## Contact & Support

For database issues or schema questions:
1. Run validation script: `pnpm validate`
2. Check logs in `packages/db/validation_errors.txt`
3. Review migration history: `SELECT * FROM "_prisma_migrations"`

---

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Schema File](./prisma/schema.prisma)
- [Migration History](./prisma/migrations/)
