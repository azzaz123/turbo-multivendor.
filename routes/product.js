const express = require("express");
const Router = express.Router();
const product = require("../controller/product");
const { verifyadmintoken, verifybuyertoken,verifytoken } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/product/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });
const router = () => {
  Router.post("/", upload.array("file"), product.createProduct);
  Router.get("/:method", product.getProduct);
  Router.get("/", product.getProduct);

  

  Router.patch("/:id", upload.array("file"),verifytoken,  product.updateProduct);
  Router.delete("/:id", verifytoken,product.deleteProduct);
  Router.patch('/publish/:id',verifytoken, product.publishProduct)
  
  ///comment
  Router.post('/comment',product.createcomment)
  Router.get('/comment',product.getcomment)
  Router.patch('/comment/:id',product.updatecomment)
  Router.delete('/comment/:id',product.deletecomment)

  ///like
  Router.post('/wishlist',verifybuyertoken,product.createwishlist)
  Router.get('/wishlist',verifybuyertoken,product.getwishlist)
  // Router.patch('/like/:id',product.updatelike)
  // Router.delete('/like/:id',product.deletelike)


//tags
Router.post("/tags",product.createtags)
Router.get("/tags",product.gettags)
Router.patch("/tags",product.updatetags)
Router.delete("/tags",product.deletetags)




  return Router;
};
module.exports = router();
