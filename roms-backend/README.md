<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Cashier UI demo without login

This opt-in demo mode exposes only explicitly marked Cashier API operations. Enable it separately in the local backend and frontend environments, then restart both applications:

```env
NODE_ENV=development
CASHIER_DEMO_AUTH_BYPASS=true
CASHIER_DEMO_CASHIER_ID=<existing active cashier account UUID>
CASHIER_DEMO_REFUND_APPROVER_ID=<existing active manager/admin with REFUND_APPROVE UUID>
```

In `roms-web/.env.local`, set:

```env
VITE_CASHIER_DEMO_AUTH_BYPASS=true
```

Both flags default to off. The backend rejects startup if `CASHIER_DEMO_AUTH_BYPASS=true` unless `NODE_ENV=development`. The frontend bypass applies only to Cashier routes when running Vite in development mode. When enabled, these database-backed endpoints do not require a token:

- `GET /api/v1/cashier/tables`
- `GET /api/v1/cashier/menu`
- `GET /api/v1/cashier/tables/:tableId/order`
- `GET /api/v1/cashier/transactions`
- `GET /api/v1/cashier/revenue`
- `GET /api/v1/cashier/audit-logs`
- `GET /api/v1/cashier/end-of-day`
- `GET /api/v1/cashier/shifts/current` (reads the configured demo cashier's shift)
- `POST /api/v1/cashier/orders`
- `POST /api/v1/cashier/bills/validate-promotion`
- `POST /api/v1/cashier/sessions/:sessionId/bill`
- `POST /api/v1/cashier/payments`
- `POST /api/v1/cashier/bills/:billId/split`
- `POST /api/v1/cashier/tables/merge`
- `POST /api/v1/cashier/tables/:tableId/mark-clean`
- `POST /api/v1/cashier/payments/:paymentId/refund`

Demo writes use only the backend-configured local account IDs; client-provided identities are ignored. The cashier ID must resolve to an active cashier, manager, or admin account. The refund approver must be active and have the `REFUND_APPROVE` permission. Keep these values in the ignored local `.env` file; never copy them into production configuration. Missing or invalid IDs reject the relevant operation. No authenticated `request.user` or JWT is created.

Demo operations modify the actual local PostgreSQL records and audit history. Cashier payment methods are recorded locally; this API does not perform card, e-wallet, or QR-provider settlement. Refunds create local refund records and do not send funds back to a provider. Review bill/table state before trying a workflow; successful payments close bills and may move tables into cleaning.

User-specific shift endpoints and all unlisted mutations continue to require normal JWT authentication and role checks. The separate `/api/v1/reports` endpoints require JWT authentication; Cashier screens use the explicitly scoped `/api/v1/cashier` report routes listed above.

Start the backend from `roms-backend` with `npm run start:dev`, and the frontend from `roms-web` with `npm run dev`. Do not enable the backend flag outside local development.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
