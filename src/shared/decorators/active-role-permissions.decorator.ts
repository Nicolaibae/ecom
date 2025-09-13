import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RolePermissionsType } from "../models/shared-role.model";
import { REQUEST_ROLE_PERMISSIONS } from "../constants/auth.constant";


export const ActiveRolePermissions = createParamDecorator(
  (field: keyof RolePermissionsType | undefined, context: ExecutionContext) => {
   const request = context.switchToHttp().getRequest()
   console.log(request["role_permissions"])
   const rolePermissions: RolePermissionsType | undefined = request[REQUEST_ROLE_PERMISSIONS]
   return field ? rolePermissions?.[field] : rolePermissions
  }
);