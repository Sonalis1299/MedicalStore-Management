const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticRouter = require("./routes/staticRouter");
const cors = require("cors");

const mysql = require('mysql2/promise');

// --------------------MySQL Connection---------------------------------------------

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'Root@123',
    database: 'medicals',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Optional: Verify database connection
const checkDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL Database');
        connection.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

checkDatabaseConnection();

// -----------------------------------------------------------------------

const app = express();
const PORT = 3000;
// -----------------------------------------------------------------

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use("/", staticRouter);
app.use(express.json());

// --------------------------------------------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));






// ----------MEDICINES TABLE---------------------------------


// Add a route to render the medicines view
app.get('/data/medicines', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medicines');
        console.log(rows)
        res.render('medi_table', { medicines: rows });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Failed to fetch data');
    }
});


app.post('/medicines/delete/:id', async (req, res) => {
    const medicineID = req.params.id;

    try {
        const deleteQuery = 'DELETE FROM medicines WHERE medicineID = ?';
        const [result] = await pool.query(deleteQuery, [medicineID]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Record deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Record not found.' });
        }
    } catch (err) {
        console.error('Error deleting medicine:', err);
        res.status(500).json({ error: 'Failed to delete the record.' });
    }
});


app.get('/medicines/update/:id', async (req, res) => {
    const medicineID = req.params.id;

    try {
        const selectQuery = 'SELECT * FROM medicines WHERE medicineID = ?';
        const [rows] = await pool.query(selectQuery, [medicineID]);

        if (rows.length === 0) {
            return res.status(404).send('Medicine not found');
        }

        // Pass the existing medicine data to the edit page
        res.render('edit_med', { medicine: rows[0] });
    } catch (err) {
        console.error('Error fetching medicine details:', err);
        res.status(500).send('Server error');
    }
});


