# ZibanGo Web

ZibanGo Web is the React and Vite web application for the ZibanGo platform. It powers the public tourism website for Biskra, Algeria, and the admin dashboard used to manage sites, events, reviews, gallery content, settings, and related platform data.

## Tech Stack

- React 19
- Vite 7
- Supabase
- React Router
- Tailwind CSS 4
- i18next
- Recharts
- Leaflet

## Main Features

- Public tourism website
- Tourist sites listing and detail pages
- Interactive map experience
- Events pages
- Public gallery
- User profile and favorites
- Authentication with Supabase
- Admin dashboard
- Content management for sites, events, reviews, users, settings, gallery, solidarity data, and accommodations
- Audio guide support for tourist sites
- Multi-language support

## Project Structure

- `src/pages/`
	- public pages such as home, map, events, gallery, profile, and site details
	- `admin/` dashboard pages
- `src/components/`
	- shared UI and layout components
- `src/context/`
	- auth and toast providers
- `src/i18n/`
	- translation configuration
- `src/utils/`
	- helper utilities including logging
- `src/supabaseClient.js`
	- Supabase client configuration

## Requirements

- Node.js 18 or newer
- npm

## Environment Variables

Create a `.env` file in the `web` folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
npm install
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Development

Start the local development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Supabase Usage

The web app uses Supabase for:

- authentication
- profiles and roles
- tourist sites
- events
- favorites
- reviews
- gallery data
- storage buckets for site images and audio guides

The client is configured in `src/supabaseClient.js`.

## Admin Area

The admin section includes management pages for:

- dashboard
- users
- sites
- events
- reviews
- gallery
- settings
- solidarity content
- accommodations

Admin access depends on the authenticated user profile role stored in Supabase.

## Deployment

The app is configured as a single-page application and includes a rewrite to `index.html` through `vercel.json`.

Security-related headers configured for deployment include:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`

## Notes

- The project uses React Router for navigation
- i18n is configured for multilingual content
- Charts in the admin area are powered by Recharts
- Map functionality uses Leaflet and React Leaflet
- Browser-side Supabase auth session persistence is enabled

## License

Private project.
