# Skill: Create a NestJS Module (VitAuto pattern)

When asked to create a new NestJS module, generate this exact file structure and follow all conventions below.

## File structure

```
src/modules/{name}/
├── {name}.module.ts
├── {name}.controller.ts
├── {name}.service.ts
├── dto/
│   ├── create-{name}.dto.ts
│   └── update-{name}.dto.ts
└── {name}.service.spec.ts
```

## Module file

```typescript
import { Module } from '@nestjs/common';
import { {Name}Controller } from './{name}.controller';
import { {Name}Service } from './{name}.service';

@Module({
  controllers: [{Name}Controller],
  providers: [{Name}Service],
  exports: [{Name}Service], // export if other modules may need it
})
export class {Name}Module {}
```

- Import `PrismaModule` if the service needs DB access
- Import `ConfigModule` if environment variables are needed

## Controller patterns

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, User } from '@vitauto/shared-types';

@Controller('{name}s')
export class {Name}Controller {
  constructor(private readonly {name}Service: {Name}Service) {}

  // Public endpoint — no guards
  @Get()
  findAll() { ... }

  // Authenticated endpoint
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@CurrentUser() user: User) { ... }

  // Role-restricted endpoint
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: Create{Name}Dto) { ... }
}
```

- Route prefix: `@Controller('{name}s')` — plural, kebab-case
- All mutations are automatically audit-logged via global `AuditInterceptor` — no extra code needed
- Return types use response DTOs — never return raw Prisma model objects

## Service patterns

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class {Name}Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<{ items: {Name}[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.{name}.findMany(),
      this.prisma.{name}.count(),
    ]);
    return { items, total };
  }
}
```

- Never catch errors in the service — let them bubble to the global `HttpExceptionFilter`
- Use `prisma.$transaction([...])` for operations touching multiple tables
- Paginated results always return `{ items, total }` shape

## DTO patterns

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { SomeEnum } from '@vitauto/shared-types';

export class Create{Name}Dto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(SomeEnum)
  @IsOptional()
  status?: SomeEnum;
}
```

- All fields use `class-validator` decorators
- Shared types/enums live in `packages/shared-types` — import from there if used by both web and api
- Never use `any` — use `unknown` and narrow, or use the correct shared type

## Test file pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {Name}Service } from './{name}.service';
import { PrismaService } from '../prisma/prisma.service';

describe('{Name}Service', () => {
  let service: {Name}Service;
  const mockPrisma = { {name}: { findMany: jest.fn(), count: jest.fn() } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {Name}Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<{Name}Service>({Name}Service);
  });

  it('should return items and total', async () => {
    mockPrisma.{name}.findMany.mockResolvedValue([]);
    mockPrisma.{name}.count.mockResolvedValue(0);
    const result = await service.findAll();
    expect(result).toEqual({ items: [], total: 0 });
  });
});
```

- Test business logic in the service, not HTTP behavior in the controller
- Mock `PrismaService` with `jest.fn()`
- Coverage target: ≥80% for standard services, ≥90% for `CalculationService`

## After creating the module

1. Register it in `apps/api/src/app.module.ts`
2. If it exposes new shared types/DTOs, add them to `packages/shared-types/src/`
