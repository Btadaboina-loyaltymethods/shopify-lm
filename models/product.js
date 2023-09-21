const mongoose = require("mongoose");

const getDb = require("../util/database").getDb;
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

productSchema.statics.fetchAll = function (next) {
  const db = getDb();
  return db
    .collection("products")
    .find()
    .toArray()
    .then((products) => {
      console.log(products);
      return products;
    })
    .catch((err) => {
      next(err);
    });
};
productSchema.statics.findById = function (prodId) {
  const db = getDb();
  return db
    .collection("products")
    .find({ _id: new ObjectId(prodId) })
    .next()
    .then((product) => {
      console.log(product);
      return product;
    })
    .catch((err) => {
      console.log(err);
    });
};

productSchema.statics.deleteById = function (prodId) {
  const db = getDb();
  return db
    .collection("products")
    .deleteOne({ _id: new ObjectId(prodId) })
    .then((result) => {
      console.log("Deleted");
    })
    .catch((err) => {
      console.log(err);
    });
};
// productSchema.methods.saveProduct = function () {
//   const db = getDb();
//   let dbOp;
//   if (this._id) {
//     // Update the product
//     dbOp = db
//       .collection("products")
//       .updateOne({ _id: this._id }, { $set: this });
//   } else {
//     dbOp = db.collection("products").insertOne(this);
//   }
//   return dbOp
//     .then((result) => {
//       console.log(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
module.exports = mongoose.model("Product", productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         console.log(product);
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(result => {
//         console.log('Deleted');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;
