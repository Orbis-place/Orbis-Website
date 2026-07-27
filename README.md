# Orbis - Complete Project Overview

## Project Summary

Orbis is the ultimate community hub for Hytale, inspired by SpigotMC/CurseForge for Minecraft. The project is community-driven and open-source, reflecting Hytale's philosophy.


## Related Hytale Resources

- [Hytale Character Recipes](https://hytalecharacter.com/) - Fan-maintained character recipe archive with manual recreation notes, source screenshots, and recipe JSON for Hytale-inspired character looks.

## What's inside?

This Turborepo monorepo includes the following packages & apps:

### Apps and Packages

```shell
.
├── apps
│   ├── api                       # NestJS app (https://nestjs.com) - Backend API
│   └── web                       # Next.js app (https://nextjs.org) - Frontend web application
└── packages
    ├── @repo/auth                # Authentication package with Better Auth
    ├── @repo/database            # Prisma database schema and client
    ├── @repo/eslint-config       # `eslint` configurations (includes `prettier`)
    ├── @repo/jest-config         # `jest` configurations
    ├── @repo/typescript-config   # `tsconfig.json`s used throughout the monorepo
    └── @repo/ui                  # Shareable stub React component library
```

Each package and application are mostly written in [TypeScript](https://www.typescriptlang.org/).

### Tech Stack

This project uses:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [Next.js](https://nextjs.org/) for the frontend
- [NestJS](https://nestjs.com) for the backend API
- [Prisma](https://www.prisma.io/) for database ORM
- [Better Auth](https://www.better-auth.com/) for authentication with email support
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://jestjs.io/) & [Playwright](https://playwright.dev/) for testing
- [Turborepo](https://turborepo.com/) for monorepo management

### Commands

#### Development

```bash
# Run the development server for all apps & packages
pnpm run dev
```

#### Build

```bash
# Build all apps & packages
pnpm run build

# Note: If you plan to build apps individually,
# please make sure you've built the packages first.
```

#### Test

```bash
# Launch test suites for all apps & packages
pnpm run test

# Run end-to-end tests
pnpm run test:e2e

# See `@repo/jest-config` to customize the behavior.
```

#### Lint

```bash
# Lint all apps & packages
# See `@repo/eslint-config` to customize the behavior.
pnpm run lint
```

#### Format

```bash
# Format all supported `.ts,.js,json,.tsx,.jsx` files
# See `@repo/eslint-config/prettier-base.js` to customize the behavior.
pnpm format
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Useful Links

Learn more about the technologies used:

- [Turborepo Documentation](https://turborepo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)