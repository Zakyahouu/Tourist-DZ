
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

console.log('--- Supabase ESM Diagnostic ---');
console.log('URL:', supabaseUrl);
console.log('Testing connection...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('1. Fetching site_content...');
        const { data, error, status, statusText } = await supabase
            .from('site_content')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Database Query Error:', error.message);
            console.error('Status:', status, statusText);
        } else {
            console.log('✅ Database Connection Successful!');
            console.log('Query Result Status:', status, statusText);
            console.log('Sample Data Key:', data?.[0]?.key || 'No data found (empty table)');
        }

        console.log('\n2. Fetching tourist_sites...');
        const { data: sitesData, error: sitesError } = await supabase.from('tourist_sites').select('*').limit(1);
        if (sitesError) console.error('❌ Tourist Sites Table Error:', sitesError.message);
        else console.log('✅ Tourist Sites Table reachable. Count:', sitesData.length);

        console.log('\n3. Fetching events...');
        const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').limit(1);
        if (eventsError) console.error('❌ Events Table Error:', eventsError.message);
        else console.log('✅ Events Table reachable. Count:', eventsData.length);

        console.log('\n4. Testing Auth API reachability...');
        const { data: authData, error: authError } = await supabase.auth.getSession();

        if (authError) {
            console.error('❌ Auth API Error:', authError.message);
        } else {
            console.log('✅ Auth API is reachable.');
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
}

testConnection();
