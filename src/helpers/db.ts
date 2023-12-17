import mysql from 'mysql2';

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'pt',
	database: 'e_commerce'
});

connection.connect((err) => {
	if (err) {
		console.error('Error connecting to database: ', err);
		return;
	}
	console.log('Connected to database!');
});

export default connection;