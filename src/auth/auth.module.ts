import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "supersecret",
      signOptions: { expiresIn: "1h" }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
