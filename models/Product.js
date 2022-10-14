import mongoose from "mongoose";
const Schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    messageId: {
        type: Number,
        required: true,
    },
    ordered:{
        type:Boolean,
        default:false,
    }
});
const Product = new mongoose.model("products", Schema);
export default Product