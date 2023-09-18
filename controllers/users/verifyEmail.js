const User = require('../../models/user');

const verifyEmail = async (req, res, next) => {
  const verificationToken = req.params;

  const user = await User.findOne(verificationToken);
  console.log(`user`, user.verify);
  try {
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    if (!user) {
      console.log('error!  !user in verifyEmail');
      throw res.status(404).json({ message: 'User not found' });
    }
    if (user.verify) {
      console.log('error!  "user.verify" in verifyEmail');
      throw res.status(400).json({ message: 'Verification has already been passed' });
    }

    console.log(`user : `, user.email);

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.log(`Error in "verifyEmail"!!!`);
    next(error);
  }
};

module.exports = verifyEmail;
