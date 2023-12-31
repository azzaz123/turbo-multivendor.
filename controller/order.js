const fs = require("fs");
const conversation = require("../models/conversation");
const order = require("../models/order");
const Product = require("../models/product");
var crypto = require("crypto");
const support = require("../models/support");
const cart = require("../models/addtocart");
exports.createcart = async (req, res) => {
  try {
    const { product, quantity, amount, subtotal, total } = req.body;
    if (!(product && quantity && subtotal && amount && total)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      req.body.user = req.user._id;
      const Cart = new cart(req.body);
      Cart.save().then((item) => {
        res
          .status(200)
          .send({
            message: "Product is successfully add",
            success: true,
            data: item,
          });
      });
    }
  } catch (err) {
    
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.updatecart = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await cart.findOne({ user: req.user._id, _id: id });
    if (!data) {
      res.status(200).send({ message: "Invalid id", success: false });
    } else {
      cart.updateOne({ _id: id }, req.body, (err, result) => {
        
        if (result) {
          res
            .status(200)
            .send({ message: "Data updated Successfully", success: true });
        } else {
          res.status(200).send({ message: "Error Occured", success: false });
        }
      });
    }
 
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getcart = async (req, res) => {
  try {
    const data = await cart.find({ user: req.user._id });
    res
      .status(200)
      .send({
        message: "Cart data fetch successfully",
        success: true,
        data: data,
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createorder = async (req, res) => {
  try {
    const { customer, product, quantity } = req.body;
    if (!(customer && product)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      Product.findOne({ _id: product }, (err, result) => {
        if (result?.stock < quantity) {
          res.status(200).send({
            message: "Cannot order more then stock",

            success: false,
          });
        } else {
          Product.updateOne(
            { _id: product },
            { $inc: { stock: -quantity, "metrics.orders": 1 } },
            (err, updated) => {
              if (err) {
                res.status(200).json({
                  success: false,
                  message: err.message,
                });
              } else {
                req.body.orderid =
                  "ORD" + crypto.randomBytes(4).toString("hex");
                  if(req.file){

                    req.body.file = req.file.filename;
                  }
                const Order = new order(req.body);
                Order.save().then(async (item) => {
                  res.status(200).send({
                    message: "Thank you for your order",
                    data: item,
                    success: true,
                  });
                });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getorder = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const data = await order
      .find(req.query)
      .populate("product")
      .populate("customer")
      .populate("driver")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    if (data.length == 0) {
      res.status(200).send({ message: "Data Not Exist", success: false });
    } else {
      res.status(200).send({
        message: "Data get Successfully",
        success: true,
        data: data,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.updateorder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      order.findOne({ _id: id }, async (err, result) => {
        if (!result) {
          res.status(200).send({ message: "No Data Exist", success: false });
        } else {
          if (req.file) {
            await unlinkAsync(`uploads/order/` + result.file);
            req.body.file = req.file.filename;
          }
          if (req.body?.quantity) {
            const product = await Product.findOne({ _id: result.product });

            if (product.stock + result.quantity > req.body.quantity) {
              product.stock =
                product.stock + result.quantity - req.body.quantity;
              const updateproduct = await Product.updateOne(
                { _id: result.product },
                { stock: product.stock }
              );
              order.updateOne({ _id: id }, req.body, (err, result) => {
                if (err) {
                  res
                    .status(200)
                    .send({ message: err.message, success: false });
                } else {
                  res.status(200).send({
                    message: "Data updated Successfully",
                    success: true,
                    data: result,
                  });
                }
              });
            } else {
              res.status(200).send({
                message: "required quantity is exceed the stock of product",
                success: false,
              });
            }
          } else {
            order.updateOne({ _id: id }, req.body, (err, result) => {
              if (err) {
                res.status(200).send({ message: err.message, success: false });
              } else {
                res.status(200).send({
                  message: "Data updated Successfully",
                  success: true,
                  data: result,
                });
              }
            });
          }
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.deleteorder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      order.findOne({ _id: id }, async (err, result) => {
        if (result) {
          if (result.status != "On hold") {
            res.status(200).json({
              message: "Order cannot be cancelled",
              success: false,
            });
          } else {
            order.deleteOne({ _id: id }, (err, val) => {
              if (!val) {
                res.status(200).send({ message: err.message, success: false });
              } else {
                res.status(200).send({
                  message: "Data deleted Successfully",
                  success: true,
                });
              }
            });
          }
        } else {
          res.status(200).send({ message: "Order Not exist", success: false });
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.rejectorder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(200).send({ message: "id is not specify", success: false });
    } else {
      order.findOne({ _id: id }, async (err, result) => {
        if (result) {
          if (result.status != "On hold") {
            res.status(200).json({
              message: "Order cannot be cancelled",
              success: false,
            });
          } else {
            order.updateOne(
              { _id: id },
              { reason: req.body.reason, status: "rejected" },
              (err, val) => {
                if (!val) {
                  res
                    .status(200)
                    .send({ message: err.message, success: false });
                } else {
                  res.status(200).send({
                    message: "order Cancelled Successfully",
                    success: true,
                  });
                }
              }
            );
          }
        } else {
          res.status(200).end({ message: "order Not exist", success: false });
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.assignorder = async (req, res) => {
  try {
    const { id } = req.params;
    order.findOne({ _id: id }, async (err, result) => {
      if (result) {
        if (result.status != "On hold") {
          res.status(200).json({
            success: false,
            message: "Order cannot be assigned",
          });
        } else {
          order.updateOne(
            { _id: id },
            {
              driver: req.body._id || req.user._id,
              status: "Processing",
              pickuptime: new Date(),
            },
            async (err, value) => {
              if (value) {
                const Conversation = new conversation({
                  members: [req.body._id || req.user._id, result.customer],
                });
                await Conversation.save();
                res.status(200).json({
                  success: true,
                  message: "Order is Successfully assign for delivering",
                });
              } else {
                res.status(200).json({
                  success: false,
                  message: err.message,
                });
              }
            }
          );
        }
      } else {
        res.status(200).end({ message: "order Not exist", success: false });
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.deliveredorder = async (req, res) => {
  try {
    const { id } = req.params;
    order.findOne({ _id: id }, async (err, result) => {
      if (result) {
        if (result.status != "Processing") {
          res.status(200).json({
            success: false,
            message: "Order cannot be deliverd",
          });
        } else {
          order.updateOne(
            { _id: id },
            { status: "pending payment", dropofftime: new Date() },
            async (err, value) => {
              if (value) {
                res.status(200).json({
                  success: true,
                  message: "Product is Successfully Delivered",
                });
              } else {
                res.status(200).json({
                  success: false,
                  message: err.message,
                });
              }
            }
          );
        }
      } else {
        res.status(200).end({ message: "order Not exist", success: false });
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.completedorder = async (req, res) => {
  try {
    const { id } = req.params;
    order.findOne({ _id: id }, async (err, result) => {
      if (result) {
        if (result.status != "pending payment") {
          res.status(200).json({
            success: false,
            message: "Order cannot be Completed",
          });
        } else {
          order.updateOne(
            { _id: id },
            { status: "completed", distance: req.body.distance },
            async (err, value) => {
              if (value) {
                res.status(200).json({
                  success: true,
                  message: "Delivering process is Successfully completed",
                });
              } else {
                res.status(200).json({
                  success: false,
                  message: err.message,
                });
              }
            }
          );
        }
      } else {
        res.status(200).end({ message: "order Not exist", success: false });
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.driverreview = async (req, res) => {
  try {
    const { id } = req.params;
    order.findOne({ _id: id }, async (err, result) => {
      if (result) {
        if (result.status != "completed") {
          res.status(200).json({
            success: false,
            message: "You cannot rate driver before Complition of order",
          });
        } else {
          order.updateOne(
            { _id: id },
            { star: req.body.star },
            async (err, value) => {
              if (value) {
                res.status(200).json({
                  success: true,
                  message: "Thank you for your Reviews ",
                });
              } else {
                res.status(200).json({
                  success: false,
                  message: err.message,
                });
              }
            }
          );
        }
      } else {
        res.status(200).end({ message: "order Not exist", success: false });
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createsupport = async (req, res) => {
  try {
    const { category, priority, product, issue, order } = req.body;
    if (!(category && priority && product && issue && order)) {
      res
        .status(200)
        .send({ message: "All input is required", success: false });
    } else {
      support.findOne({ user: req.user._id, order: order }, (err, result) => {
        if (result) {
          res.status(200).json({
            success: false,
            message: "You already take support tick on behalf of this order",
          });
        } else {
          req.body.user = req.user._id;
          const Support = new support(req.body);
          Support.save().then((item) => {
            res.status(200).send({
              message: "You support ticket is issued",
              success: true,
              data: item,
            });
          });
        }
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getsupport = async (req, res) => {
  try {
    Object.assign(req.query, { user: req.user._id });
    const data = await support.find(req.query);
    res.status(200).json({
      success: true,
      message: "Support get Successfully",
      data: data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
