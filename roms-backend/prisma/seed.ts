import { PrismaClient, RoleName, TableStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // ==========================================
  // 1. TẠO 6 ROLES CHUẨN
  // ==========================================

  const roles = [
    {
      name: RoleName.ADMIN,
      description: 'Quản trị viên hệ thống',
    },
    {
      name: RoleName.MANAGER,
      description: 'Quản lý nhà hàng',
    },
    {
      name: RoleName.CASHIER,
      description: 'Thu ngân quầy POS',
    },
    {
      name: RoleName.CHEF,
      description: 'Đầu bếp KDS',
    },
    {
      name: RoleName.WAITER,
      description: 'Nhân viên phục vụ',
    },
    {
      name: RoleName.CUSTOMER,
      description: 'Khách hàng',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: {
        name: role.name,
        description: role.description,
      },
    });
  }

  console.log('✅ Roles seeded!');

  // ==========================================
  // 2. TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
  // ==========================================

  const adminRole = await prisma.role.findUnique({
    where: {
      name: RoleName.ADMIN,
    },
  });

  if (!adminRole) {
    throw new Error('❌ ADMIN role not found!');
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: {
      phone: '0905123456',
    },
    update: {
      fullName: 'System Admin',
      email: 'admin@roms.com',
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      phone: '0905123456',
      fullName: 'System Admin',
      email: 'admin@roms.com',
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(
    '✅ Default Admin account created! (Phone: 0905123456 | Pass: Admin@123)',
  );

  // ==========================================
  // 3. TẠO MỘT SỐ BÀN ĂN MẪU
  // ==========================================

  const sampleTables = [
    {
      tableNumber: 'Bàn 01',
      floor: 1,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_01_TOKEN',
    },
    {
      tableNumber: 'Bàn 02',
      floor: 1,
      capacity: 4,
      qrCodeToken: 'QR_TABLE_02_TOKEN',
    },
    {
      tableNumber: 'Bàn 03',
      floor: 1,
      capacity: 6,
      qrCodeToken: 'QR_TABLE_03_TOKEN',
    },
  ];

  for (const table of sampleTables) {
    await prisma.table.upsert({
      where: {
        tableNumber: table.tableNumber,
      },
      update: {
        floor: table.floor,
        capacity: table.capacity,
        qrCodeToken: table.qrCodeToken,
        status: TableStatus.AVAILABLE,
      },
      create: {
        tableNumber: table.tableNumber,
        floor: table.floor,
        capacity: table.capacity,
        qrCodeToken: table.qrCodeToken,
        status: TableStatus.AVAILABLE,
      },
    });
  }

  console.log('✅ Sample tables seeded!');

  // ==========================================
  // 4. IMPORT MENU DATA FROM EXCEL
  // ==========================================

  console.log('📥 Importing menu data from Excel...');

  const excelPath = path.join(
    __dirname,
    'data',
    'restaurant-menu.xlsx',
  );

  console.log(`📄 Excel file: ${excelPath}`);

  try {
    const workbook = XLSX.readFile(excelPath);

    console.log(
      `📑 Sheet found: ${workbook.SheetNames.join(', ')}`,
    );

    if (workbook.SheetNames.length === 0) {
      throw new Error(
        'Excel file does not contain any worksheet!',
      );
    }

    const worksheet =
      workbook.Sheets[workbook.SheetNames[0]];

    // ==========================================
    // 4.1 ĐỌC DỮ LIỆU EXCEL
    // ==========================================

    const excelData = XLSX.utils.sheet_to_json<{
      name?: string;
      description?: string;
      price?: number | string;
      avgRating?: number | string;

      // Giữ nguyên tên field theo file Excel hiện tại
      catogoryId?: number | string;
      catogory?: string;

      preparationTime?: number | string;
      tags?: string;
      imageUrl?: string;
    }>(worksheet, {
      range: 2,
      defval: '',
    });

    console.log(
      `📊 Found ${excelData.length} menu items in Excel.`,
    );

    if (excelData.length === 0) {
      console.warn(
        '⚠️ No menu data found in Excel. Skipping menu import.',
      );
    } else {
      // ==========================================
      // 4.2 LẤY DANH SÁCH CATEGORY
      // ==========================================

      const categoryMap = new Map<
        string,
        {
          name: string;
          displayOrder: number;
        }
      >();

      for (const item of excelData) {
        const categoryName = String(
          item.catogory || '',
        ).trim();

        if (!categoryName) {
          continue;
        }

        const categoryId = Number(item.catogoryId);

        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            name: categoryName,
            displayOrder: Number.isNaN(categoryId)
              ? 0
              : categoryId,
          });
        }
      }

      // ==========================================
      // 4.3 TẠO CATEGORY
      // ==========================================

      console.log(
        `📂 Found ${categoryMap.size} unique categories.`,
      );

      for (const category of categoryMap.values()) {
        await prisma.category.upsert({
          where: {
            name: category.name,
          },
          update: {
            displayOrder: category.displayOrder,
            isActive: true,
          },
          create: {
            name: category.name,
            displayOrder: category.displayOrder,
            isActive: true,
          },
        });
      }

      console.log(
        `✅ ${categoryMap.size} categories seeded!`,
      );

      // ==========================================
      // 4.4 IMPORT MENU ITEMS
      // ==========================================

      let importedCount = 0;
      let skippedCount = 0;

      for (const item of excelData) {
        const name = String(item.name || '').trim();

        const categoryName = String(
          item.catogory || '',
        ).trim();

        // ==========================================
        // KIỂM TRA NAME
        // ==========================================

        if (!name) {
          console.warn(
            '⚠️ Skipping menu item because name is empty.',
          );

          skippedCount++;
          continue;
        }

        // ==========================================
        // KIỂM TRA CATEGORY
        // ==========================================

        if (!categoryName) {
          console.warn(
            `⚠️ Skipping "${name}" because category is empty.`,
          );

          skippedCount++;
          continue;
        }

        // ==========================================
        // TÌM CATEGORY
        // ==========================================

        const category =
          await prisma.category.findUnique({
            where: {
              name: categoryName,
            },
          });

        if (!category) {
          console.warn(
            `⚠️ Category "${categoryName}" not found for "${name}".`,
          );

          skippedCount++;
          continue;
        }

        // ==========================================
        // XỬ LÝ PRICE
        // ==========================================

        const price = Number(item.price);

        if (Number.isNaN(price) || price < 0) {
          console.warn(
            `⚠️ Skipping "${name}" because price is invalid: ${item.price}`,
          );

          skippedCount++;
          continue;
        }

        // ==========================================
        // XỬ LÝ PREPARATION TIME
        // ==========================================

        let preparationTime: number | null = null;

        if (
          item.preparationTime !== '' &&
          item.preparationTime !== undefined &&
          item.preparationTime !== null
        ) {
          const parsedPreparationTime = Number(
            item.preparationTime,
          );

          if (
            Number.isNaN(parsedPreparationTime) ||
            parsedPreparationTime < 0
          ) {
            console.warn(
              `⚠️ Skipping "${name}" because preparationTime is invalid: ${item.preparationTime}`,
            );

            skippedCount++;
            continue;
          }

          preparationTime = parsedPreparationTime;
        }

        // ==========================================
        // XỬ LÝ TAGS
        // ==========================================

        const tags =
          String(item.tags || '').trim() || null;

        // ==========================================
        // XỬ LÝ DESCRIPTION
        // ==========================================

        const description =
          String(item.description || '').trim() || null;

        // ==========================================
        // XỬ LÝ IMAGE URL
        // ==========================================

        const imageUrl =  String(item.imageUrl || '').trim() || null;

        // ==========================================
        // XỬ LÝ AVG RATING
        // ==========================================

        let avgRating: number | null = null;

        if (
          item.avgRating !== '' &&
          item.avgRating !== undefined &&
          item.avgRating !== null
        ) {
          const parsedAvgRating = Number(
            item.avgRating,
          );

          if (
            Number.isNaN(parsedAvgRating) ||
            parsedAvgRating < 0 ||
            parsedAvgRating > 5
          ) {
            console.warn(
              `⚠️ Invalid avgRating for "${name}": ${item.avgRating}. Using null instead.`,
            );
          } else {
            avgRating = parsedAvgRating;
          }
        }

        // ==========================================
        // LOG DATA TRƯỚC KHI UPSERT
        // ==========================================

        console.log(
          `   🔄 Processing: ${name}`,
        );

        console.log(
          `      💰 Price: ${price}`,
        );

        console.log(
          `      ⏱️ Preparation Time: ${
            preparationTime ?? 'NULL'
          }`,
        );

        console.log(
          `      🏷️ Tags: ${tags ?? 'NULL'}`,
        );

        // ==========================================
        // TÌM MENU ITEM ĐÃ TỒN TẠI
        // ==========================================

        const existingMenuItem =
          await prisma.menuItem.findFirst({
            where: {
              name,
              categoryId: category.id,
            },
          });

        // ==========================================
        // UPDATE MENU ITEM
        // ==========================================

        if (existingMenuItem) {
          await prisma.menuItem.update({
            where: {
              id: existingMenuItem.id,
            },

            data: {
              name,
              categoryId: category.id,

              price,

              description,

              imageUrl,

              // FIX:
              // Lưu preparationTime vào database
              preparationTime,

              // FIX:
              // Lưu tags vào database
              tags,

              // Nếu Excel có avgRating hợp lệ thì cập nhật
              ...(avgRating !== null
                ? {
                    avgRating,
                  }
                : {}),

              isAvailable: true,
            },
          });

          console.log(
            `   ♻️ Updated menu item: ${name}`,
          );
        }

        // ==========================================
        // CREATE MENU ITEM
        // ==========================================

        else {
          await prisma.menuItem.create({
            data: {
              categoryId: category.id,

              name,

              price,

              description,

              imageUrl,

              // FIX:
              // Lưu preparationTime vào database
              preparationTime,

              // FIX:
              // Lưu tags vào database
              tags,

              // Nếu Excel có avgRating hợp lệ thì lưu
              ...(avgRating !== null
                ? {
                    avgRating,
                  }
                : {}),

              isAvailable: true,

              isRecommendable: false,
            },
          });

          console.log(
            `   ➕ Created menu item: ${name}`,
          );
        }

        importedCount++;

        console.log(
          `   🍽️ ${importedCount}. ${name} | ${price} | ${preparationTime ?? 'N/A'} min | ${tags ?? 'No tags'}`,
        );
      }

      // ==========================================
      // KẾT QUẢ IMPORT
      // ==========================================

      console.log(
        `✅ Menu import completed: ${importedCount} imported, ${skippedCount} skipped.`,
      );
    }
  } catch (error) {
    console.error(
      '❌ Failed to import Excel menu data.',
    );

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    throw error;
  }

  // ==========================================
  // 5. HOÀN TẤT
  // ==========================================

  console.log(
    '🎉 Database seeding completed successfully!',
  );
}

// ==========================================
// ERROR HANDLING
// ==========================================

main()
  .catch((error) => {
    console.error(
      '❌ Database seeding failed:',
    );

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });