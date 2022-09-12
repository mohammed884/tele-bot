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
            const isDup = await Product.findOne({ title: product.title });
            if (!isDup) {
                if (product.types && product.types.length > 0) {
                    console.log("Product with types");
                    let emptyTypes = "";
                    product.types.forEach(type => {
                        if (type.stock < 1) emptyTypes += `\n ${type.value}`;
                    })
                    outOfStockProducts.push({
                        title: product.title,
                        emptyTypes,
                        image: `https://ardunic-images.s3.eu-central-1.amazonaws.com/${product.images[0]}`,
                    })
                }
                else if (product.stock < 1) {
                    outOfStockProducts.push({
                        title: product.title,
                        image: `https://ardunic-images.s3.eu-central-1.amazonaws.com/${product.images[0]}`
                    })
                }
            }
        }
        return outOfStockProducts
    } catch (err) {
        console.log(err);
    }
};
export default getOutOfStockProducts