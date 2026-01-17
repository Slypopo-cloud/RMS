import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@rms.com';
  const username = 'admin';
  const password = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { username },
    create: {
      email,
      username,
      name: 'Admin User',
      password,
      role: 'ADMIN',
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

  console.log({ user, categories: [beverages, mainCourse] });
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
