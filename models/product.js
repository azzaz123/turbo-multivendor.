const mongoose = require("mongoose");
const product = mongoose.Schema(
  {
    regular_price: { type: Number },
    sale_price: { type: Number },
    sale_start: { type: Date },
    sale_end: { type: Date },
    
    tax_status: { type: String, enum: ["taxable", "shipping only", "none"] },
    tax_class: {
      type: String,
      enum: ["standard", "zero rate", "reduced rate"],
    },
    free_shipping:{type:Boolean, default:false},
    product_type: { type: String, enum: ["simple", "group", "variable"] },
    // attribute: [{ type: mongoose.Schema.Types.ObjectId, ref: "attribute" }],

    SKU: {
      type: String,
    },
    availability: { type: Date },
    stock: { type: Number },
    shipping_class: { type: String, enum: ["delivery on same day", "none"] },
    weight: { type: Number },
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    upsells: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    crosssells: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    variation: [],
    note: {
      type: String,
    },
    ISBN: {
      type: String,
    },

    review: { type: Boolean },
    video: {
      type: String,
    },
    customize: [],
    title: {
      type: String,
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "brand" },
    tags:[ {
      type: mongoose.Schema.Types.ObjectId, ref: "tags"
    }],
    short_description: { type: String },
    long_description: { type: String },


    subcategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "subcategory" }],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "category" }],
    brands: { type: mongoose.Schema.Types.ObjectId, ref: "brand" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "store" },
    collection_name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
    },
    commision_mode: { type: String, enum: ["percent", "fixed"] },
    commision: { type: Number },

    status: {
      type: String,
      default: "pending",
      enum: ["draft", "pending", "published", "archived"],
    },
    is_approved: { type: Boolean, default: false },

    warranty: { type: String },

    image: [
      {
        type: String,
      },
    ],
    
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", product);
