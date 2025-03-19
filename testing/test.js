import bcrypt from 'bcryptjs';


const plaintextPassword = 'ankit'; // Replace with the actual password
const hashedPassword = '$2b$10$VnH./H1p6PAtptvz5zODr.c/CTYCvSHVfdkJUamSrQB/PX7VPTz3e';

bcrypt.compare(plaintextPassword, hashedPassword, (err, isMatch) => {
  if (err) throw err;
  console.log('Password match:', isMatch); // Should log `true` if the password is correct
});