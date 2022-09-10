import fetch from "node-fetch";
import Product from "../models/Product.js";
/*
    FETCH THE PRODUCTS FROM ARDUNIC API
    CHECK THE STOCK THEN CHECK DUPLICATE
    RETURN THE OUT OF STOCK PRODUCTS
*/
const getOutOfStockProducts = async () => {
    try {
        const ARDUNIC_API_URL = "https://api.ardunic.com/v1/products?s=300000"
        const res = await fetch(ARDUNIC_API_URL);
        const { data } = await res.json();
        const outOfStockProducts = []
        for (let i = 0; i < data.length; i++) {
            const product = data[i];
            if (product.stock < 1) {
                const isDup = await Product.findOne({ title: product.title });
                if (!isDup) outOfStockProducts.push({
                    title: product.title,
                    image: `https://ardunic-images.s3.eu-central-1.amazonaws.com/${product.images[0]}`
                })
            }
        }
        return outOfStockProducts
    } catch (err) {
        console.log(err);
    }
};
export default getOutOfStockProducts