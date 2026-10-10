import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@prisma/client';

export const ROLES_KEY = 'required_roles';
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
