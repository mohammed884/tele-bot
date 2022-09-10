import mongoose  from "mongoose";
const Schema = mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    message_id:{
        type:Number,
        required:true,
    }
});
const Product = new mongoose.model("products", Schema);
export default Product