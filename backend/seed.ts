import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { email: 'empresa@teste.com' },
    update: {},
    create: {
      cnpj: '12345678000199',
      razaoSocial: 'Empresa Teste LTDA',
      nomeRepresentante: 'João Silva',
      cpfRepresentante: '12345678901',
      email: 'empresa@teste.com',
      senha: await bcrypt.hash('123456', 10),
    },
  });

  const funcionario = await prisma.funcionario.upsert({
    where: { email: 'funcionario@teste.com' },
    update: {},
    create: {
      nome: 'Maria Santos',
      cpf: '98765432100',
      email: 'funcionario@teste.com',
      senha: await bcrypt.hash('123456', 10),
      salario: 5000,
      empresaId: empresa.id,
    },
  });

  console.log('Dados de teste criados:');
  console.log('Empresa:', empresa);
  console.log('Funcionário:', funcionario);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
