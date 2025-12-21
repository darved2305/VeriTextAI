# VeriText AI

VeriText AI is a marketing and landing experience for an academic integrity and plagiarism detection platform, built with Next.js 16, TypeScript, Tailwind CSS, and Prismic. It showcases how educators can use AI-powered tooling to detect text and code plagiarism, integrate with existing LMS platforms, and streamline grading workflows.

## Core Features

- **Hero section with value proposition** – Highlights VeriText AI as an academic integrity and plagiarism detection tool for educators.
- **Bento feature grid** – Visual grid explaining key capabilities like AI paraphrase detection, code plagiarism scanning, LMS integration, and batch processing.
- **Showcase workflow section** – Illustrates a "built for your teaching workflow" story with imagery and copy focused on zero-disruption LMS integration.
- **Integrations section** – Starfield background and imagery explaining integrations with major LMS platforms (Canvas, Blackboard, Moodle, Google Classroom, Schoology, etc.).
- **Case studies section** – Logo + narrative tiles for institutions like Stanford and MIT showing trust and outcomes.
- **Call to action slice** – Conversion-focused section encouraging educators to get started or contact sales.
- **Dynamic CMS-driven pages** – Prismic-powered `[uid]` route to render arbitrary marketing/content pages from the CMS with slices (`/src/app/[uid]/page.tsx`).
- **Slice-based content architecture** – Reusable, animated slices under `src/slices` (Hero, Bento, Showcase, Integrations, CaseStudies, CallToAction) wired via `SliceZone` and `src/slices/index.ts`.
- **Responsive, polished UI** – Tailwind-driven layout, `Bounded` layout wrapper, and custom components like `NavBar`, `Footer`, `ButtonLink`, and `WordMark` for consistent brand feel.
- **Animation & motion** – GSAP + custom `AnimatedContent` components for subtle entrance animations and starfield backgrounds, respecting reduced-motion preferences via `usePrefersReducedMotion`.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript & React 18
- **Styling:** Tailwind CSS + custom components
- **CMS:** Prismic (`@prismicio/client`, `@prismicio/react`, slice-based content)
- **Animation:** GSAP (`gsap`, `@gsap/react`)
- **Icons:** `react-icons`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Prismic:
   - Set `NEXT_PUBLIC_PRISMIC_REPOSITORY` in your environment to your Prismic repository name (defaults to `"your-repo-name"` in `src/prismicio.ts`).
   - Ensure the `page` custom type and slices (Hero, Bento, Showcase, Integrations, CaseStudies, CallToAction) are defined in your Prismic project.
3. Run the development server:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000` in your browser.

## Project Structure (Highlights)

- `src/app/layout.tsx` – Root layout, global styles, header/footer, metadata.
- `src/app/page.tsx` – Home page composing the main slices.
- `src/app/[uid]/page.tsx` – Dynamic Prismic-driven pages using `SliceZone`.
- `src/prismicio.ts` – Prismic client configuration and repository name.
- `src/components/` – Shared UI components (Bounded, ButtonLink, Header, Footer, NavBar, StarGrid, WordMark).
- `src/slices/` – Slice components for CMS-managed sections (Hero, Bento, Showcase, Integrations, CaseStudies, CallToAction).
- `src/hooks/usePrefersReducedMotion.js` – Motion preference hook for more accessible animations.

## Deployment

This is a standard Next.js application and can be deployed to any platform that supports Next.js (e.g., Vercel, Azure Static Web Apps, Netlify). Make sure to configure your Prismic environment variables in your hosting provider before deploying.

## Customization

- Update copy and imagery in the slice components under `src/slices` to match your own product.
- Wire additional slices via `src/slices/index.ts` and your Prismic slice models.
- Adjust branding (colors, typography, logo) via `src/app/globals.css`, Tailwind config, and components like `WordMark` and `NavBar`.
