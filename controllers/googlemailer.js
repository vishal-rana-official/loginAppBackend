import nodemailer from 'nodemailer'
import ENV from '../config.js'
import Mailgen from 'mailgen'




export const googleMailer = async (req, res) => {
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "vishalrana10888.vr@gmail.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    }

    transporter.sendMail(message).then((info) => {
        return res.status(201).json({
            msg: " you should receive a message",
            info: info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
        })
    }).catch(error => {
        return res.status(500).json({ error })
    })
}

export const maingooglemailer = async (req, res) => {

    const { userEmail } = req.body;

    let config = {
        service: 'gmail',
        rejectUnauthorized: false,
        auth: {
            user: 'vishalrana10111.vr@gmail.com',
            pass: 'tbqnwkqqmirrkzyj'
        }
    }

    let transporter = nodemailer.createTransport(config)

    let MailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: "Mailgen",
            link: "https://mailgen.js/"
        }
    })

    let response = {
        body: {
            name: "daily ", 
            intro: "your bill has arrived",
            table: {
                data: [
                    {
                        item: "Nodemailer stack book",
                        description: "a backend application",
                        price: "10ruppees"
                    }
                ]
            },
            outro: "Looking forward to work with you"
        }
    }

    let mail = MailGenerator.generate(response)

    let message = {
        from: 'vishalrana10111.vr@gmail.com',
        to: userEmail,
        subject: "place order",
        html: mail
    }

    transporter.sendMail(message).then(()=> {
        return res.status(201).json({
            msg: "you should receive an email"
        })
    }).catch(error => {
        return res.status(500).json({ error })
    })
}