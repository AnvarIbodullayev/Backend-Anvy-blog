import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from 'src/mail/mail.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private mailerService: MailerService,
        private otpService: OtpService
    ) { }

    // get all users
    async getAllUsers() {
        const allUsers = await this.prisma.user.findMany({
            orderBy: {
                createdAt: "desc" // or asc
            }
        })

        return { message: "All users loaded", allUsers }
    }

    // edit username
    async editUsername(userId: string, username: string) {
        const existuser = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        if (!existuser) throw new NotFoundException("User not found")

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                username
            }
        })

        return { message: "Username updated successfuly" }
    }

    // change password
    async changePassword(userId: string, currentPassword: string, newPassword: string, reEnterNewPassword: string) {
        const existUser = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!existUser) throw new NotFoundException("User not found")

        // check empty inputs
        if (!currentPassword?.trim()) {
            throw new BadRequestException("Current password cannot be empty")
        }
        if (!newPassword?.trim() || !reEnterNewPassword?.trim()) {
            throw new BadRequestException("New password cannot be empty")
        }

        const comparedPassword = await bcrypt.compare(currentPassword, existUser.password)
        if (!comparedPassword) throw new UnauthorizedException("Current password is incorrect")

        if (newPassword !== reEnterNewPassword) throw new ForbiddenException("New passwords are not same")

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // save otp in db
        const otp = await this.otpService.createAndSaveOtp(existUser.email)

        // save hashed password as a pendingPassword
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                pendingPassword: hashedNewPassword
            }
        })

        // sending otp to email
        await this.mailerService.sendOtpEmail(existUser.email, otp.otpCode)

        // final stage
        return { message: "Otp sended to your Email please check it out" }

    }

    // confirm OTP
    async confirmOtp(userId: string, otp: string) {
        const existUser = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!existUser) throw new NotFoundException("User not found")

        const attempts = existUser.otpAttempts ?? 0

        if (attempts >= 3) {
            throw new ForbiddenException("Maximum OTP attempts reached. Please request a new OTP.")
        }

        if (existUser.otpCode !== otp) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { otpAttempts: attempts + 1 }
            });

            throw new BadRequestException(`Invalid OTP, your attempts ${attempts + 1} of 3`)
        }

        // Correct OTP, reset attempts and update password
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: existUser.pendingPassword!, // “null emas” deb aytildi
                otpCode: null,
                otpAttempts: 0,
                otpExpiresAt: null,
                pendingPassword: null
            }
        })

        return { message: "Password changed successfully" };
    }

    // forgot password
    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) throw new NotFoundException("User not found")

        const otp = await this.otpService.createAndSaveOtp(email)

        // sending otp to email
        await this.mailerService.sendOtpEmail(email, otp.otpCode)

        // final stage
        return { message: "Otp sended to your Email please check it out" }
    }

    // confirm Otp Forgot Password
    async confirmOtpForgotPassword(email: string, otp: string) {
        await this.otpService.verifyOtp(email, otp)

        // final stage
        return { message: "You can change your password" }
    }

    // change password
    async forgotChangePassword(email: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) throw new NotFoundException("User not found")

        const hashedNewPass = await bcrypt.hash(newPassword, 10)

        await this.prisma.user.update({
            where: { email },
            data: {
                password: hashedNewPass
            }
        })

        return { message: "You password changed successfuly" }
    }

    // change each user role
    async changeRole(userId: string, userRole: Role) {
        const existUser = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!existUser) throw new NotFoundException("User not found")

        if (existUser.role === "ADMIN") throw new BadRequestException("Changing an admin’s role is not permitted.")

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                role: userRole
            }
        })

        return { message: "User's role updated successfuly", userRole }
    }

    // delete user
    async deleteUser(userId: string) {
        const existUser = await this.prisma.user.findUnique({
            where: { id: userId }
        })
        if (!existUser) throw new NotFoundException("User not found")

        if (existUser.role === "ADMIN") throw new BadRequestException("Changing an admin’s role is not permitted.")

        await this.prisma.user.delete({ where: { id: userId } })


        return { message: "User deleted successfuly" }
    }
}
