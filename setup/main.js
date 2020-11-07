const readline = require('readline-sync')
const seedFirestore = require('./seedFirestore')

async function main () {
  const hasConfig = seedFirestore.checkConfigFile()
  if (!hasConfig) {
    console.log('firebase-config.js ❌ File not found')
    process.exit()
  }
  console.log('firebase-config.js ✅')

  const hasPermission = await seedFirestore.checkPermissions()
  if (!hasPermission) {
    console.log('Firestore Database Rules ❌ Missing or insufficient permissions to write to Firestore')
    process.exit()
  }
  console.log('Firestore Database Rules ✅')

  if (readline.keyInYN('Do you want to seed the pizzas in Firestore?')) {
    let success = false
    try {
      await seedFirestore.seed()
      success = true
    } catch (err) {
      console.log('Seed Firestore ❌')
      console.error(err)
      process.exit()
    }
    if (success) {
      console.log('Seed Firestore ✅')
    }
  }

  console.log('Complete')
  process.exit()
}

main()