///
const sql = require('mssql');

// SQL Server configuration
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
};

module.exports = async function (context, req) {
    const { email, password } = req.body;

    if (!email || !password) {
        context.res = {
            status: 400,
            body: "Please provide both email and password"
        };
        return;
    }

    try {
        await sql.connect(sqlConfig);
        context.log('Request:', req);
        const result = await sql.query`SELECT password FROM Users WHERE email = ${email}`;
        context.log('Result :', result);
        if (result.recordset.length === 0) {
            context.res = {
                status: 404,
                body: "User not found"
            };
            return;
        }

        const user = result.recordset[0];
        //{"email":"vinvitha.reddy@gmail.com","password":"12345"}//result.recordset[0];
        if (password === user.password) {
            context.res = {
                status: 200,
                body: "User authenticated successfully"
            };
        } else {
            context.res = {
                status: 401,
                body: "Invalid credentials"
            };
        }

    } catch (err) {
        context.res = {
            status: 500,
            body: "An error occurred: ${err}"
        };
    } finally {
        await sql.close();
    }
};




