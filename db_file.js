const { v4 } = require("uuid");
let users = [];
let cart = {};

const filterResponse = (data) => {
    let response = {};
    for (const [key, value] of Object.entries(data)) {
        if (key !== "password") response[key] = value;
    }

    return response;
}

const registerUser = (newUser) => {
    let response = {
        status:  "ok",
        message: "",
        payload: {}
    }
    console.log("new User", newUser);
    for (let idx = 0; idx < users.length; idx++) {
        let user = users[idx];
        if (user.email === newUser.email) {
            response.status="error",
            response.message = `User with email ${user.email} is already registered`;
            break;
        } else if (user.phone === newUser.phone) {
            response.status = "error";
            response.message = `User with mobile ${user.phone} is already registered`; 
          break;
        }
    }
    if (response.status === "error") {
        return response;
    }

    const userId = v4();
    let user = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        addresses: [],
        password: newUser.password,
        phone: newUser.phone,
    }
    users.push(user);
    response.message="user created successfully";
    response.payload={
        id: userId,
        name: user.name,
        email: user.email,
        addresses: user.addresses,
        phone: user.phone
    };
    console.log("users", users);
    return response;
}

const getUserData = ({id}) => {
    let userData = users.filter(user => user.id === id);
    let response = {
        status: "ok",
        messsage: "user data retrieved successfully",
        payload: filterResponse(userData)
    }
    return response;
}
const logUserIn = ({email, password}) => {
    let userFound = false;
    let userData = {};
    users.forEach((user) => {
        if (user.email === email && user.password === password) {
            userFound = true;
            userData = user;
        }
    });

    if (!userFound) {
        let response = {
            status: "error",
            message: "Invalid email or password",
            payload: {}
        } 
        return response;
    } else {
        let response = {
            status: "ok",
            messsage: "Logged In successfully",
            payload: filterResponse(userData)
        }

        return response;
    }
}
const modifyUserDetails = ({id, userData}) => {
    try {
        let index = 0;
        for (let idx = 0; idx < users.length; idx++) {
            if (users[idx].id == id) {
                index = idx;
                users[idx] = {...users[idx], ...userData};
                break;
            }
        }
        return {
            status: "ok",
            message: "Field updated successfully",
            payload: filterResponse(users[index])
        }
    } catch (error) {
        return {
            status: "error",
            message: "Error in updating the field",
            payload: filterResponse(users[index])
        }
    }
}
const saveUserAddress = ({id, address}) => {
    try {
        let index = 0;
        users.forEach((user, idx) => {
        if (user.id === id) {
            index = idx;
        }
    });

    users[index]?.addresses.push(address);

    let response = {
        status: "ok",
        messsage: "User Address added successfully",
        payload: users[index]?.addresses
    };
    return response;
    } catch (error) {
        return {
            status: "error",
            messsage: "Error in adding address",
            payload: error.message
        };
    }
}
const editUserAddress = ({id, address}) => {
    try {
        let response = {
            status: "",
            message: "",
            payload: ""
        };

        for (let idx = 0; idx < users.length; idx++) {
            if (users[idx].id === id) {
                const addresses = users[idx].addresses;
                for (let j = 0; j < addresses.length; j++) {
                    if (addresses[j].id === address.id) {
                        for (const [key] of Object.entries(addresses[j])) {
                            users[idx].addresses[j][key] = address[key];
                        }
                        response.status = "ok";
                        response.message = "Address Changed successfully";
                        response.payload = users[idx].addresses[j];
                        break;
                    }
                }
            }
        }

        return response;
    } catch (error) {
        return {
            status: "error",
            message: "Error occured in changing user address",
            payload: error.message
        }
    }
}
const removeUserAddress = ({userId, addressId}) => {
    let id = userId;
    for (let idx = 0; idx < users.length; idx++) {
        if (users[idx].id === id) {
          let addresses = users[idx].addresses.filter(address => address.id !== addressId);
          users[idx].addresses = addresses;

          let response = {
              status: "ok",
              message: "Address removed successfully",
              payload: filterResponse(users[idx])
          }
          console.log(response);
          return response;
        }
    }
}

const getUserAddressList = ({id}) => {
    for (let idx = 0; idx < users.length; idx++) {
        if (id === users[idx].id) {
            let addresses = users[idx].addresses;
            let response = {
                status: "ok",
                message: "Address retrieved successfully",
                payload: addresses
            }
  
            return response;
        }
    }
}

