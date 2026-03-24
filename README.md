# VisionSpeaks

Visionspeaks is a Next.js website for Visionspeaks Multimedia Ltd — a company offering CCTV monitoring, IT infrastructure, and multimedia production services. The site uses the Next.js App Router and modern React tooling to deliver a fast, media-rich marketing and portfolio site.

## Features

- Hero video background and animated sections
- Service and solutions pages (CCTV Monitoring, IT, Multimedia, Smart Systems)
- Gallery and media showcases
- Contact form (EmailJS integration placeholder)
- Reusable components: `Navbar`, `Footer`, and UI cards

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS (configured via PostCSS)
- Framer Motion for animations
- Lucide icons

## Repository Structure

- `src/app` — application routes and layout (Next.js app router)
- `src/components` — shared UI components (`Navbar.tsx`, `Footer.tsx`)
- `public/videos` — hero and media video assets
- `src/app/globals.css` — global styles and CSS variables
- `package.json` — scripts and dependencies

Notable files:

- `src/app/page.tsx` — Home / landing page
- `src/app/layout.tsx` — Root layout (imports `Navbar` and `Footer`)
- `src/app/contact/page.tsx` — Contact form and office locations

## Getting Started

Prerequisites

- Node.js 16+ (recommended)
- A package manager: `npm`, `pnpm`, or `yarn`

Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn
```

Run development server

```bash
npm run dev
# then open http://localhost:3000
```

Build for production

```bash
npm run build
npm run start
```

Linting

```bash
npm run lint
```

## Environment & Deployment Notes

- The project includes video assets under `public/videos`. Keep large media out of the repo for production; consider using a CDN.
- Recommended deployment: Vercel (native Next.js support). Other Node hosts or adapters for static exports are also possible.

## Contributing

- Fork the repo and create a feature branch.
- Follow the existing code style and TypeScript types.
- Open a pull request with a clear description of changes.

## TODO / Suggestions

- Add a LICENSE file if you plan to open-source the repository.
- Integrate EmailJS keys via environment variables and server actions for production.
- Add automated linting/formatting (Prettier, ESLint rules) and CI (GitHub Actions).

---

If you'd like, I can also add a small `CONTRIBUTING.md`, set up GitHub Actions for linting, or help move large media to a cloud storage/CDN.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
