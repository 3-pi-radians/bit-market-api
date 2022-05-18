const express = require("express");
const cors = require("cors");
require('dotenv').config({ path: './.env' });
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const {
    registerUser,
    logUserIn,
    getUserAddressList,
    getUserData,
    removeUserAddress,
    saveUserAddress,
    addItemToCart,
    syncUserCart,
    removeItemFromCart,
    changeItemCount,
    emptyCart,
    modifyUserDetails,
    editUserAddress
} = require("./db_file");
const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/",  (req, res) => res.status(200).send("Welcome to bit market"));

app.post("/checkout/create", async (req, res) => {
    const total = req.query.total;
    console.log(total);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd"
    });

    res.status(201).send({
        clientSecret: paymentIntent.client_secret
    })
});

app.post("/auth/register", (req, res) => {
    const { email , phone, password, name} = req.body;
    const result = registerUser({email, phone, password, name});
    res.send(result);

});

app.post("/auth/login", (req, res) => {
    const { email, password} = req.body;
    const result = logUserIn({email, password});
    res.send(result);
});

app.post("/user/save-user-address", (req, res) => {
    const {id, address} = req.body;
    const result = saveUserAddress({id, address});
    res.send(result);
});

app.put("/user/modify-details", (req, res) => {
    const {id, userData} = req.body;
    const result = modifyUserDetails({id, userData});
    res.send(result);
});

app.post("/user/remove-user-address", (req, res) => {
    const {userId, addressId} = req.body;
    const result = removeUserAddress({userId, addressId});
    res.send(result);
});
app.post("/user/edit-user-address", (req, res) => {
    const {id, address} = req.body;
    const result = editUserAddress({id, address});
    res.send(result);
});
app.post("/user/cart/add-item", (req, res) => {
    const {userId, item} = req.body;
    const result = addItemToCart({userId, item});
    res.send(result);
});

app.post("/user/cart/remove-item", (req, res) => {
    const {userId, productId} = req.body;
    const result = removeItemFromCart({userId, productId});
    res.send(result);
});

app.post("/user/cart/sync-cartitems", (req, res) => {
    const {userId, cartItems} = req.body;
    const result = syncUserCart({userId, cartItems});
    res.send(result);
});

app.put("/user/cart/change-itemcount", (req, res) => {
    const {userId, productId, changeBy} = req.body;
    const result = changeItemCount({userId, productId, changeBy});
    res.send(result);
});

app.post("/user/cart/empty-cart", (req, res) => {
    const {userId} = req.body;
    const result = emptyCart({userId});
    res.send(result);
});

// app.post("/user/place-order", (req, res) => {
//     const {userId, cartItems} = req.body;
//     const result = placeOrder({userId, cartItems});
//     res.send(result);
// })
app.listen(PORT, () => {
    console.log("App running on port", PORT);
});

//http://localhost:5001/bit-market-f5569/us-central1/api).f