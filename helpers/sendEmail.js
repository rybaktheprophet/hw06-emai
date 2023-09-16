const nodemailer = require("nodemailer");
const { PASS } = process.env;

const configOptions = {
	host: "smtp.mail.yahoo.com",
	sequre: true,
	port: 465,
	auth: {
		user: "test.555@yahoo.com",
		pass: PASS,
		rejectUnauthorized: true,
		minVersion: "TLSv1.2",
	},
};
const transport = nodemailer.createTransport(configOptions);

const email = {
	to: "kinedav149@huvacliq.com",
	from: "test.555@yahoo.com",
	subject: "Test email",
	html: "<p><strong>Test email</strong> from localhost:3000</p>",
};

transport
	.sendMail(email)
	.then(() => console.log("Email send success"))
	.catch(error => console.log(error.message));

async function sendEmail() {
	const info = await transport.sendMail({
		from: '"Fred Foo 👻" <test.555@yahoo.com>',
		to: "bar@example.com, baz@example.com",
		subject: "Hello ✔",
		text: "Hello world?",
		html: "<b>Hello world?</b>",
	});

	console.log("Message sent: %s", info.messageId);
}

sendEmail().catch(console.error);

module.exports = sendEmail;
