#!/usr/bin/env tsx
/**
 * Database Schema Validation Script
 * Comprehensive validation of database schema, constraints, and data integrity
 *
 * Usage:
 *   pnpm validate:db
 *   tsx scripts/validate-database.ts
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hotbray?schema=public';

const pool = new Pool({
    connectionString,
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'hotbray',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

interface ValidationResult {
    category: string;
    test: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: any;
}

const results: ValidationResult[] = [];

function addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    results.push({ category, test, status, message, details });

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${category}] ${test}: ${message}`);

    if (details && status !== 'PASS') {
        console.log('   Details:', JSON.stringify(details, null, 2));
    }
}

async function testDatabaseConnection() {
    console.log('\n🔌 Testing Database Connection...\n');

    try {
        await prisma.$connect();
        addResult('Connection', 'Database Connection', 'PASS', 'Successfully connected to database');

        // Test query
        const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
        addResult('Connection', 'Query Execution', 'PASS', 'Can execute queries', result);
    } catch (error: any) {
        addResult('Connection', 'Database Connection', 'FAIL', `Failed to connect: ${error.message}`, error);
        throw error;
    }
}

async function validateTables() {
    console.log('\n📊 Validating Tables...\n');

    const requiredTables = [
        'AppUser',
        'DealerAccount',
        'DealerUser',
        'DealerBandAssignment',
        'Product',
        'ProductStock',
        'ProductPriceReference',
        'ProductPriceBand',
        'Cart',
        'CartItem',
        'OrderHeader',
        'OrderLine',
        'ImportBatch',
        'ImportError',
        'BackorderDataset',
        'BackorderLine',
        'AuditLog',
    ];

    for (const tableName of requiredTables) {
        try {
            const count = await (prisma as any)[tableName.charAt(0).toLowerCase() + tableName.slice(1)].count();
            addResult('Tables', `Table: ${tableName}`, 'PASS', `Exists (${count} records)`);
        } catch (error: any) {
            addResult('Tables', `Table: ${tableName}`, 'FAIL', `Missing or inaccessible`, error.message);
        }
    }
}

async function validateEnums() {
    console.log('\n🏷️  Validating Enums...\n');

    const enums = [
        { name: 'UserRole', values: ['ADMIN', 'DEALER'] },
        { name: 'DealerStatus', values: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
        { name: 'PartType', values: ['GENUINE', 'AFTERMARKET', 'BRANDED'] },
        { name: 'ImportStatus', values: ['PROCESSING', 'SUCCEEDED', 'FAILED', 'SUCCEEDED_WITH_ERRORS'] },
        { name: 'OrderStatus', values: ['SUSPENDED', 'PROCESSING', 'SHIPPED', 'CANCELLED'] },
    ];

    for (const enumDef of enums) {
        try {
            const result = await prisma.$queryRaw`
                SELECT unnest(enum_range(NULL::${enumDef.name}))::text as value
            `;
            addResult('Enums', `Enum: ${enumDef.name}`, 'PASS', `Exists with ${(result as any[]).length} values`);
        } catch (error: any) {
            addResult('Enums', `Enum: ${enumDef.name}`, 'FAIL', 'Missing or invalid', error.message);
        }
    }
}

async function validateIndexes() {
    console.log('\n📇 Validating Indexes...\n');

    const indexes = await prisma.$queryRaw<any[]>`
        SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
    `;

    addResult('Indexes', 'Index Count', 'PASS', `Found ${indexes.length} indexes`);

    // Check critical indexes
    const criticalIndexes = [
        'AppUser_email_key',
        'Product_productCode_key',
        'DealerAccount_accountNo_key',
        'OrderHeader_orderNo_key',
    ];

    for (const indexName of criticalIndexes) {
        const found = indexes.some(idx => idx.indexname === indexName);
        if (found) {
            addResult('Indexes', `Index: ${indexName}`, 'PASS', 'Exists');
        } else {
            addResult('Indexes', `Index: ${indexName}`, 'WARN', 'Missing (may impact performance)');
        }
    }
}

async function validateConstraints() {
    console.log('\n🔒 Validating Constraints...\n');

    // Check unique constraints
    const uniqueConstraints = await prisma.$queryRaw<any[]>`
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
    `;

    addResult('Constraints', 'Unique Constraints', 'PASS', `Found ${uniqueConstraints.length} unique constraints`);

    // Check foreign key constraints
    const foreignKeys = await prisma.$queryRaw<any[]>`
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
    `;

    addResult('Constraints', 'Foreign Keys', 'PASS', `Found ${foreignKeys.length} foreign key constraints`);
}

async function validateBusinessRules() {
    console.log('\n📋 Validating Business Rules...\n');

    // Rule 1: Every DealerAccount should have band assignments
    const accountsWithoutBands = await prisma.$queryRaw<any[]>`
        SELECT da.id, da."accountNo", da."companyName", COUNT(dba.id) as band_count
        FROM "DealerAccount" da
        LEFT JOIN "DealerBandAssignment" dba ON da.id = dba."dealerAccountId"
        GROUP BY da.id, da."accountNo", da."companyName"
        HAVING COUNT(dba.id) != 3
    `;

    if (accountsWithoutBands.length === 0) {
        addResult('Business Rules', 'Dealer Band Assignments', 'PASS', 'All dealers have exactly 3 band assignments');
    } else {
        addResult('Business Rules', 'Dealer Band Assignments', 'FAIL',
            `${accountsWithoutBands.length} dealer(s) without proper band assignments`,
            accountsWithoutBands);
    }

    // Rule 2: Check for duplicate product codes
    const duplicateProducts = await prisma.$queryRaw<any[]>`
        SELECT "productCode", COUNT(*) as count
        FROM "Product"
        GROUP BY "productCode"
        HAVING COUNT(*) > 1
    `;

    if (duplicateProducts.length === 0) {
        addResult('Business Rules', 'Product Code Uniqueness', 'PASS', 'No duplicate product codes');
    } else {
        addResult('Business Rules', 'Product Code Uniqueness', 'FAIL',
            `${duplicateProducts.length} duplicate product codes found`,
            duplicateProducts);
    }

    // Rule 3: Orders should have at least one line
    const ordersWithoutLines = await prisma.$queryRaw<any[]>`
        SELECT oh.id, oh."orderNo", COUNT(ol.id) as line_count
        FROM "OrderHeader" oh
        LEFT JOIN "OrderLine" ol ON oh.id = ol."orderId"
        GROUP BY oh.id, oh."orderNo"
        HAVING COUNT(ol.id) = 0
    `;

    if (ordersWithoutLines.length === 0) {
        addResult('Business Rules', 'Order Lines', 'PASS', 'All orders have order lines');
    } else {
        addResult('Business Rules', 'Order Lines', 'WARN',
            `${ordersWithoutLines.length} order(s) without lines (may be in progress)`,
            ordersWithoutLines);
    }

    // Rule 4: Products should have pricing
    const productsWithoutPricing = await prisma.$queryRaw<any[]>`
        SELECT p.id, p."productCode", COUNT(ppb.id) as band_price_count
        FROM "Product" p
        LEFT JOIN "ProductPriceBand" ppb ON p.id = ppb."productId"
        WHERE p."isActive" = true
        GROUP BY p.id, p."productCode"
        HAVING COUNT(ppb.id) = 0
    `;

    if (productsWithoutPricing.length === 0) {
        addResult('Business Rules', 'Product Pricing', 'PASS', 'All active products have band pricing');
    } else {
        addResult('Business Rules', 'Product Pricing', 'WARN',
            `${productsWithoutPricing.length} active product(s) without band pricing`,
            productsWithoutPricing.slice(0, 10)); // Show first 10
    }
}

async function validateSampleData() {
    console.log('\n🗄️  Validating Sample Data...\n');

    const counts = {
        users: await prisma.appUser.count(),
        dealers: await prisma.dealerAccount.count(),
        products: await prisma.product.count(),
        orders: await prisma.orderHeader.count(),
        carts: await prisma.cart.count(),
    };

    addResult('Data', 'User Count', counts.users > 0 ? 'PASS' : 'WARN',
        `${counts.users} users in database`);

    addResult('Data', 'Dealer Count', counts.dealers > 0 ? 'PASS' : 'WARN',
        `${counts.dealers} dealers in database`);

    addResult('Data', 'Product Count', counts.products > 0 ? 'PASS' : 'WARN',
        `${counts.products} products in database`);

    addResult('Data', 'Order Count', counts.orders >= 0 ? 'PASS' : 'FAIL',
        `${counts.orders} orders in database`);

    addResult('Data', 'Cart Count', counts.carts >= 0 ? 'PASS' : 'FAIL',
        `${counts.carts} carts in database`);

    // Check for test users
    const testUsers = await prisma.appUser.findMany({
        where: {
            OR: [
                { email: { contains: 'test' } },
                { email: { contains: 'demo' } },
                { email: { contains: 'admin@' } },
                { email: { contains: 'dealer@' } },
            ]
        },
        select: { email: true, role: true }
    });

    if (testUsers.length > 0) {
        addResult('Data', 'Test Users', 'PASS',
            `Found ${testUsers.length} test/demo users`,
            testUsers);
    } else {
        addResult('Data', 'Test Users', 'WARN',
            'No test users found (may need to run seed script)');
    }
}

async function validateMigrations() {
    console.log('\n📝 Validating Migrations...\n');

    try {
        const migrations = await prisma.$queryRaw<any[]>`
            SELECT * FROM "_prisma_migrations"
            ORDER BY finished_at DESC
        `;

        const applied = migrations.filter(m => m.applied_steps_count > 0);
        const pending = migrations.filter(m => m.applied_steps_count === 0);

        addResult('Migrations', 'Applied Migrations', 'PASS',
            `${applied.length} migrations applied`);

        if (pending.length > 0) {
            addResult('Migrations', 'Pending Migrations', 'WARN',
                `${pending.length} migrations pending`, pending);
        }

        // Check latest migration
        if (applied.length > 0) {
            const latest = applied[0];
            addResult('Migrations', 'Latest Migration', 'PASS',
                `${latest.migration_name} (${new Date(latest.finished_at).toLocaleString()})`);
        }
    } catch (error: any) {
        addResult('Migrations', 'Migration Table', 'FAIL',
            'Cannot read _prisma_migrations table', error.message);
    }
}

async function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    const grouped: { [key: string]: ValidationResult[] } = {};
    results.forEach(result => {
        if (!grouped[result.category]) {
            grouped[result.category] = [];
        }
        grouped[result.category].push(result);
    });

    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        warnings: results.filter(r => r.status === 'WARN').length,
    };

    console.log('Summary:');
    console.log(`  Total Tests:  ${summary.total}`);
    console.log(`  ✅ Passed:    ${summary.passed}`);
    console.log(`  ❌ Failed:    ${summary.failed}`);
    console.log(`  ⚠️  Warnings:  ${summary.warnings}`);
    console.log('');

    for (const [category, tests] of Object.entries(grouped)) {
        const passed = tests.filter(t => t.status === 'PASS').length;
        const failed = tests.filter(t => t.status === 'FAIL').length;
        const warnings = tests.filter(t => t.status === 'WARN').length;

        console.log(`${category}: ${passed}/${tests.length} passed`);
        if (failed > 0) console.log(`  ❌ ${failed} failed`);
        if (warnings > 0) console.log(`  ⚠️  ${warnings} warnings`);
    }

    console.log('\n' + '='.repeat(80));

    if (summary.failed > 0) {
        console.log('\n❌ VALIDATION FAILED - Please fix the errors above\n');
        console.log('Failed Tests:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  • [${r.category}] ${r.test}: ${r.message}`);
        });
        return false;
    } else if (summary.warnings > 0) {
        console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS\n');
        console.log('Warnings:');
        results.filter(r => r.status === 'WARN').forEach(r => {
            console.log(`  • [${r.category}] ${r.test}: ${r.message}`);
        });
        return true;
    } else {
        console.log('\n✅ ALL VALIDATIONS PASSED!\n');
        return true;
    }
}

async function main() {
    console.log('🚀 Starting Database Validation...');
    console.log(`📌 Database: ${connectionString}\n`);

    try {
        await testDatabaseConnection();
        await validateTables();
        await validateEnums();
        await validateIndexes();
        await validateConstraints();
        await validateBusinessRules();
        await validateSampleData();
        await validateMigrations();

        const success = await generateReport();

        await prisma.$disconnect();
        await pool.end();

        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('\n❌ Fatal Error:', error);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

export { main as validateDatabase };
