
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = [
        { nombre: 'Admin', descripcion: 'Administrador total del sistema' },
        { nombre: 'Cliente', descripcion: 'Cliente que realiza pedidos web' },
        { nombre: 'Pastelero', descripcion: 'Encargado de la producción' },
        { nombre: 'Delivery', descripcion: 'Repartidor de pedidos' },
    ];

    console.log('🌱 Sembrando Roles...');

    for (const rol of roles) {
        await prisma.rol.upsert({
            where: { nombre: rol.nombre },
            update: {},
            create: rol,
        });
    }

    console.log('✅ Roles creados correctamente.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
