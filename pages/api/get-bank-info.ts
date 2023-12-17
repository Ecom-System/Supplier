// pages/api/get-bank-info.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.query;

    // Perform the database query to fetch bank info based on user email
    const results = await new Promise((resolve, reject) => {
      db.query('SELECT `account`, `secret_key` FROM ecommerce_users WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Check if any results were returned
    const bankInfo = (results as any)[0] || null;
    if((results as any).length == 0 || bankInfo.account == null) res.status(200).json({success:false, bankInfo:bankInfo});
    else res.status(200).json({success:true,bankInfo:bankInfo});
    
  } catch (err) {
    console.error('Error fetching bank info:', err);
    res.status(200).json({ success:false,message: 'Error fetching bank info' });
  }
}
