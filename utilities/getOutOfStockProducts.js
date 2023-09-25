import fetch from "node-fetch";
import Product from "../models/Product.js";
/*
    FETCH THE PRODUCTS FROM ARDUNIC API
    CHECK THE STOCK THEN CHECK DUPLICATE
    RETURN THE OUT OF STOCK PRODUCTS
*/
const getOutOfStockProducts = async () => {
    try {
        const ARDUNIC_API_URL = "https://api.ardunic.com/v1/products?s=300000";
        const productsRes = await fetch(ARDUNIC_API_URL);
        const { data } = await productsRes.json();
<<<<<<< HEAD
        const filtered = data.filter(product =>product.stock < 1);
        const slugs =  filtered.map(product => product.slug);
=======
        const filteredProducts = data.filter(product => product.stock < 1);
        const slugs = filteredProducts.map(product => product.slug);
>>>>>>> f770beb6a78f18db80c153f34b1c484c2c46cf84
        const outOfStockProducts = [];
        for (let i = 0; i < filteredProducts.length; i++) {
            const slug = slugs[i];
            let emptyTypes = "";
            const product = await fetch(`https://api.ardunic.com/v1/product/${slug}`);
            const { data } = await product.json();
<<<<<<< HEAD
            const isDuplicate = await Product.findOne({ title: data.title });
            if (!isDuplicate) {
                //PRODUCT WITH TYPES
=======
            const isDup = await Product.findOne({ title: data.title });
            let emptyTypes = "";
            if (!isDup) {
>>>>>>> f770beb6a78f18db80c153f34b1c484c2c46cf84
                if (data.types.length > 0) {
                    data.types.forEach(type => {
                        if (type.stock < 1) emptyTypes = emptyTypes + ` \n ${type.value}`;
                    })
                    if (emptyTypes) {
                        outOfStockProducts.push({
                            title: data.title,
                            emptyTypes,
                            image: `https://ardunic-images.s3.eu-central-1.amazonaws.com/${data.images[0]}`,
                        })
                    }
<<<<<<< HEAD
                }
                //PRODUCT WITH NO TYPES
                else {
=======
                } else {
>>>>>>> f770beb6a78f18db80c153f34b1c484c2c46cf84
                    outOfStockProducts.push({
                        title: data.title,
                        image: `https://ardunic-images.s3.eu-central-1.amazonaws.com/${data.images[0]}`,
                    });
                }
            }
        }
<<<<<<< HEAD
        await Product.deleteMany({isOrdered:true, title:{$nin:outOfStockProducts.map(p => p.title)}})
=======
>>>>>>> f770beb6a78f18db80c153f34b1c484c2c46cf84
        return outOfStockProducts
    } catch (err) {
        console.log(err);
    }
};
export default getOutOfStockProducts


