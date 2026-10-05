// Usage: node scripts/hash-password.mjs <password>
// Prints a bcrypt hash to paste into src/lib/election/tenants.ts
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}
console.log(bcrypt.hashSync(pw, 12));
