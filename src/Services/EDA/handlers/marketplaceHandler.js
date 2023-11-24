"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceHandler = void 0;
const OrderService = require("../../OrderService");
const marketplaceHandler = (data) => {
    try {
        const event = JSON.parse(data);
        const eventContent = JSON.parse(event.content);
        switch (eventContent.event_name) {
            case "new_purchase":
                console.log("New Purchase", eventContent.data);
                marketplaceHandleNewUserCreate(eventContent.data);
                break;
            default:
                console.log("default");
                break;
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.marketplaceHandler = marketplaceHandler;
const marketplaceHandleNewUserCreate = (purchase) => {
    try {
        const order = mapPurchaseToOrder(purchase);
        OrderService.CreateOrder(order);
    }
    catch (error) {
        console.log(error);
    }
};
const mapPurchaseToOrder = (purchase) => {
    const order = {
        productName: purchase.product_name,
        productPrice: purchase.product_price,
        productQuantity: purchase.product_amount,
        marketplace: purchase.product_marketplace,
        cuit: formatCUIT(purchase.product_marketplace_cuit),
        purchaseId: purchase.purchase_id,
        userEmail: purchase.user_info.email,
        userDni: purchase.user_info.document,
    };
    return order;
};
function formatCUIT(cuit) {
    if (cuit.length !== 11) {
        throw new Error("Invalid CUIT length");
    }
    if (cuit.includes("-")) {
        return cuit;
    }
    else {
        return cuit.replace(/(?<=...)(?=...)/g, "-");
    }
}
