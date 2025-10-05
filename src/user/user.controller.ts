import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/guard/jwt.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // get all users
  @UseGuards(JwtGuard, RoleGuard)
  @Roles("ADMIN")
  @Throttle({ short: { ttl: 1000, limit: 3 } })
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers()
  }

  // edit username
  @Throttle({ short: { ttl: 1000, limit: 3 } })
  @Put(":id")
  editUsername(@Param("id") userId: string, @Body() body: { username: string }) {
    return this.userService.editUsername(userId, body.username)
  }

  // change password
  // @UseGuards(JwtGuard)
  @Put("password/:id")
  changePassword(
    @Param("id") userId: string,
    @Body() body: { currentPassword: string, newPassword: string, reEnterNewPassword: string }
  ) {
    return this.userService.changePassword(userId, body.currentPassword, body.newPassword, body.reEnterNewPassword)
  }

  // confirm OTP
  @Post("otp/confirm/:id")
  confirmOtp(
    @Param("id") userId: string,
    @Body() body: { otp: string }
  ) {
    return this.userService.confirmOtp(userId, body.otp)
  }

  // forgot password create OTP and save in db
  @Post("forgotpassword")
  forgotPassword(@Body() body: { email: string }) {
    return this.userService.forgotPassword(body.email)
  }

  // confirm OTP after forgot password
  @Post("confirmotpforgotpassword")
  confirmOtpForgotPassword(@Body() body: { email: string, otp: string }) {
    return this.userService.confirmOtpForgotPassword(body.email, body.otp)
  }

  // change password
  @Post("forgotchangepassword")
  forgotChangePassword(@Body() body: { email: string, newPassword: string }) {
    return this.userService.forgotChangePassword(body.email, body.newPassword)
  }

  // change each user role
  @Throttle({ long: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles("ADMIN")
  @Patch(":id/changerole")
  changeRole(
    @Param("id") userId: string,
    @Body() body: { userRole: Role }
  ) {
    return this.userService.changeRole(userId, body.userRole)
  }

  // delete user
  @UseGuards(JwtGuard, RoleGuard)
  @Roles("ADMIN")
  @Delete(":id")
  deleteUser(@Param("id") userId: string) {
    return this.userService.deleteUser(userId)
  }
}
