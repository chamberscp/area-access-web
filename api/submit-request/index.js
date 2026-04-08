const sql = require('mssql');
const fetch = require('node-fetch');

const connectionString = process.env.SQL_CONNECTION_STRING;
const recaptchaSecret = process.env.RECAPTCHA_SECRET;

module.exports = async function (context, req) {
    context.log('Processing access request submission');

    const body = req.body || {};
    const captchaToken = body.captchaToken;

    // ── 1. reCAPTCHA token presence check ─────────────────────────────────
    if (!captchaToken) {
        context.res = { status: 400, body: { error: 'Missing reCAPTCHA token' } };
        return;
    }

    // ── 2. Verify reCAPTCHA v3 token with Google ──────────────────────────
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyResult = await verifyResponse.json();

    context.log(`reCAPTCHA verification result: ${JSON.stringify(verifyResult)}`);
    context.log(`reCAPTCHA score: ${verifyResult.score ?? 'N/A'}`);

    // Enforce both token validity AND minimum score threshold
    if (!verifyResult.success || verifyResult.score < 0.5) {
        context.log.warn(`reCAPTCHA failed — success: ${verifyResult.success}, score: ${verifyResult.score}`);
        context.res = { status: 400, body: { error: 'reCAPTCHA verification failed' } };
        return;
    }

    // ── 3. Server-side input validation ───────────────────────────────────
    const { firstName, lastName, vehicleMake, vehicleModel, vehicleColor, email, reason } = body;

    if (!firstName || !lastName || !email || !reason) {
        context.res = { status: 400, body: { error: 'Missing required fields: firstName, lastName, email, reason' } };
        return;
    }

    // ── 4. Database write ─────────────────────────────────────────────────
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
