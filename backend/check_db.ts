
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rolesCount = await prisma.rol.count();
    const usersCount = await prisma.usuario.count();

    console.log(`Roles encontrados: ${rolesCount}`);
    console.log(`Usuarios encontrados: ${usersCount}`);

    const roles = await prisma.rol.findMany();
    console.log('Roles:', JSON.stringify(roles, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
