import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';
import { axios } from 'src/lib/axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const account_from = req.body.account_from;
    const account_to = req.body.account_to;
    const amount  = req.body.tot;
    console.log(amount);
    await new Promise((resolve, reject) => {
      db.query('UPDATE e_commerce.users SET balance = balance - ? WHERE account = ?', [amount, account_from], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    await new Promise((resolve, reject) => {
        db.query('UPDATE e_commerce.users SET balance = balance + ? WHERE account = ?', [amount, account_to], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

    try {
      axios.post('/transaction',req.body);

    }
    catch {
      console.log("amar mone koshto in transaction");
    }

    res.status(200).json({ success: true, message: 'Balance updated successfully' });
  } catch (err) {
    console.error('Error during balance update: ', err);
    res.status(200).json({ success: false, message: 'Error during balance update' });
  }
}
