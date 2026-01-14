# Database Schema Summary

## Quick Reference

**Total Tables**: 31
**Total Enums**: 7
**Database**: PostgreSQL 12+
**ORM**: Prisma 7.2.0

---

## Core Domain Model

```
┌─────────────┐
│   AppUser   │ (Authentication)
└─────┬───────┘
      │
      ├──→ DealerUser ──→ DealerAccount
      │                        │
      │                        ├──→ DealerBandAssignment (3 per dealer)
      │                        ├──→ Cart ──→ CartItem ──→ Product
      │                        └──→ OrderHeader ──→ OrderLine ──→ Product
      │
      └──→ ImportBatch ──→ ImportError
                       ├──→ StgProductPriceRow
                       └──→ StgBackorderRow
```

---

## User Management (3 tables)

### AppUser
- System-wide user authentication
- Fields: `email`, `passwordHash`, `role`, `adminRole`
- **Unique**: `email`
- Roles: `ADMIN` | `DEALER`

### DealerAccount
- Dealer company information
- Fields: `accountNo`, `companyName`, `status`, `entitlement`
- **Unique**: `accountNo`, `erpAccountNo`
- Status: `ACTIVE` | `INACTIVE` | `SUSPENDED`

### DealerUser
- Links AppUser to DealerAccount
- Fields: `dealerAccountId`, `userId`, `isPrimary`
- **Unique**: `userId` (one user = one dealer)
- **Cascade**: Delete user → Delete dealer user

---

## Pricing & Catalog (7 tables)

### Product
- Main product catalog
- Fields: `productCode`, `description`, `partType`, `isActive`
- **Unique**: `productCode`
- Types: `GENUINE` | `AFTERMARKET` | `BRANDED`

### ProductStock
- Inventory levels
- Fields: `freeStock`, `lastImportBatchId`
- **One-to-one** with Product

### ProductPriceReference
- Reference pricing (cost, retail, trade, list)
- **One-to-one** with Product

### ProductPriceBand
- Tiered pricing (bands 1-4)
- Fields: `bandCode`, `price`
- **Unique**: `[productId, bandCode]`
- Precision: `Decimal(10,2)`

### ProductAlias
- Alternative part numbers
- Fields: `aliasType`, `aliasValue`
- **Unique**: `[aliasType, aliasValue]`
- Examples: Land Rover numbers, Jaguar numbers

### DealerBandAssignment
- **CRITICAL**: Each dealer MUST have exactly 3 (one per partType)
- Fields: `dealerAccountId`, `partType`, `bandCode`
- **Unique**: `[dealerAccountId, partType]`

---

## Shopping & Orders (4 tables)

### Cart
- Shopping cart (one per dealer user)
- **Unique**: `dealerUserId`

### CartItem
- Cart line items
- **Unique**: `[cartId, productId]` (no duplicates)

### OrderHeader
- Order metadata
- Fields: `orderNo`, `status`, `dispatchMethod`, `poRef`, `notes`
- **Unique**: `orderNo`
- Status: `SUSPENDED` | `PROCESSING` | `SHIPPED` | `CANCELLED`

### OrderLine
- Order line items with snapshots
- Fields: `qty`, `unitPriceSnapshot`, `bandCodeSnapshot`
- Snapshots preserve pricing at time of order

---

## Import Management (6 tables)

### ImportBatch
- Tracks file imports
- Types: `PRODUCTS_GENUINE`, `PRODUCTS_AFTERMARKET`, `BACKORDERS`, `FULFILLMENT_STATUS`
- Status: `PROCESSING`, `SUCCEEDED`, `FAILED`, `SUCCEEDED_WITH_ERRORS`

### ImportError
- Validation errors per row
- Fields: `rowNumber`, `errorMessage`, `rawRowJson`

### StgProductPriceRow
- Staging for product imports
- Fields: `isValid`, `validationErrors`

