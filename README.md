# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Automatic Email Sending (Forms)

Contact and Custom Tour forms are configured to send automatically via EmailJS.

### 1. Configure environment variables

Create a `.env` file in the project root using `.env.example`:

```bash
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_CONTACT_TEMPLATE_ID=template_contact_xxxxxxx
VITE_EMAILJS_CUSTOM_TOUR_TEMPLATE_ID=template_custom_tour_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxxxxxxxxxxxxx
```

Business contact info (shown in form emails):

```bash
VITE_BUSINESS_NAME=Kigezi Wildlife Vacation Safaris
VITE_BUSINESS_CONTACT_EMAIL=you@example.com
VITE_BUSINESS_PHONE_PRIMARY=+256700000000
VITE_BUSINESS_PHONE_SECONDARY=+256700000001
VITE_BUSINESS_PHONE_TERTIARY=+256700000002
```

Optional override:

```bash
VITE_EMAILJS_API_URL=https://api.emailjs.com/api/v1.0/email/send
```

Optional SEO values:

```bash
VITE_SITE_URL=https://your-domain.example
VITE_TWITTER_HANDLE=@yourhandle
VITE_BUSINESS_SOCIAL_LINKS=https://facebook.com/yourpage,https://instagram.com/yourpage
```

Optional multi-user tour ratings values:

```bash
VITE_TOUR_RATING_API_URL=/api/tour-ratings
VITE_TOUR_RATING_API_KEY=replace_with_shared_secret
```

### 1b. Search indexing setup (important)

- Set `VITE_SITE_URL` to your live production domain in `.env`.
- The build now auto-generates:
  - `public/sitemap.xml` (all core pages + all `/tours/:id` and `/services/:id`)
  - `public/sitemap-images.xml` (image discovery for gallery/media assets)
  - `public/robots.txt` (with both sitemap entries)
- After deploy, submit both:
  - `https://<your-domain>/sitemap.xml`
  - `https://<your-domain>/sitemap-images.xml`
  in Google Search Console and request indexing for key pages.

Optional legacy fallback:

```bash
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
```

This fallback uses one template ID for both forms.

### 2. Create EmailJS templates

Template designs and variables are documented in:

- `EMAILJS_TEMPLATES.md`

Use the HTML blocks from that file inside EmailJS template content for a styled email layout.

### 3. Behavior

- Form submissions are sent automatically to `kigeziwildlifevacationltd@gmail.com`
- Users see success or error messages directly in the form
- No mail app draft is required

## Multi-User Tour Ratings

Tour ratings now support many users through a shared API endpoint with automatic local fallback.

### Start the ratings API locally

```bash
npm run ratings:server
```

The API runs at `http://127.0.0.1:8787/api/tour-ratings` and stores data in `storage/tour-ratings.json`.

### Start the frontend

```bash
npm run dev
```

Vite is configured to proxy `/api/tour-ratings` to the local ratings API in development.

### Production notes

- Host the ratings API behind your domain at `/api/tour-ratings`, or set `VITE_TOUR_RATING_API_URL` to your API URL.
- If `VITE_TOUR_RATING_API_KEY` is set in frontend env, set the same secret as `TOUR_RATING_API_KEY` for the server process.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
