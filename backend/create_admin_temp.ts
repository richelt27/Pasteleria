
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔄 Creating Admin User...');

        // 1. Find Admin Role
        const adminRole = await prisma.rol.findFirst({
            where: { nombre: 'Admin' }
        });

        if (!adminRole) {
            console.error('❌ Admin Role not found! Run "npx prisma db seed" first.');
            return;
        }

        // 2. Hash Password "123456"
        const hashedPassword = await bcrypt.hash('123456', 10);

        // 3. Upsert Admin User
        const admin = await prisma.usuario.upsert({
            where: { email: 'admin@admin.com' },
            update: {
                password_hash: hashedPassword,
                estado: 'ACTIVO',
                id_rol: adminRole.id_rol
            },
            create: {
                nombre_completo: 'Administrador Principal',
                email: 'admin@admin.com',
                password_hash: hashedPassword,
                telefono: '999888777',
                direccion_default: 'Oficina Central',
                estado: 'ACTIVO',
                id_rol: adminRole.id_rol
            }
        });

        console.log('✅ Admin User Ready!');
        console.log('📧 Email: admin@admin.com');
        console.log('🔑 Pass:  123456');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
