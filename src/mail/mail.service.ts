import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailerService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    }

    // send verification email
    async sendVerificationEmail(to: string, token: string) {
        const link = `http://localhost:3333/api/auth/verify?token=${token}`
        await this.transporter.sendMail({
            from: `"Anvy" <${process.env.MAIL_USER}>`,
            to,
            subject: "Verify your account",
            html: `<p>Please verify your account by clicking <a href="${link}">this link</a>.</p>`,
        })
    }
    // send OTP email
    async sendOtpEmail(to: string, otp: string) {
        await this.transporter.sendMail({
            from: `"Anvy" <${process.env.MAIL_USER}>`,
            to,
            subject: "Reset password",
            html: `<h1>Your OTP code: ${otp}</h1>`,
        })
    }
}