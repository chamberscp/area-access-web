const sql = require('mssql');
const fetch = require('node-fetch');

const connectionString = process.env.SQL_CONNECTION_STRING;
const recaptchaSecret = process.env.RECAPTCHA_SECRET;

module.exports = async function (context, req) {
    context.log('Processing access request submission');

    const body = req.body || {};
    const captchaToken = body.captchaToken;

    if (!captchaToken) {
        context.res = { status: 400, body: { error: 'Missing reCAPTCHA token' } };
        return;
    }

    // Verify reCAPTCHA v3
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyResult = await verifyResponse.json();

    context.log(`reCAPTCHA verification result: ${JSON.stringify(verifyResult)}`);
    context.log(`reCAPTCHA score: ${verifyResult.score || 'N/A'}`);

    // Temporary low threshold for testing – raise to 0.5+ once stable
    if (!verifyResult.success || (verifyResult.score && verifyResult.score < 0.5)) {
        context.res = { status: 400, body: { error: 'Bot detected' } };
        return;
    }

    const { firstName, lastName, vehicleMake, vehicleModel, vehicleColor, email, reason } = body;

    try {
        await sql.connect(connectionString);
        await sql.query`
            INSERT INTO AccessRequests 
            (FirstName, LastName, VehicleMake, VehicleModel, VehicleColor, Email, ReasonForAccess, Status, SubmittedAt)
            VALUES 
            (${firstName}, ${lastName}, ${vehicleMake}, ${vehicleModel}, ${vehicleColor}, ${email}, ${reason}, 'Submitted', GETDATE())
        `;
        context.log('Request inserted into database successfully');
        context.res = { status: 200, body: { success: true, message: 'Request submitted successfully!' } };
    } catch (err) {
        context.log.error('Database error: ', err);
        context.res = { status: 500, body: { error: 'Failed to save request' } };
    }
};
