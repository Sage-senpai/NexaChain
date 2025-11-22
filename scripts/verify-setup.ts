// scripts/verify-setup.ts
// Run with: npx tsx scripts/verify-setup.ts

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string): void {
  results.push({
    name,
    status: condition ? 'pass' : 'fail',
    message: condition ? passMsg : failMsg,
  });
}

function warn(name: string, message: string): void {
  results.push({
    name,
    status: 'warn',
    message,
  });
}

console.log('🔍 Verifying Nexachain Setup...\n');

// Check environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

check(
  'Environment File',
  envExists,
  '✅ .env.local file found',
  '❌ .env.local file missing! Create it with your Supabase credentials'
);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  check(
    'Supabase URL',
    envContent.includes('NEXT_PUBLIC_SUPABASE_URL='),
    '✅ NEXT_PUBLIC_SUPABASE_URL is set',
    '❌ NEXT_PUBLIC_SUPABASE_URL is missing'
  );
  
  check(
    'Supabase Anon Key',
    envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='),
    '✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set',
    '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing'
  );
  
  check(
    'Database URL',
    envContent.includes('DATABASE_URL='),
    '✅ DATABASE_URL is set',
    '❌ DATABASE_URL is missing'
  );
  
  // Check if variables have actual values (not placeholders)
  if (envContent.includes('your_supabase_project_url')) {
    warn('Environment Variables', '⚠️  Replace placeholder values in .env.local with actual Supabase credentials');
  }
}

// Check required files
const requiredFiles = [
  'src/utils/useUser.ts',
  'src/utils/useUpload.ts',
  'src/auth.ts',
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/app/api/utils/sql.ts',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  
  check(
    `File: ${file}`,
    exists,
    `✅ ${file} exists`,
    `❌ ${file} is missing`
  );
});

// Check dependencies
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/ssr',
    '@supabase/supabase-js',
    '@neondatabase/serverless',
    'framer-motion',
    'lucide-react',
    'react-qr-code',
  ];
  
  requiredDeps.forEach((dep) => {
    check(
      `Dependency: ${dep}`,
      !!deps[dep],
      `✅ ${dep} is installed`,
      `❌ ${dep} is missing - run: npm install ${dep}`
    );
  });
}

// Check directory structure
const requiredDirs = [
  'src/app/api',
  'src/app/account',
  'src/app/dashboard',
  'src/app/admin',
  'src/components',
  'src/lib',
  'src/utils',
  'src/types',
];

requiredDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  const exists = fs.existsSync(dirPath);
  
  check(
    `Directory: ${dir}`,
    exists,
    `✅ ${dir} exists`,
    `❌ ${dir} is missing`
  );
});

// Print results
console.log('\n📋 Setup Verification Results:\n');
console.log('='.repeat(60));

let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach((result) => {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.message}`);
  
  if (result.status === 'pass') passCount++;
  if (result.status === 'fail') failCount++;
  if (result.status === 'warn') warnCount++;
});

console.log('='.repeat(60));
console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`);

if (failCount === 0 && warnCount === 0) {
  console.log('🎉 Setup verification complete! Your project is ready.');
  console.log('Run `npm run dev` to start the development server.\n');
} else if (failCount > 0) {
  console.log('❌ Setup incomplete. Please address the failed checks above.');
  console.log('Refer to the Supabase Setup Instructions for help.\n');
} else {
  console.log('⚠️  Setup mostly complete, but please review the warnings above.\n');
}

process.exit(failCount > 0 ? 1 : 0);