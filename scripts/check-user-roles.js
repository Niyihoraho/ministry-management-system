const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles...\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userrole: {
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      }
    });

    console.log(`📊 Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.name || 'No name'} (${user.email || 'No email'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Has userrole: ${user.userrole.length > 0 ? 'Yes' : 'No'}`);
      
      if (user.userrole.length > 0) {
        const role = user.userrole[0];
        console.log(`   Role: ${role.scope}`);

        console.log(`   Assigned: ${role.assignedAt}`);
        console.log(`   Region: ${role.regionId || 'None'}`);
        console.log(`   University: ${role.universityId || 'None'}`);
        console.log(`   Small Group: ${role.smallGroupId || 'None'}`);
        console.log(`   Alumni Group: ${role.alumniGroupId || 'None'}`);
      } else {
        console.log(`   Role: No role assigned`);
      }
      console.log('');
    });

    // Check for users without roles
    const usersWithoutRoles = users.filter(user => user.userrole.length === 0);
    
    if (usersWithoutRoles.length > 0) {
      console.log(`⚠️  ${usersWithoutRoles.length} users without roles:`);
      usersWithoutRoles.forEach(user => {
        console.log(`   - ${user.name || 'No name'} (${user.email || 'No email'}) - ID: ${user.id}`);
      });
      console.log('');
    }

    // Check for users with superadmin roles
    const superadminUsers = users.filter(user => 
      user.userrole.length > 0 && user.userrole[0].scope === 'superadmin'
    );
    
    console.log(`👑 ${superadminUsers.length} users with superadmin role:`);
    superadminUsers.forEach(user => {
      console.log(`   - ${user.name || 'No name'} (${user.email || 'No email'}) - ID: ${user.id}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSuperAdminRole(userId) {
  try {
    console.log(`🔧 Creating superadmin role for user: ${userId}`);
    
    const existingRole = await prisma.userrole.findFirst({
      where: {
        userId: userId
      }
    });

    if (existingRole) {
      console.log(`⚠️  User already has a role: ${existingRole.scope}`);
      return;
    }

    const newRole = await prisma.userrole.create({
      data: {
        userId: userId,
        scope: 'superadmin',
        assignedAt: new Date()
      }
    });

    console.log(`✅ Created superadmin role for user ${userId}`);
    console.log(`   Role ID: ${newRole.id}`);
    console.log(`   Scope: ${newRole.scope}`);
    
  } catch (error) {
    console.error('❌ Error creating superadmin role:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'check') {
  checkUserRoles();
} else if (command === 'create-superadmin' && args[1]) {
  createSuperAdminRole(args[1]);
} else {
  console.log('Usage:');
  console.log('  node scripts/check-user-roles.js check');
  console.log('  node scripts/check-user-roles.js create-superadmin <userId>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/check-user-roles.js check');
  console.log('  node scripts/check-user-roles.js create-superadmin clh1234567890');
} 