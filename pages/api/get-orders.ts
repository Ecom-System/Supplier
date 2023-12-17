// pages/api/get-orders.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status } = req.query;
  
    // Perform the database query to fetch the orders
    const results = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM `order_table` WHERE `status` = ? ORDER BY `time` ASC', [status], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Return the orders as the response
    res.status(200).json({ orders: results });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}
