"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotsHandler = void 0;
const OrderService = require("../../OrderService");
const robotsHandler = (data) => {
    try {
        const event = JSON.parse(data);
        const eventContent = JSON.parse(event.content);
        switch (eventContent.event_name) {
            case "delivery_update":
                const order = mapIDeliveryToUpdateOrder(eventContent.data);
                console.log("Order on Delivery Update", order);
                robotsHandleEvent(order);
                break;
            case "delivery_successful":
                const orderToUpdate = mapIDeliveryUpdateToUpdateOrder(eventContent.data);
                console.log("Order on Delivery Success", orderToUpdate);
                robotsHandleEvent(orderToUpdate);
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
exports.robotsHandler = robotsHandler;
const robotsHandleEvent = (orderToUpdate) => {
    try {
        OrderService.UpdateOrder(orderToUpdate);
    }
    catch (error) {
        console.log(error);
    }
};
const mapIDeliveryToUpdateOrder = (delivery) => {
    const order = {
        purchaseId: delivery.purchase_id,
        deliveryStatus: delivery.status,
    };
    return order;
};
const mapIDeliveryUpdateToUpdateOrder = (delivery) => {
    const order = {
        purchaseId: delivery.purchase_id,
        deliveryStatus: delivery.status,
        deliveryDate: delivery.deliveryDate,
        orderDate: delivery.requestDate,
    };
    return order;
};
