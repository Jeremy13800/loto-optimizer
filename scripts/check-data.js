const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
  const draw = await prisma.draw.findFirst()
  console.log('Sample draw:', JSON.stringify(draw, null, 2))
  console.log('\nType of nums:', typeof draw.nums)
  console.log('Is array:', Array.isArray(draw.nums))
  console.log('First num type:', typeof draw.nums[0])
  await prisma.$disconnect()
}

checkData()
