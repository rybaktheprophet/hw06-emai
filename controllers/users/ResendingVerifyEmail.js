const { nanoid } = require('nanoid');
const User = require('../../models/user');
const sendEmail1 = require('../../helpers/nodemailer');

const resendingVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw res.status(200).json({ message: 'missing required field email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw res.status(400).json({ message: 'User with this email not found' });
    }
    if (user.verify) {
      throw res.status(400).json({ message: 'Verification has already been passed' });
    }

    const verificationToken = nanoid();
    user.verificationToken = verificationToken;
    await user.save();

    const emailOP = {
      to: newUser.email,
      subject: 'resendingVerifyEmail',
      text: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Confirm email</a>`,
    };

    await sendEmail1(emailOP);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.log(`Error in "resendingVerifyEmail"!!!`);
    console.log(error.message);
    next(error);
  }
};

module.exports = resendingVerifyEmail;
