const db = require("../config/db");

/* exports.getSlicerData = async () => {
  const products = await db.query("SELECT DISTINCT product_name FROM sales.tsales ORDER BY product_name");
  return { products: products.rows };
}; */

exports.getSlicerData = async (slicer) => {
    // Get slicer definition from the database
    const slicerQuery = `select key, val from sales.slicers where category = $1;`;
    const slicerResult = await db.query(slicerQuery, [slicer]);
 
    if (slicerResult.rows.length === 0) {
        throw new Error("Invalid slicer type");
    }

    return slicerResult.rows.map(row => ({ key: row.key, value: row.val }));
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
