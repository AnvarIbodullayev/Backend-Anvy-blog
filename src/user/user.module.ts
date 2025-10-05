import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OtpModule } from 'src/otp/otp.module';
import { MailerModule } from 'src/mail/mail.module';

@Module({
  imports: [OtpModule, MailerModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
