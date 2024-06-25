import nodemailer from "nodemailer";

const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS
    }
});

export function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: to,
        subject: subject,
        text: text
    };

    auth.sendMail(mailOptions, (error, emailResponse) => {
        if (error) {
            throw error;
        }
    });
}
