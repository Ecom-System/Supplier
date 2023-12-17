import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(req.body);
    const from = req.body.account_from;
    const to = req.body.account_to;
    const amount = req.body.tot

    console.log(from);
    console.log("ptttttttttt");

    // Validate the request data (you might want to add more validation)
    if (!from || !to || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert the transaction into the database
    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO e_commerce.transactions (`from`, `to`, `amount`) VALUES (?, ?, ?)',
        [from, to, amount],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    res.status(201).json({ message: 'Transaction recorded successfully', result: insertResult });
  } catch (err) {
    console.error('Error recording transaction:', err);
    res.status(500).json({ message: 'Error recording transaction' });
  }
}
