import { Global, Module } from '@nestjs/common';
import { MailerService } from './mail.service';

@Global()
@Module({
  providers: [MailerService],
  exports: [MailerService], // 👈 shu export juda muhim
})
export class MailerModule {}