### StgBackorderRow
- Staging for backorder imports

### BackorderDataset
- Active backorder dataset (only one at a time)

### BackorderLine
- Individual backorder items

---

## System & Content (7 tables)

### AuditLog
- Complete audit trail
- Fields: `actorType`, `action`, `entityType`, `beforeJson`, `afterJson`

### EmailLog
- Email sending history
- Fields: `recipientEmail`, `subject`, `status`

### SystemSetting
- Key-value configuration
- Fields: `key` (PK), `valueJson`

### NewsPost
- Dealer portal news
- Fields: `title`, `bodyMd`, `isPublished`

### ExclusiveDoc
- Dealer-only documents
- Fields: `title`, `blobPath`, `mimeType`

### ExternalLink
- Quick links for dealers

### UploadTemplate
- CSV upload templates
- Fields: `templateName`, `fileName`, `blobPath`

### ContentAttachment
- File attachments for news/docs

---

## Critical Business Rules

### ✅ Enforced by Database

1. **Email Uniqueness**: `AppUser.email` UNIQUE
2. **Product Code Uniqueness**: `Product.productCode` UNIQUE
3. **Order Number Uniqueness**: `OrderHeader.orderNo` UNIQUE
4. **One Cart Per User**: `Cart.dealerUserId` UNIQUE
5. **One User Per Dealer**: `DealerUser.userId` UNIQUE
6. **One Price Per Band**: `ProductPriceBand[productId, bandCode]` UNIQUE
7. **One Band Per Part Type**: `DealerBandAssignment[dealerAccountId, partType]` UNIQUE

### ⚠️ Enforced by Application

1. **3 Band Assignments**: Every dealer MUST have exactly 3 `DealerBandAssignment` records
2. **At Least One User**: Every dealer should have at least one `DealerUser`
3. **Active Products Have Pricing**: Active products should have `ProductPriceBand` records
4. **Orders Have Lines**: `OrderHeader` should have at least one `OrderLine` (except in-progress)

---

## Indexes Summary

### Unique Indexes (Auto-created)
- `AppUser.email`
- `Product.productCode`
- `DealerAccount.accountNo`
- `DealerAccount.erpAccountNo`
- `OrderHeader.orderNo`
- `Cart.dealerUserId`
- `DealerUser.userId`

### Performance Indexes
- `AppUser[role, isActive]` - Role-based queries
- `Product[partType, isActive]` - Part type filtering
- `Product[description]` - Text search
- `OrderHeader[dealerAccountId, createdAt]` - Dealer order history
- `AuditLog[createdAt]` - Audit queries
- `ImportBatch[batchId, isValid]` - Import tracking

**Total Indexes**: ~45 across all tables

---

## Foreign Key Relationships

### Cascade Deletes
- `DealerUser → AppUser` (DELETE CASCADE)
- `DealerUser → DealerAccount` (DELETE CASCADE)
- `DealerBandAssignment → DealerAccount` (DELETE CASCADE)
- `Cart → DealerUser` (DELETE CASCADE)
- `CartItem → Cart` (DELETE CASCADE)
- `OrderLine → OrderHeader` (DELETE CASCADE)
- `ProductStock → Product` (DELETE CASCADE)
- `ProductPriceBand → Product` (DELETE CASCADE)
- `ImportError → ImportBatch` (DELETE CASCADE)

### No Cascade (Preserve Data)
- `OrderHeader → DealerAccount` (NO CASCADE)
- `OrderLine → Product` (NO CASCADE)
- `CartItem → Product` (NO CASCADE)

---

## Data Types

