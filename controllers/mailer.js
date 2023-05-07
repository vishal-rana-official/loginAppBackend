import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'
import ENV from '../config.js'



export const registerMail = async (req, res) => {

    const { username, userEmail, text, subject } = req.body;

    let nodeconfig = {
        service: 'gmail',
        rejectUnauthorized: false,
        auth: {
            user: 'vishalrana10111.vr@gmail.com',
            pass: 'xmkeehksxwdempcb'
        }
    }    

    let transporter = nodemailer.createTransport(nodeconfig)

    let MailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Mailgen",
            link: 'https://mailgen.js/'
        }
    })


    let email = {
        body: {
            name: username || 'test otp',
            intro: text || 'welcome to tuition',
            outro: 'need help'
        }
    }

    let emailBody = MailGenerator.generate(email)

    let message = {
        from: 'vishalrana10111.vr@gmail.com',
        to: userEmail,
        subject: subject || "signup successfully",
        html: emailBody
    }

    transporter.sendMail(message).then(() => {
        return res.status(201).json({ msg: "you should receive a email from us" })
    }).catch(error => {
        return res.status(500).send({ error })
    })
}

