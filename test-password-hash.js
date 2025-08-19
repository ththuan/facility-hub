const bcrypt = require('bcryptjs');

// Test password hashing for admin123
const password = 'admin123';
const saltRounds = 10;

console.log('Original password:', password);

// Generate hash
const hash = bcrypt.hashSync(password, saltRounds);
console.log('Generated hash:', hash);

// Test verification
const isValid = bcrypt.compareSync(password, hash);
console.log('Hash verification:', isValid);

// Test with the existing hash in database
const existingHash = '$2b$10$GqHD/YQbNx7.6J7CcHGKMOz8uK8D3hNhD4r4vZMjGJP4mVeRVzAci';
const isExistingValid = bcrypt.compareSync(password, existingHash);
console.log('Existing hash verification:', isExistingValid);
