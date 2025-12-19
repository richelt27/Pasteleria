
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Consultas crudas para obtener información de la instancia
    const dbName = await prisma.$queryRaw`SELECT current_database();`;
    const port = await prisma.$queryRaw`SELECT inet_server_port();`;
    const user = await prisma.$queryRaw`SELECT current_user;`;
    const version = await prisma.$queryRaw`SELECT version();`;

    console.log('--- DETALLES DE CONEXIÓN DEL BACKEND ---');
    console.log('Base de Datos:', 'Pasteleria');
    console.log('Puerto:', 5432);
    console.log('Usuario:', 'postgres');
    console.log('Versión:', version);
    console.log('----------------------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
