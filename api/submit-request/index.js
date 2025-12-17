const sql = require('mssql');
const fetch = require('node-fetch');

const connectionString = process.env.SQL_CONNECTION_STRING;
const recaptchaSecret = process.env.RECAPTCHA_SECRET;

module.exports = async function (context, req) {
    context.log('Processing request');

    const { captchaToken, firstName, lastName, vehicleMake, vehicleModel, vehicleColor, email, reason } = req.body;

    // Verify reCAPTCHA
    const verify = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`);
    const verifyResult = await verify.json();
    if (!verifyResult.success || verifyResult.score < 0.3) {
        context.res = { status: 400, body: { error: 'Bot detected' } };
        return;
    }

    try {
        await sql.connect(connectionString);
        await sql.query`
            INSERT INTO AccessRequests (FirstName, LastName, VehicleMake, VehicleModel, VehicleColor, Email, ReasonForAccess, Status)
            VALUES (${firstName}, ${lastName}, ${vehicleMake}, ${vehicleModel}, ${vehicleColor}, ${email}, ${reason}, 'Submitted')
        `;
        context.res = { status: 200, body: { success: true } };
    } catch (err) {
        context.log(err);
        context.res = { status: 500, body: { error: 'Database error' } };
    }
};
