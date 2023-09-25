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
<<<<<<< HEAD
    isOrdered:{
        type:Boolean,
        default:false,
    }
=======
>>>>>>> f770beb6a78f18db80c153f34b1c484c2c46cf84
});
const Product = new mongoose.model("products", Schema);
export default Product