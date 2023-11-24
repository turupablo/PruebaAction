"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orders_model_1 = __importDefault(require("../Models/orders.model"));
exports.CreateOrder = (order) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Create Order", order);
    try {
        const newOrder = yield orders_model_1.default.create(order);
        return { code: 200, payload: newOrder };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.UpdateOrder = ({ productName, productPrice, productQuantity, marketplace, cuit, purchaseId, userEmail, userDni, deliveryStatus, deliveryDate, orderDate, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Create Order");
        const updatedOrder = yield orders_model_1.default.findOneAndUpdate({ purchaseId }, {
            $set: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (productName && { productName })), (productPrice && { productPrice })), (productQuantity && { productQuantity })), (marketplace && { marketplace })), (cuit && { cuit })), (userEmail && { userEmail })), (userDni && { userDni })), (deliveryStatus && { deliveryStatus })), (deliveryDate && { deliveryDate })), (orderDate && { orderDate })),
        }, { new: true }).lean();
        if (!updatedOrder) {
            return { code: 404, message: "Order not found" };
        }
        return { code: 200, payload: updatedOrder };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.getOrdersByUser = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield orders_model_1.default.find({ userEmail }).lean();
        return { code: 200, payload: order };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.getOrdersBySupplier = (supplierCuit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orders_model_1.default.find({ cuit: supplierCuit }).lean();
        return { code: 200, payload: orders };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
