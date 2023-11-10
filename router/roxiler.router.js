import express from "express";
import { client } from "../index.js";
const router = express.Router();

//post data in database
router.post("/initialize-database", async function (request, response) {
  const data = request.body;
  const result = await client
    .db("Roxiler")
    .collection("Product")
    .insertMany(data);

  result
    ? response.send({ message: "database post is successful" })
    : response.status(404).send({ message: "database is not" });
});

//get data in database
router.get("/get-database/:month", async function (request, response) {
  let getmonth = request.params.month;
  let month = 0;
  if (getmonth === "January") {
    month = 1;
  } else if (getmonth === "February") {
    month = 2;
  } else if (getmonth === "March") {
    month = 3;
  } else if (getmonth === "April") {
    month = 4;
  } else if (getmonth === "May") {
    month = 5;
  } else if (getmonth === "June") {
    month = 6;
  } else if (getmonth === "July") {
    month = 7;
  } else if (getmonth === "August") {
    month = 8;
  } else if (getmonth === "September") {
    month = 9;
  } else if (getmonth === "October") {
    month = 10;
  } else if (getmonth === "November") {
    month = 11;
  } else if (getmonth === "December") {
    month = 12;
  }
  console.log(month);
  const query = {};
  const result = await client
    .db("Roxiler")
    .collection("Product")
    .find({ $expr: { $eq: [{ $month: "$dateOfSale" }, month] } })
    .toArray();
  result
    ? response.send(result)
    : response.status(404).send({ message: " database is not" });
});

// delete data in database
router.delete("/delete-database", async function (request, response) {
  const data = request.query;

  const result = await client
    .db("Roxiler")
    .collection("Product")
    .deleteMany(data);
  result.deletedCount >= 1
    ? response.send({ message: "delete database is successful" })
    : response.status(404).send({ message: "database is not" });
});

//page list in database
router.get("/list-transactions", async function (request, response) {
  const { page = 1, perPage = 10, search } = request.query;
  const query = search
    ? {
        $or: [
          { productTitle: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { price: parseFloat(search) || 0 },
        ],
      }
    : {};
  const result = await client
    .db("Roxiler")
    .collection("Product")
    .find(query)
    .skip((page - 1) * perPage)
    .limit(perPage);
  result
    ? response.send(result)
    : response.status(404).send({ message: " database is not" });
});

// get data in statistics
router.get("/statistics", async function (request, response) {
  const { month } = request.query;
  const totalSaleAmount = await client
    .db("Roxiler")
    .collection("Product")
    .aggregate([
      { $match: { dateOfSale: { $regex: new RegExp(month, "i") } } },
      { $group: { _id: null, totalAmount: { $sum: "$price" } } },
    ]);
  const totalSoldItems = await client
    .db("Roxiler")
    .collection("Product")
    .countDocuments({
      dateOfSale: { $regex: new RegExp(month, "i") },
    });

  const totalNotSoldItems = await client
    .db("Roxiler")
    .collection("Product")
    .countDocuments({
      dateOfSale: { $regex: new RegExp(month, "i") },
      sold: false,
    });

  response.status(200).json({
    totalSaleAmount:
      totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
    totalSoldItems,
    totalNotSoldItems,
  });
});

//get bar-chart
router.get("/bar-chart/:month", async function (request, response) {
  let getmonth = request.params.month;
  let month = 0;
  if (getmonth === "January") {
    month = 1;
  } else if (getmonth === "February") {
    month = 2;
  } else if (getmonth === "March") {
    month = 3;
  } else if (getmonth === "April") {
    month = 4;
  } else if (getmonth === "May") {
    month = 5;
  } else if (getmonth === "June") {
    month = 6;
  } else if (getmonth === "July") {
    month = 7;
  } else if (getmonth === "August") {
    month = 8;
  } else if (getmonth === "September") {
    month = 9;
  } else if (getmonth === "October") {
    month = 10;
  } else if (getmonth === "November") {
    month = 11;
  } else if (getmonth === "December") {
    month = 12;
  }

  const priceRanges = [
    { range: "0 - 100", min: 0, max: 100 },
    { range: "101 - 200", min: 101, max: 200 },
    { range: "201 - 300", min: 201, max: 300 },
    { range: "301 - 400", min: 301, max: 400 },
    { range: "401 - 500", min: 401, max: 500 },
    { range: "501- 600", min: 501, max: 600 },
    { range: "601 - 700", min: 601, max: 700 },
    { range: "701 - 800", min: 701, max: 800 },
    { range: "801 - 900", min: 801, max: 900 },
    { range: "901 - 1000", min: 901, max: 1000 },
  ];

  const result = {};

  for (const range of priceRanges) {
    const count = await client
      .db("Roxiler")
      .collection("Product")
      .countDocuments({
        $expr: { $eq: [{ $month: "$dateOfSale" }, month] },
        price: { $gte: range.min, $lte: range.max },
      });
    result[range.range] = count;
  }

  response.status(200).json({ message: `${getmonth}`, result });
});

//get pie-chart
router.get("/pie-chart", async function (request, response) {
  const { month } = request.query;
  const categories = await client
    .db("Roxiler")
    .collection("Product")
    .distinct("category", {
      dateOfSale: { $regex: new RegExp(month, "i") },
    });

  const result = {};

  for (const category of categories) {
    const count = await client
      .db("Roxiler")
      .collection("Product")
      .countDocuments({
        dateOfSale: { $regex: new RegExp(month, "i") },
        category,
      });
    result[category] = count;
  }

  response.status(200).json(result);
});

export default router;
