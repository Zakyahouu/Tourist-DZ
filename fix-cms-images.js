import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.startsWith(`${name}=`)) {
            return line.split('=')[1].trim();
        }
    }
    return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixCmsImages() {
    console.log('=== FIX CMS IMAGES ===\n');

    // 1. List uploaded CMS images in storage
    const { data: files, error } = await supabase.storage
        .from('site-images')
        .list('', { sortBy: { column: 'created_at', order: 'asc' } });

    if (error || !files?.length) {
        console.log('No files found in site-images bucket.');
        return;
    }

    console.log(`Found ${files.length} uploaded CMS images:\n`);
    const cmsFiles = files.filter(f => f.name.startsWith('cms-'));

    for (const f of cmsFiles) {
        const { data: { publicUrl } } = supabase.storage.from('site-images').getPublicUrl(f.name);
        console.log(`  ${f.name} → ${publicUrl}`);
    }

    // 2. Show current CMS image values
    console.log('\nCurrent CMS image values:');
    const { data: cmsData } = await supabase
        .from('site_content')
        .select('id, key, value')
        .ilike('key', '%image%');

    for (const item of (cmsData || [])) {
        const isUnsplash = item.value?.includes('unsplash.com');
        const isEmpty = !item.value || item.value.trim() === '';
        console.log(`  ${item.key}: ${isUnsplash ? '⚠️  UNSPLASH FALLBACK' : isEmpty ? '⚠️  EMPTY' : '✅ Custom URL'}`);
        console.log(`    → ${item.value?.substring(0, 100) || '(empty)'}`);
    }

    console.log('\n---');
    console.log('To fix: Go to admin Settings page, re-upload images, then click SAVE.');
    console.log('The lock fix ensures saves will now persist to the database.');
    console.log('\nAlternatively, run the 009_schema_fixes.sql migration in your');
    console.log('Supabase SQL Editor, then re-upload site images from Admin > Sites.\n');
}

fixCmsImages().catch(console.error);
