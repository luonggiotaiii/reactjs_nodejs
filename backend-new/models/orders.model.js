const db = require("../common/db");

const orders = (orders) => {
  this.order_id = orders.order_id;
  this.status = orders.status;
  this.order_date = orders.order_date;
  this.payment_method = orders.payment_method;
  this.voucher_id = orders.voucher_id;
  this.total_amount = orders.total_amount;
  this.address = orders.address;
  this.customer_name = orders.customer_name;
  this.phone = orders.phone;
  this.created_at = orders.created_at;
};

orders.getById = (id, callback) => {
  const sqlString = "SELECT * FROM orders WHERE order_id = ?";
  db.query(sqlString, id, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

orders.getAll = (callback) => {
  const sqlString = "SELECT * FROM orders";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

orders.getPending = (callback) => {
  const sqlString = "SELECT * FROM orders WHERE status = 'pending'";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

orders.getNonPending = (callback) => {
  const sqlString = "SELECT * FROM orders WHERE status != 'pending'";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

orders.updateStatus = (orderId, newStatus, callback) => {
  if (!orderId || !newStatus) {
    return callback(new Error("Order ID and new status are required"));
  }

  const sqlString = "UPDATE orders SET status = ? WHERE order_id = ?";
  const values = [newStatus, orderId];

  db.query(sqlString, values, (err, result) => {
    if (err) {
      return callback(err);
    }
    if (result.affectedRows === 0) {
      return callback(new Error("No order found with the provided ID"));
    }
    callback(null, { order_id: orderId, status: newStatus });
  });
};

orders.create = (orderData, orderDetailsData, callback) => {
  // Input validation
  if (
    !orderData ||
    !orderData.payment_method ||
    !orderData.total_amount ||
    !orderData.address ||
    !orderData.customer_name ||
    !orderData.phone
  ) {
    return callback(new Error("Missing required fields: payment_method, total_amount, address, customer_name, phone"));
  }
  if (!orderDetailsData || !Array.isArray(orderDetailsData) || orderDetailsData.length === 0) {
    return callback(new Error("Invalid or empty order details"));
  }
  for (const detail of orderDetailsData) {
    if (!detail.product_id || !detail.quantity || !detail.price) {
      return callback(new Error("Order detail missing product_id, quantity, or price"));
    }
  }

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return callback(err);
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        connection.release();
        return callback(err);
      }

      // Insert into orders table
      const orderSql = `
        INSERT INTO orders (status, order_date, payment_method, voucher_id, total_amount, address, customer_name, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const orderValues = [
        orderData.status || "pending",
        orderData.order_date || new Date(),
        orderData.payment_method,
        orderData.voucher_id || null,
        orderData.total_amount,
        orderData.address,
        orderData.customer_name,
        orderData.phone,
      ];

      console.log("Executing INSERT orders:", orderSql, orderValues);

      connection.query(orderSql, orderValues, (err, orderResult) => {
        if (err || !orderResult) {
          console.error("Error inserting orders:", err || "orderResult is undefined");
          connection.rollback(() => {
            connection.release();
            return callback(err || new Error("Failed to insert order"));
          });
          return;
        }

        const orderId = orderResult.insertId;
        console.log("orderId:", orderId);

        // Insert into order_details table
        const detailSql = `
          INSERT INTO order_details (order_id, product_id, quantity, price, size)
          VALUES ?
        `;
        const detailValues = orderDetailsData.map((detail) => [
          orderId,
          detail.product_id,
          detail.quantity,
          detail.price,
          detail.size || null,
        ]);

        console.log("Executing INSERT order_details:", detailSql, detailValues);

        connection.query(detailSql, [detailValues], (err, detailResult) => {
          if (err) {
            console.error("Error inserting order_details:", err);
            connection.rollback(() => {
              connection.release();
              return callback(err);
            });
            return;
          }

          connection.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              connection.rollback(() => {
                connection.release();
                return callback(err);
              });
              return;
            }

            connection.release();
            console.log("Transaction successful, order_id:", orderId);
            callback(null, { order_id: orderId, details: detailResult });
          });
        });
      });
    });
  });
};

module.exports = orders;