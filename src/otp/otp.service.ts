import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
    constructor(private readonly prisma: PrismaService) { }

    // generate, save, and return OTP
    async createAndSaveOtp(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) throw new NotFoundException("User not found");

        // generate OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 min

        // save in DB
        await this.prisma.user.update({
            where: { email },
            data: {
                otpCode,
                otpAttempts: 0,
                otpExpiresAt: otpExpire,
            }
        })

        return { otpCode, otpExpire };
    }

    // verify otp
    async verifyOtp(email: string, otp: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) throw new NotFoundException('User not found');

        if (user.otpCode !== otp) throw new BadRequestException("Invalid Otp")

        if (user.otpAttempts > 3) throw new BadRequestException("Too many request try again later")

        await this.prisma.user.update({
            where: { email },
            data: {
                otpCode: null,
                otpAttempts: 0,
                otpExpiresAt: null,
            }
        })

        // BadRequestException
        return { message: 'Account verified successfully' };
    }
}