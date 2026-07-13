import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail', // Hoặc sử dụng host/port nếu không dùng gmail
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com', // Thay bằng email của bạn hoặc cấu hình trong .env
            pass: process.env.EMAIL_PASS || 'your-app-password'     // Thay bằng mật khẩu ứng dụng
        }
    });

    static async sendMail(options: { to: string, subject: string, text: string, html?: string }) {
        try {
            const mailOptions = {
                from: `"FIT 4.0 HomeStay" <${process.env.EMAIL_USER || 'no-reply@homestay.com'}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }
    }
}
