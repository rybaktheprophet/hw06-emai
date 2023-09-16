const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
	{
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		email: {
			type: String,
			match: emailRegexp,
			required: [true, "Email is required"],
			unique: true,
		},
		subscription: {
			type: String,
			enum: ["starter", "pro", "business"],
			default: "starter",
		},
		token: {
			type: String,
			default: null,
		},
		verify: {
			type: Boolean,
			default: false,
		},
		verificationCode: {
			type: String,
			default: "",
		},
	},
	{ versionKey: false, timestamps: false },
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

const registerSchema = Joi.object({
	email: Joi.string().required().error(new Error("missing required email field")),
	password: Joi.string().required().error(new Error("missing required password field")),
});

const emailSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
});

const loginSchema = Joi.object({
	email: Joi.string().required().error(new Error("missing required email field")),
	password: Joi.string().required().error(new Error("missing required password field")),
});
const updateSchema = Joi.object({
	subscription: Joi.string().required().error(new Error("missing required subscription field")),
});

const schemas = {
	registerSchema,
	emailSchema,
	loginSchema,
	updateSchema,
};

module.exports = {
	User,
	schemas,
};
