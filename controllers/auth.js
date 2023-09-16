const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");
const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user !== null) {
		throw HttpError(409, "Email in use");
	}
	const hash = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);
	const verificationCode = nanoid();
	const newUser = await User.create({ email, password: hash, avatarURL, verificationCode });

	const verifyEmail = {
		to: email,
		subject: "Verify email",
		html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click verify email</a>`,
	};

	await sendEmail(verifyEmail);

	return res.status(201).json({ user: newUser });
};

const verifyEmail = async (req, res) => {
	const { verificationCode } = req.params;
	const user = await User.findOne({ verificationCode });
	if (!user) {
		throw HttpError(401, "Email not found");
	}
	await User.findByIdAndUpdate(user._id, { verify: true, verificationCode: "" });

	res.json({
		message: "Email verify success",
	});
};

const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw HttpError(401, "Email not found");
	}
	if (user.verify) {
		throw HttpError(401, "Email already verify");
	}

	const verifyEmail = {
		to: email,
		subject: "Verify email",
		html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click verify email</a>`,
	};

	await sendEmail(verifyEmail);

	res.json({
		message: "Verify email send success",
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user === null) {
		throw HttpError(401, "Email or password is wrong");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (isMatch === false) {
		throw HttpError(401, "Email or password is wrong");
	}

	const payload = {
		id: user._id,
	};

	const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "23h" });
	await User.findByIdAndUpdate(user._id, { token });
	res.status(200).json({
		token: token,
		user: user,
	});
};

const logout = async (req, res, next) => {
	const { id } = req.user;
	await User.findByIdAndUpdate(id, { token: "" });

	res.status(204).end();
};

const current = async (req, res) => {
	const { id } = req.user;
	const user = await User.findById(id);
	console.log(user);
	res.status(200).json({
		email: user.email,
		subscription: user.subscription,
	});
};

const update = async (req, res) => {
	const { _id } = req.user;
	const result = await User.findByIdAndUpdate(_id, req.body, {
		new: true,
	}).select("subscription");
	res.json(result);
};

const updateAvatar = async (req, res) => {
	const { id } = req.user;
	const { path: tempPath, originalname } = req.file;
	const fileName = `xs_${id}_${originalname}`;
	const resultUpload = path.join(avatarsDir, fileName);
	await Jimp.read(resultUpload)
		.then(img => {
			return img.resize(250, Jimp.AUTO).writeAsync(resultUpload);
		})
		.catch(err => console.log(err));
	await fs.rename(tempPath, resultUpload);
	const avatarURL = path.join("avatars", fileName);
	await User.findByIdAndUpdate(id, { avatarURL });

	res.json({
		avatarURL,
	});
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	logout: ctrlWrapper(logout),
	current: ctrlWrapper(current),
	update: ctrlWrapper(update),
	verifyEmail: ctrlWrapper(verifyEmail),
	resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
	updateAvatar: ctrlWrapper(updateAvatar),
};
