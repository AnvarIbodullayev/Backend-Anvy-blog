import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/decorators/role.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    // Bu guard Reflectorni qabul qilmoqda.
    // Reflector yordamida dekoratordan olingan metadatani o‘qiydi.


    // canActivate() → Guard’ning asosiy metodi, requestni davom ettirish yoki bloklashni hal qiladi.
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException("User not authenticated")
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException("You do not have permission to access this resource")
        }

        return true;
    }
}