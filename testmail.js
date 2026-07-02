require("dotenv").config();
const transporter = require("./utils/mailer");

async function sendTestMail() {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "HR Payroll Test Email",
            text: "Congratulations! Your Nodemailer setup is working."
        });

        console.log("Email sent successfully!");
    } catch (err) {
        console.log(err);
    }
}

sendTestMail();