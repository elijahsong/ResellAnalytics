/*ADVANCED QUERIES*/
SELECT SKU, COUNT(id) as total_sold
FROM Inventory I NATURAL JOIN Sales S
WHERE I.status LIKE 'Sale complete%' 
  /* only picks shoes that have been sold */
GROUP BY SKU
ORDER BY total_sold DESC
LIMIT 15;

DELIMITER //

CREATE TRIGGER SaleTrig 
  AFTER UPDATE ON Sales
    FOR EACH ROW
  BEGIN
    IF new.Price IS NOT NULL THEN
      UPDATE Inventory
      SET status = 'Sale complete'
      WHERE inventory_id = new.sales_id;
    END IF;
  END;
//

DELIMITER ;


/*INSERT*/
INSERT INTO Purchases(date, price, method, payment_type)
VALUES (date, price, method, payment_type);

var purchase_date = req.body.date;
var price = req.body.price;
var method = req.body.method;
var payment_type = req.body.payment_type;
var sql = `INSERT INTO Purchases(date, price, method, payment_type) VALUES('${purchase_date}', ${price}, '${method}', '${payment_type}')`;

INSERT INTO Inventory(inventory_id)
SELECT LAST_INSERT_ID();

var sql = `INSERT INTO Inventory(inventory_id) SELECT LAST_INSERT_ID()`;

UPDATE Inventory
SET SKU=SKU, size=size, status=status
WHERE inventory_id = (SELECT LAST_INSERT_ID());

var SKU = req.body.SKU;
var size = req.body.size;
var shoe_status = req.body.status;
var sql = `UPDATE Inventory SET SKU='${SKU}', size='${size}', status='${shoe_status}' WHERE inventory_id = (SELECT LAST_INSERT_ID())`;

INSERT INTO Inventory(inventory_id)
SELECT LAST_INSERT_ID();

var sql = `INSERT INTO Sales(sales_id) VALUES(${last_id})`;

/*DELETE*/
DELETE FROM Inventory
WHERE inventory_id = /*given*/ id

var id = req.body.id;
var sql = `DELETE FROM Inventory WHERE inventory_id = ${id}`;

DELETE FROM Sales
WHERE sales_id = /*given*/ id

var id = req.body.id;
var sql = `DELETE FROM Sales WHERE sales_id = ${id}`;

DELETE FROM Purchases
WHERE id = /*given*/ id

var id = req.body.id;
var sql = `DELETE FROM Purchases WHERE id = '${id}'`;


/*UPDATE*/
UPDATE Sales
SET date = date, price = price, extra_fees = extra_fees, method = method, payment_type = payment_type
WHERE sales_id = id;

var id = req.body.id
var sales_date = req.body.date
var price = req.body.price
var extra_fees = req.body.price.extra_fees
var method = req.body.method
var payment_type = req.body.payment_type
var sql = `UPDATE Sales SET date='${sales_date}'. price=${price}, extra_fees=${extra_fees}, method='${method}', payment_type='${payment_type}' WHERE sales_id=${id}`;
