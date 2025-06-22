import mongoose from "mongoose";

await mongoose.connect("mongodb://127.0.0.1:27017/orderDB", { 

});
const cakeSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    price: Number,
    image_url: String,
    category: String
});

const Cake = mongoose.model("Cake", cakeSchema);

const weddingCakes = [
    {
        id: "bc1",
        name: "Classic Birthday Cake",
        description: "Traditional vanilla cake with colorful buttercream",
        price: 290.99,
        image_url: "/assets/birthday1.png",
        category: "birthday_cakes"
    },
    {
        id: "bc2",
        name: "Chocolate Explosion Cake",
        description: "Rich chocolate cake with multiple chocolate layers",
        price: 340.99,
        image_url: "/assets/birthday2.png",
        category: "birthday_cakes"
    },

{        id: "w1",

        name: "Classic White Tiered Cake",
        description: "Elegant three-tier white wedding cake with delicate piping",
        price: 249.99,
        image_url: "/assets/wedding1.png",
        category: "wedding_cakes"
    },
    {
        id: "w2",
        name: "Romantic Rose Cake",
        description: "Blush pink cake adorned with sugar roses and gold accents",
        price: 279.99,
        image_url: "/assets/wedding2.png",
        category: "wedding_cakes"
    }
];

Cake.insertMany(weddingCakes)
    .then(() => {
        console.log("Wedding cakes inserted successfully!");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Error inserting wedding cakes:", err);
        mongoose.connection.close();
    });
