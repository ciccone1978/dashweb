const db = require("../config/db");

exports.getSlicerData = async () => {
  const products = await db.query("SELECT DISTINCT product_name FROM sales.tsales ORDER BY product_name");
  return { products: products.rows };
};

exports.getReportData = async (startDate, endDate, product) => {
  const query = `
    SELECT to_char(ddate, 'YYYY-MM-DD') as date, product_name, quantity, total_price
    FROM sales.tsales
    WHERE ddate BETWEEN $1 AND $2
    ${product ? "AND product_name = $3" : ""}
    ORDER BY ddate;
  `;
  
  const params = product ? [startDate, endDate, product] : [startDate, endDate];
  const result = await db.query(query, params);
  
  return result.rows;
};
