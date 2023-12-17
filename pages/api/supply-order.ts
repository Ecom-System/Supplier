// pages/api/supply-order.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({success: false, message: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    // Update the order status from 1 to 3 in the database
    await new Promise((resolve, reject) => {
      db.query('UPDATE `e_commerce`.`order_table` SET `status` = 3 WHERE `id` = ?', [orderId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).json({success: true, message: 'Order supplied successfully' });
  } catch (err) {
    console.error('Error supplying order:', err);
    res.status(500).json({success: false, message: 'Error supplying order' });
  }
}