### Enums (7 total)
1. `UserRole`: ADMIN, DEALER
2. `AdminRole`: SUPER_ADMIN, ADMIN, OPS
3. `DealerStatus`: ACTIVE, INACTIVE, SUSPENDED
4. `Entitlement`: GENUINE_ONLY, AFTERMARKET_ONLY, SHOW_ALL
5. `PartType`: GENUINE, AFTERMARKET, BRANDED
6. `ImportType`: PRODUCTS_GENUINE, PRODUCTS_AFTERMARKET, BACKORDERS, SUPERSESSION, FULFILLMENT_STATUS
7. `ImportStatus`: PROCESSING, SUCCEEDED, FAILED, SUCCEEDED_WITH_ERRORS
8. `OrderStatus`: SUSPENDED, PROCESSING, SHIPPED, CANCELLED
9. `ActorType`: ADMIN, DEALER, SYSTEM

### Precision Fields
- `ProductPriceBand.price`: `Decimal(10,2)` (max: 99,999,999.99)
- `OrderHeader.subtotal`: `Decimal`
- `OrderHeader.total`: `Decimal`
- `OrderLine.unitPriceSnapshot`: `Decimal`

---

## Validation Commands

```bash
# Generate Prisma Client
pnpm generate

# Run validation script
pnpm validate

# View in Prisma Studio
pnpm db:studio

# Apply migrations
pnpm db:migrate

# Seed database
pnpm seed
```

---

## Schema Health Checklist

- [ ] Database is reachable
- [ ] All migrations applied
- [ ] Prisma Client generated
- [ ] All dealers have 3 band assignments
- [ ] No duplicate product codes
- [ ] Active products have pricing
- [ ] Test users exist
- [ ] All foreign keys valid
- [ ] Indexes created

---

## Quick Queries

### Count All Records
```sql
SELECT 'Users', COUNT(*) FROM "AppUser"
UNION ALL SELECT 'Dealers', COUNT(*) FROM "DealerAccount"
UNION ALL SELECT 'Products', COUNT(*) FROM "Product"
UNION ALL SELECT 'Orders', COUNT(*) FROM "OrderHeader"
UNION ALL SELECT 'Carts', COUNT(*) FROM "Cart";
```

### Check Dealer Health
```sql
SELECT
    da."companyName",
    da.status,
    da.entitlement,
    COUNT(DISTINCT du.id) as users,
    COUNT(DISTINCT dba.id) as band_assignments
FROM "DealerAccount" da
LEFT JOIN "DealerUser" du ON da.id = du."dealerAccountId"
LEFT JOIN "DealerBandAssignment" dba ON da.id = dba."dealerAccountId"
GROUP BY da.id, da."companyName", da.status, da.entitlement;
```

### Recent Orders
```sql
SELECT
    oh."orderNo",
    da."companyName",
    oh.status,
    oh."createdAt",
    COUNT(ol.id) as line_count,
    oh.total
FROM "OrderHeader" oh
JOIN "DealerAccount" da ON oh."dealerAccountId" = da.id
LEFT JOIN "OrderLine" ol ON oh.id = ol."orderId"
GROUP BY oh.id, da."companyName"
ORDER BY oh."createdAt" DESC
LIMIT 10;
```

---

## Migration History

Latest migrations in order:
1. `20260111012921_init` - Initial schema
2. `20260112124745_add_entitlement_and_suspended_status` - Added entitlement & suspended status
3. `20260113003737_add_band_assignment_constraints` - Band assignment constraints
4. `20260113004755_enforce_business_rules` - Business rules
5. `20260113004917_add_check_constraints` - Check constraints
6. `20260113005212_add_validation_triggers` - Validation triggers
7. `20260113124214_add_check_constraints` - Additional check constraints
8. `20260113125500_add_validation_triggers` - Final validation triggers

---

## Related Documentation

- [DATABASE_VALIDATION.md](./DATABASE_VALIDATION.md) - Full validation guide
- [schema.prisma](./prisma/schema.prisma) - Prisma schema file
- [migrations/](./prisma/migrations/) - Migration history

---

**Last Updated**: 2026-01-14
**Schema Version**: 1.0
**Prisma Version**: 7.2.0