// add items to user cart 
const addItemToCart = ({userId, item}) => {
    try {
        let userFound = false;

        for (const [key, value] of Object.entries(cart)) {
            if (key === userId) {
                userFound = true;
                let itemFound = false;
                for (let idx = 0; idx < value.length; idx++) {
                    if (value[idx].item.id === item.id) {
                        itemFound = true;
                        cart[key][idx].itemCount++;
                        break;
                    }
                }
                if (!itemFound) {
                    cart[key].push({
                        item: item,
                        itemCount: 1
                    });
                }
            }
        }
        if (!userFound) {
            cart[userId] = [];
            cart[userId].push({
                item: item,
                itemCount: 1
            });
        }
        console.log(cart);
        return {
            status: "ok",
            message: "Item Added successfully",
            payload: cart[userId]
        };
    } catch (error) {
        console.log(cart);
        return {
            status: "error",
            message: "Error In adding item",
            payload: error.message
        };
    }
}

// remove items from user cart
const removeItemFromCart = ({userId, productId}) => {
    try {
        let cartItems = cart[userId]?.filter(cartitem => cartitem.item.id !== productId);
        cart[userId] = cartItems;

        return {
            status: "ok",
            message: "Successfully removed item from cart",
            payload: cart[userId]
        }

    } catch (error) {
        return {
            status: "error",
            message: "error in removing item",
            payload: error.message
        }
    }
}

// increment or decrement item quantity
const changeItemCount = ({userId, productId, changeBy}) => {
    try {
        console.log()
        for (let idx = 0; idx < cart[userId]?.length; idx++) {
            if (cart[userId][idx].item.id === productId) {
                
                cart[userId][idx].itemCount += changeBy;
                break;
            }
        }
        return {
            status: "ok",
            message: "quantity changed successfully",
            payload: cart[userId]
        }
    } catch (error) {
        return {
            status: "error",
            message: "error in changing cart count",
            payload: error.message
        }
    }
}
// sync user cart with frontend after login.
const syncUserCart = ({userId, cartItems}) => {
    try {
        if (cart[userId]?.length > 0) {
            for (let idx = 0; idx < cart[userId].length; idx++) {
                for (let j = 0; j < cartItems.length; j++) {
                    if (cart[userId][idx].item.id === cartItems[j].item.id) {
                        cart[userId][idx].itemCount = Math.min(cartItems[j].itemCount+cart[userId][idx].itemCount, 10);
                        cartItems[j].itemCount = 0;
                    }
                }
            }
        } else {
            cart[userId] = [];
        }
        cartItems.forEach(item => {
            if (item.itemCount > 0) cart[userId].push(item);
        });
        console.log(cart);
        return {
            status: "ok",
            message: "Cart Sync Successful",
            payload: cart[userId]
        }
    } catch (error) {
        console.log(cart);
        return {
            status: "error",
            message: "Sync was unsuccessful",
            payload: error.message
        }
    }
};

const emptyCart = ({userId}) => {
    try {
        cart[userId] = [];
        return {
            status: "ok",
            message: "successfully deleted cart items",
            payload: cart[userId]
        }
    } catch (error) {
        return {
            status: "error",
            message: "error in removing all items",
            payload: error.message
        }
    }
}

const placeOrder = ({userId, cartItems, price}) => {
    try {
        if (orders[userId]?.orderId === null) {
            orders[userId].orderId = v4(); 
            orders[userId].orderItems = [...cartItems];
            orders[userId].timestamp = Date.now();
            orders[userId].createdAt = new Date();
            orders[userId].price = price;
        }
    } catch (error) {

    }
}

const changeUserPassword = ({userId, passwd, newPasswd, confirmNewPasswd}) => {
    try {
        let response = {
            status: "",
            message: "",
            payload: {}
        };
        let index = 0;
        users.forEach((user, idx) => {
            if (user.id === userId) index = idx;
        });

        if (users[index]?.password !== passwd) {
            response.status="error";
            response.message="Current Password is Invalid";
        } else if (confirmNewPasswd !== newPasswd) {
            response.status="error";
            response.message="New Passwords do not match";  
        } else  {
            users[index].password = newPasswd;
            response.status = "ok";
            response.message = "Password Changed Successfully";
        }
        return response;
    } catch (error) {
        return {
            status: "error",
            message: "Cannot Change User Password! Try again.",
            payload: error.message
        }
    }
}

module.exports = {
    registerUser,
    logUserIn,
    modifyUserDetails,
    getUserAddressList,
    getUserData,
    removeUserAddress,
    saveUserAddress,
    addItemToCart,
    syncUserCart,
    removeItemFromCart,
    changeItemCount,
    emptyCart,
    editUserAddress,
    changeUserPassword
};