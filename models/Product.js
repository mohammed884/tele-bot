import mongoose from "mongoose";
const Schema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true,
    },
    message_id: {
        type: Number,
        required: true,
        index: true,
    }
});
const Product = new mongoose.model("products", Schema);
export default Product