app.post('/final-edit', async (req, res) => {
    const {
        medicineID,
        medicineCode,
        medicineName,
        quantity,
        medicineType,
        manufactureDate,
        expiryDate,
        manufacturer,
        price,
        ownerID,
        employeeID,
        mID,
        customerID,
    } = req.body;

    const updateQuery = `
        UPDATE medicines
        SET 
            medicineCode = ?, 
            medicineName = ?, 
            quantity = ?, 
            medicineType = ?, 
            manufactureDate = ?, 
            expiryDate = ?, 
            manufacturer = ?, 
            price = ?, 
            ownerID = ?, 
            employeeID = ?, 
            memberID = ?, 
            customerID = ?
        WHERE medicineID = ?
    `;

    try {
        const [result] = await pool.query(updateQuery, [
            medicineCode,
            medicineName,
            quantity,
            medicineType,
            manufactureDate,
            expiryDate,
            manufacturer,
            price,
            ownerID,
            employeeID,
            mID,
            customerID,
            medicineID,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Medicine not found or no changes made');
        }

        console.log('Medicine updated successfully:', result);
        res.redirect('/data/medicines'); // Redirect to the medicines list page
    } catch (err) {
        console.error('Error updating medicine:', err);
        res.status(500).send('Database error');
    }
});





// ---------------------EMPLOYEE TABLE------------------------------------

app.get('/data/employees', async (req, res) => {
    try {
        const query = 'SELECT * FROM employees';
        console.log('Executing Query:', query); // Log the query

        const [employees] = await pool.query(query);
        console.log('Fetched Employees:', employees); // Log fetched data

        res.render('empl_table.ejs', { employees });
    } catch (err) {
        console.error('Error fetching employee data:', err);
        res.status(500).send('Database error');
    }
});

app.post('/employees/delete/:id', async (req, res) => {
    try {
        const employeeID = req.params.id; // Ensure this matches your request

        const deleteQuery = 'DELETE FROM employees WHERE employeeID = ?';
        const [result] = await pool.query(deleteQuery, [employeeID]);

        if (result.affectedRows > 0) {
            console.log(`Employee with ID ${employeeID} deleted successfully`);
            res.status(200).send({ success: true });
        } else {
            console.log(`Employee with ID ${employeeID} not found`);
            res.status(404).send({ error: 'Employee not found' });
        }
    } catch (err) {
        console.error('Error deleting employee:', err.message, err.stack);
        res.status(500).send({ error: 'Database error' });
    }
});

//editing routes to be added






// ----------------OWNERS TABLE---------------------------------------------

app.get('/data/owners', async (req, res) => {
    try {
        const query = 'SELECT * FROM owners';
        console.log('Executing Query:', query); // Log the query

        const [owners] = await pool.query(query);
        console.log('Fetched Owners:', owners); // Corrected to log owners

        res.render('own_table.ejs', { owners });
    } catch (err) {
        console.error('Error fetching owner data:', err);
        res.status(500).send('Database error');
    }
});


app.post('/owners/delete/:id', async (req, res) => {
    try {
        const ownerID = req.params.id;
        const deleteQuery = 'DELETE FROM owners WHERE ownerID = ?';
        const [result] = await pool.query(deleteQuery, [ownerID]);

        if (result.affectedRows > 0) {
            console.log(`Owner with ID ${ownerID} deleted successfully`);
            res.status(200).send({ success: true });
        } else {
            console.log(`Owner with ID ${ownerID} not found`);
            res.status(404).send({ error: 'Owner not found' });
        }
    } catch (err) {
        console.error('Error deleting owner:', err.message, err.stack);
        res.status(500).send({ error: 'Database error' });
    }
});

app.get('/owners/update/:id', async (req, res) => {
    try {
        const ownerID = req.params.id;
        const query = 'SELECT * FROM owners WHERE ownerID = ?';
        const [owner] = await pool.query(query, [ownerID]);
        if (owner.length > 0) {
            res.render('edit_owner', { owner: owner[0] }); // Pass the owner data to edit form
        } else {
            res.status(404).send('Owner not found');
        }
    } catch (err) {
        console.error('Error fetching owner data:', err);
        res.status(500).send('Database error');
    }
});

//editing routes to be added





// ---------------MEMBERS TABLE---------------------------------

app.get('/data/members', async (req, res) => {
    try {
        const query = 'SELECT * FROM members';
        console.log('Executing Query:', query); // Log the query

        const [members] = await pool.query(query);
        console.log('Fetched Members:', members); // Log fetched members data

        res.render('mem_table.ejs', { members });
    } catch (err) {
        console.error('Error fetching member data:', err); // Corrected error message
        res.status(500).send('Database error');
    }
});

// further to add edit and delete routes





// ---------------BILL TABLE-----------------------------------------
app.get('/data/bills', async (req, res) => {
    try {
        const query = 'SELECT * FROM billing';
        console.log('Executing Query:', query); // Log the query

        const [bills] = await pool.query(query);
        console.log('Fetched Bills:', bills); // Log fetched members data

        res.render('bill_table.ejs', { bills });
    } catch (err) {
        console.error('Error fetching billing data:', err); // Corrected error message
        res.status(500).send('Database error');
    }
});

// delete and update routes to be added





// -------------------POST ROUTES-----------------------------

app.post('/owner', async (req, res) => {
    const { ownerID, firstName, lastName, contactNumber } = req.body;

    const query = 'INSERT INTO owners (owner_id, first_name, last_name, phone_number) VALUES (?, ?, ?, ?)';
    try {
        const [result] = await pool.query(query, [ownerID, firstName, lastName, contactNumber]);
        console.log('Owner data inserted:', result);
        res.send('Owner information saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.post('/medicalStore', async (req, res) => {
    const {
        medicineID,
        medicineCode,
        medicineName,
        quantity,
        medicineType,
        manufactureDate,
        expiryDate,
        manufacturer,
        price,
        ownerID,
        employeeID,
        mID,
        customerID
    } = req.body;

    // SQL query to insert the data into the database
    const query = `
        INSERT INTO medicines 
        (medicineID, medicineCode, medicineName, quantity, medicineType, manufactureDate, expiryDate, manufacturer, price, ownerID, employeeID, memberID, customerID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [
            medicineID,
            medicineCode,
            medicineName,
            quantity,
            medicineType,
            manufactureDate,
            expiryDate,
            manufacturer,
            price,
            ownerID,
            employeeID,
            mID,
            customerID
        ]);
        console.log('Medicine data inserted:', result);
        res.send('Medicine information saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.post('/employee', async (req, res) => {
    const { employeeID, employeeName, address, contactNumber, jobTitle, salary } = req.body;

    // SQL query to insert the data into the employees table
    const query = `
        INSERT INTO employees 
        (employee_id, employee_name, address, contact_number, job_title, salary) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [
            employeeID, 
            employeeName, 
            address, 
            contactNumber, 
            jobTitle, 
            salary
        ]);
        console.log('Employee data inserted:', result);
        res.send('Employee information saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.post('/membersInfo', async (req, res) => {
    const { memberID, membershipID, startDate, endDate, contactNumber } = req.body;

    // SQL query to insert the data into the members table
    const query = `
        INSERT INTO members 
        (member_id, membership_id, start_date, end_date, contact_number) 
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [
            memberID, 
            membershipID, 
            startDate, 
            endDate, 
            contactNumber
        ]);
        console.log('Member data inserted:', result);
        res.send('Member information saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.post('/bills', async (req, res) => {
    const { customerID, customerName, address, contactNumber, memberID } = req.body;

    // SQL query to insert the data into the bills table
    const query = `
        INSERT INTO billing 
        (customer_id, customer_name, address, contact_number, member_id) 
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.query(query, [
            customerID, 
            customerName, 
            address, 
            contactNumber, 
            memberID
        ]);
        console.log('Billing info inserted:', result);
        res.send('Billing information saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});