const nodemailer = require('nodemailer');
require('dotenv').config();

const config = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: 'mygelo@meta.ua',
    pass: process.env.PASSWORD_EMAIL_META_UA,
  },
};

const transporter = nodemailer.createTransport(config);

const sendEmail1 = async data => {
  const emailOP = {
    from: 'mygelo@meta.ua',
    ...data,
  };
  console.log(`emailOP in nodemailer :`, emailOP);
  try {
    await transporter.sendMail(emailOP);
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail1;
