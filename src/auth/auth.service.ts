import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { authDto } from './dto/auth.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mail/mail.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private jwtService: JwtService,
        private mailer: MailerService
    ) { }

    // sign up
    async signup(dto: authDto) {
        const { password, username, ...userData } = dto
        const hashed = await bcrypt.hash(password, 10)

        // Agar username "Anonymous" bo‘lsa -> ruxsat
        // Aks holda DBda mavjudligini tekshiramiz
        if (username && username !== "Anonymous") {
            const existUsername = await this.prisma.user.findFirst({ where: { username } })
            if (existUsername) throw new ForbiddenException("Username already taken")
        }

        const finalUsername = username ?? "Anonymous"

        await this.prisma.user.create({
            data: {
                ...userData,
                username: finalUsername,
                password: hashed,
                isVerified: false,
            }
        })

        // verification token
        const token = this.jwtService.sign(
            { email: userData.email },
            { secret: process.env.JWT_SECRET, expiresIn: "1h" }
        )

        // send mail
        await this.mailer.sendVerificationEmail(dto.email, token)

        return { message: 'Signup successful, please check your email to verify' };
    }

    // sign in
    async signin(dto: authDto) {
        const { password, email } = dto
        const user = await this.prisma.user.findUnique({
            where: { email }
        })
        if (!user) throw new NotFoundException("Invalid credentials")

        // 15 daqiqaga bloklangan foydalanuvchi tekshiruvi
        if (user.blockUntil && user.blockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.blockUntil.getTime() - new Date().getTime()) / 60000);
            throw new ForbiddenException(`Account blocked due to multiple failed attempts. Try again in ${minutesLeft} minutes`);
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            const failedAttempts = user.failedPasswordAttempts + 1;
            const updateData: any = { failedPasswordAttempts: failedAttempts };

            // 5 marta xato bo‘lsa, 15 minut block qo‘shamiz
            if (failedAttempts >= 5) {
                updateData.blockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                updateData.failedPasswordAttempts = 0; // keyingi urinishi uchun reset
            }

            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            throw new NotFoundException("Invalid credentials")
        }

        // Password to'g'ri bo'lsa, failed attempts reset qilinadi
        if (user.failedPasswordAttempts > 0 || user.blockUntil) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedPasswordAttempts: 0, blockUntil: null },
            });
        }

        if (!user.isVerified) throw new ForbiddenException("Verify your account first please")

        const tokens = await this.generateTokens(user.id, user.username, user.email, user.role, user.avatar ?? undefined)

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: tokens.refresh_token,
                failedPasswordAttempts: 0
            }
        })

        const cleanUser = { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }

        return { message: "Sign in successful", ...tokens, cleanUser }
    }

    // generate tokens
    async generateTokens(userId: string, username: string, email: string, role: Role, avatar?: string | null) {
        const payload = { sub: userId, username: username, email: email, role: role, avatar: avatar }

        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: "5h", // short
        });

        const refresh_token = await this.jwtService.signAsync(payload, {
            expiresIn: "7d", // long
        });

        return { access_token, refresh_token }
    }

    // refresh token
    async refreshToken(refresh_token: string) {
        try {

            const payload = await this.jwtService.verify(refresh_token)

            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
            if (!user || user.refreshToken !== refresh_token) {
                throw new UnauthorizedException("Invalid refresh token");
            }

            const tokens = await this.generateTokens(user.id, user.username, user.email, user.role);

            await this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: tokens.refresh_token }
            });

            return { message: "Token refreshed", ...tokens }

        } catch (e) {
            throw new UnauthorizedException("Refresh token expired or invalid");
        }
    }

    // verify
    async verify(token: string) {
        try {
            const payload = this.jwtService.verify(token)

            await this.prisma.user.update({
                where: { email: payload.email },
                data: { isVerified: true }
            });

            return { message: "✅ Account successfully verified!" }
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }

    // log out
    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null
            }
        });

        return { message: "Logged out successfuly" }
    }
}
