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

async function diagnoseImages() {
    console.log('=== IMAGE DIAGNOSTIC ===\n');

    // 1. Check site_content for image keys
    console.log('1. CMS Image Content (site_content):');
    const { data: cmsData, error: cmsError } = await supabase
        .from('site_content')
        .select('key, value')
        .ilike('key', '%image%');

    if (cmsError) {
        console.error('   ❌ Error:', cmsError.message);
    } else if (!cmsData || cmsData.length === 0) {
        console.log('   ⚠️  No image keys found in site_content');
    } else {
        for (const item of cmsData) {
            console.log(`   ${item.key}: ${item.value?.substring(0, 100)}...`);
        }
    }

    // 2. Check site_images
    console.log('\n2. Site Images (site_images):');
    const { data: siteImages, error: siError } = await supabase
        .from('site_images')
        .select('id, site_id, image_url, is_primary')
        .limit(10);

    if (siError) {
        console.error('   ❌ Error:', siError.message);
    } else if (!siteImages || siteImages.length === 0) {
        console.log('   ⚠️  No images found in site_images table');
    } else {
        console.log(`   Found ${siteImages.length} images:`);
        for (const img of siteImages) {
            console.log(`   [site=${img.site_id}] primary=${img.is_primary} url=${img.image_url?.substring(0, 120)}`);
        }
    }

    // 3. Check accommodation_images
    console.log('\n3. Accommodation Images (accommodation_images):');
    const { data: accImages, error: aiError } = await supabase
        .from('accommodation_images')
        .select('id, accommodation_id, image_url, is_primary')
        .limit(10);

    if (aiError) {
        console.error('   ❌ Error:', aiError.message);
    } else if (!accImages || accImages.length === 0) {
        console.log('   ⚠️  No images found in accommodation_images table');
    } else {
        console.log(`   Found ${accImages.length} images:`);
        for (const img of accImages) {
            console.log(`   [acc=${img.accommodation_id}] primary=${img.is_primary} url=${img.image_url?.substring(0, 120)}`);
        }
    }

    // 4. Check storage buckets by listing files
    console.log('\n4. Storage Bucket Contents:');
    for (const bucket of ['site-images', 'accommodation-images', 'gallery', 'event-images']) {
        const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list('', { limit: 5, sortBy: { column: 'created_at', order: 'desc' } });

        if (listError) {
            console.log(`   ${bucket}: ❌ ${listError.message}`);
        } else if (!files || files.length === 0) {
            console.log(`   ${bucket}: ⚠️  Empty (no files uploaded)`);
        } else {
            console.log(`   ${bucket}: ✅ ${files.length} file(s) found`);
            for (const f of files) {
                const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(f.name);
                console.log(`     - ${f.name} (${f.metadata?.size || '?'} bytes) → ${publicUrl}`);
            }
        }
    }

    // 5. Test if a public URL is actually accessible
    console.log('\n5. URL Accessibility Test:');
    const allUrls = [];
    if (siteImages?.length) allUrls.push({ label: 'site_images[0]', url: siteImages[0].image_url });
    if (accImages?.length) allUrls.push({ label: 'acc_images[0]', url: accImages[0].image_url });
    if (cmsData?.length) {
        const heroItem = cmsData.find(d => d.key === 'home_hero_image');
        if (heroItem) allUrls.push({ label: 'hero_image', url: heroItem.value });
    }

    for (const { label, url } of allUrls) {
        try {
            const resp = await fetch(url, { method: 'HEAD' });
            console.log(`   ${label}: ${resp.status} ${resp.statusText} (${url.substring(0, 80)}...)`);
        } catch (e) {
            console.log(`   ${label}: ❌ FETCH FAILED - ${e.message} (${url.substring(0, 80)}...)`);
        }
    }

    if (allUrls.length === 0) {
        console.log('   No URLs to test (tables are empty)');
    }

    // 6. Check tourist_sites with joined images
    console.log('\n6. Tourist Sites with Images:');
    const { data: sites, error: sitesError } = await supabase
        .from('tourist_sites')
        .select('id, name, site_images(image_url)')
        .limit(5);

    if (sitesError) {
        console.error('   ❌ Error:', sitesError.message);
    } else {
        for (const site of sites || []) {
            const imgCount = site.site_images?.length || 0;
            const name = site.name?.fr || site.name?.en || JSON.stringify(site.name);
            console.log(`   ${name}: ${imgCount} image(s)${imgCount ? ' → ' + site.site_images[0].image_url?.substring(0, 80) : ''}`);
        }
    }

    // 7. Check profiles for admin users
    console.log('\n7. Admin Users:');
    const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'admin');

    if (adminError) {
        console.error('   ❌ Error:', adminError.message);
    } else if (!admins || admins.length === 0) {
        console.log('   ⚠️  No admin profiles found! This explains why the admin icon never shows.');
    } else {
        console.log(`   Found ${admins.length} admin(s):`);
        for (const admin of admins) {
            console.log(`   - ${admin.full_name || 'unnamed'} (${admin.id})`);
        }
    }

    console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

diagnoseImages().catch(console.error);
