import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendUserConfirmation(name: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenido a Spectranse',
      template: 'welcome',
      context: {
        name,
      },
    });
  }

  async sendSateliteComming(
    name: string,
    email: string,
    latitude: number,
    longitude: number,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Satélite Landsat muy cerca tuyo',
      template: 'satelite',
      context: {
        name,
        latitude,
        longitude,
      },
    });
  }
}
