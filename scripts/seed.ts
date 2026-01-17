import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);
  
  // Create Users
  await prisma.user.upsert({
    where: { email: 'admin@rms.com' },
    update: {},
    create: {
      email: 'admin@rms.com',
      username: 'admin',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@rms.com' },
    update: {},
    create: {
      email: 'manager@rms.com',
      username: 'manager',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'cashier@rms.com' },
    update: {},
    create: {
      email: 'cashier@rms.com',
      username: 'cashier',
      name: 'Cashier User',
      password: cashierPassword,
      role: 'CASHIER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'kitchen@rms.com' },
    update: {},
    create: {
      email: 'kitchen@rms.com',
      username: 'kitchen',
      name: 'Kitchen Staff',
      password: kitchenPassword,
      role: 'KITCHEN_STAFF',
    },
  });
  
  // Create Menu Categories
  const beverages = await prisma.menuCategory.upsert({
    where: { slug: 'beverages' },
    update: {},
    create: { name: 'Beverages', slug: 'beverages' },
  });

  const mainCourse = await prisma.menuCategory.upsert({
    where: { slug: 'main-course' },
    update: {},
    create: { name: 'Main Course', slug: 'main-course' },
  });

  // Create Menu Items
  // Check if items exist to avoid duplicates since we don't have unique slugs for items
  const existingItems = await prisma.menuItem.count();
  
  if (existingItems === 0) {
    await prisma.menuItem.createMany({
        data: [
            {
                name: 'Classic Burger',
                description: 'Juicy beef patty with lettuce, tomato, and cheese',
                price: 12.99,
                categoryId: mainCourse.id,
                available: true,
            },
            {
                name: 'Chicken Sandwich',
                description: 'Grilled chicken breast with mayo',
                price: 10.99,
                categoryId: mainCourse.id,
                available: true,
            },
            {
                name: 'Cola',
                description: 'Cold fizzy drink',
                price: 2.99,
                categoryId: beverages.id,
                available: true,
            },
            {
                name: 'Water',
                description: 'Spring water',
                price: 1.50,
                categoryId: beverages.id,
                available: true,
            }
        ]
    });
    console.log('Added menu items');
  }

  console.log('Seed completed successfully with multi-role users.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
