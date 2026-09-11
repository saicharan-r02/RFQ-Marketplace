import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding B2B RFQ Marketplace database...');

    await prisma.notification.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.rFQ.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const buyer = await prisma.user.create({
        data: {
            email: 'buyer@apexind.com',
            password: hashedPassword,
            name: 'Sarah Jenkins',
            companyName: 'Apex Industrial Corp',
            role: 'BUYER',
            phone: '+1 555-0199',
        },
    });

    const supplier1 = await prisma.user.create({
        data: {
            email: 'supplier1@globaltech.com',
            password: hashedPassword,
            name: 'Michael Chang',
            companyName: 'Global Tech Components Ltd',
            role: 'SUPPLIER',
            phone: '+1 555-0245',
        },
    });

    const supplier2 = await prisma.user.create({
        data: {
            email: 'supplier2@primepack.com',
            password: hashedPassword,
            name: 'Elena Rostova',
            companyName: 'Prime Logistics & Packaging',
            role: 'SUPPLIER',
            phone: '+1 555-0378',
        },
    });

    const deadline1 = new Date();
    deadline1.setDate(deadline1.getDate() + 14);

    const deadline2 = new Date();
    deadline2.setDate(deadline2.getDate() + 7);

    const rfq1 = await prisma.rFQ.create({
        data: {
            title: '500 Units - Industrial Stainless Steel Flanges (ANSI 150#)',
            description: 'Require ASTM A182 F316/316L forged stainless steel weld neck flanges. Must include mill test certificates and third-party inspection reports.',
            category: 'Industrial Machinery',
            quantity: 500,
            unit: 'Units',
            deliveryLocation: 'Houston Port Logistics Hub, TX',
            deadline: deadline1,
            targetBudget: 15000,
            status: 'OPEN',
            buyerId: buyer.id,
        },
    });

    const rfq2 = await prisma.rFQ.create({
        data: {
            title: '10,000 Custom Corrugated Heavy-Duty Shipping Cartons',
            description: 'Double-wall corrugated shipping boxes (ECT-48 or 275# test), custom printed with single-color company branding. Moisture-resistant coating preferred.',
            category: 'Packaging',
            quantity: 10000,
            unit: 'Boxes',
            deliveryLocation: 'Distribution Center 4, Chicago, IL',
            deadline: deadline2,
            targetBudget: 8500,
            status: 'OPEN',
            buyerId: buyer.id,
        },
    });

    await prisma.quotation.create({
        data: {
            rfqId: rfq1.id,
            supplierId: supplier1.id,
            price: 13800,
            deliveryDays: 12,
            notes: 'Direct factory pricing with full ISO 9001 compliance and 100% PMI testing before dispatch.',
            status: 'PENDING',
        },
    });

    await prisma.quotation.create({
        data: {
            rfqId: rfq2.id,
            supplierId: supplier2.id,
            price: 7950,
            deliveryDays: 6,
            notes: 'Includes free plate printing for logos and pallets shrink-wrapped for safe transit.',
            status: 'PENDING',
        },
    });

    console.log('Database seeded successfully!');
    console.log('Demo Accounts:');
    console.log('  Buyer:      buyer@apexind.com      / Password123!');
    console.log('  Supplier 1: supplier1@globaltech.com / Password123!');
    console.log('  Supplier 2: supplier2@primepack.com  / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });