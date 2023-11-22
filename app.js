require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const sg = require("@sendgrid/mail");
sg.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = 8080;
const db = mongoose.connect(process.env.URI, { useNewUrlParser: true });
const model = require("./models/order-model");
const orderModel = require("./models/order-model");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Static file path
app.use(express.static(__dirname + "/public"));
//Html path
app.set("views", "./views");
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.debug(`Server Listening at port : ${PORT} `);
});

//set route
app.get("/", (req, res) => {
  res.send("Welcome to Order Management and Status App !");
});

app.get("/order/entry", (req, res) => {
  res.render("order");
});

app.post("/order/create", (req, res) => {
  let { body } = req;
  let orderData = { ...body, order_date: new Date() };
//   console.log(orderData);
  orderModel.create(orderData).then((result, err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      //console.log(data)
      res.send(`Inserted ... ${result} `);
    }
  });
});

let getOrderStatus = new Promise((resolve, reject) => {
  orderModel.find({}).then((data, err) => {
    if (err) {
    //   console.dir(err);
      reject(err);
    } else {
      const currentDate = Date.now();
      let orderData = data.map((row) => {
        let orderdate = Number(row["order_date"]);
        let sec = (currentDate - orderdate) / 1000;
        if (sec < 86400) {
          order_status = "In Progess";
        } else if (sec > 172800) {
          order_status = "Delivered";
        } else {
          order_status = "Dispatched";
        }

        //console.log(d0)
        const d = new Date(row["order_date"]).toLocaleDateString();
        // console.log(d);
        row["order_date"] = d;
        row["order_status"] = order_status;
        return row;
      });
    //   console.log("orders ==> ", orderData);

      //binding result to data to be used in OrderStatus.ejs
      resolve(orderData);
    }
  });
});

app.get("/order/dashboard", async (req, res) => {
  getOrderStatus
    .then((data) => {
      res.render("order-status", { data });
    })
    .catch((err) => res.status(500).send(err));
  
});
app.get("/sendEmail/:email", (req, res) => {
  const email = req.params.email;
//   console.log("email ==> ", email);
  getOrderStatus
    .then((orders) => {
      const contentText = JSON.stringify(orders, null, 4);
      const contentHtml = "<div><h3>" + contentText + "</h3></div>";
      const msg = {
        to: email,
        from: "tailu@ie-sd.com",
        subject: "Your Order Status",
        text: contentText,
        html: contentHtml,
      };
      sgMail.send(msg);
      //console.log("msg ==> ", msg)
      res.send("Email sent to " + email);
    })
    .catch((err) => res.status(500).send(err));
});
