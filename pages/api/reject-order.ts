// pages/api/reject-order.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/helpers/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    // Update the order status to 1 (rejected) in the database
    await new Promise((resolve, reject) => {
      db.query('UPDATE `e_commerce`.`order_table` SET `status` = 2 WHERE `id` = ?', [orderId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).json({ success: true, message: 'Order rejected successfully' });
  } catch (err) {
    console.error('Error rejecting order:', err);
    res.status(500).json({ success: false, message: 'Error rejecting order' });
  }
}




// // pages/api/reject-order.ts

// import { NextApiRequest, NextApiResponse } from 'next';
// import db from 'src/helpers/db';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'DELETE') {
//     return res.status(405).json({ success: false, message: 'Method not allowed' });
//   }

//   try {
//     const { orderId } = req.query;

//     // Delete the order from the database
//     await new Promise((resolve, reject) => {
//       db.query('DELETE FROM webproject.order WHERE `id` = ?', [orderId], (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     res.status(200).json({ success: true, message: 'Order rejected and deleted successfully' });
//   } catch (err) {
//     console.error('Error rejecting order:', err);
//     res.status(500).json({ success: false, message: 'Error rejecting order' });
//   }
// }
