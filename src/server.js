import 'dotenv/config';

if (!process.env.HASH_SALT) {
    console.error('HASH_SALT is missing. Add HASH_SALT to the .env file.');
    process.exit(1);
}

await import('./main.js');
