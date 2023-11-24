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
const supplier_model_1 = __importDefault(require("../Models/supplier.model"));
const user_model_1 = __importDefault(require("../Models/user.model"));
const bcrypt = require("bcrypt");
const CloudinaryService_1 = __importDefault(require("./CloudinaryService"));
const EdaIntegrator_1 = require("./EDA/EdaIntegrator");
exports.Register = ({ name, businessName, cuit, domain, address, phone, category, email, primaryColor, secondaryColor, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let supplier = yield supplier_model_1.default.findOne({ cuit: cuit }).lean();
        const eda = EdaIntegrator_1.EDA.getInstance();
        if (supplier) {
            return { code: 400, message: "Supplier already exists" };
        }
        const NewSupplier = new supplier_model_1.default({
            name,
            businessName,
            cuit,
            domain,
            address,
            phone,
            category,
            email,
            primaryColor,
            secondaryColor,
            createdOn: Date.now(),
            isProvider: true,
        });
        const salt = yield bcrypt.genSalt(10);
        NewSupplier.password = yield bcrypt.hash(password, salt);
        yield NewSupplier.save();
        //Guild 1
        const newSupplierEvent = {
            name: NewSupplier.name,
            businessName: NewSupplier.businessName,
            cuit: NewSupplier.cuit,
            domain: NewSupplier.domain,
            address: NewSupplier.address,
            phone: NewSupplier.phone,
            category: NewSupplier.category,
            email: NewSupplier.email,
            primaryColor: NewSupplier.primaryColor,
            secondaryColor: NewSupplier.secondaryColor,
            coverPhoto: NewSupplier.coverPhoto,
            logo: NewSupplier.logo,
            password: password,
        };
        eda.publishMessage("/app/send/usuarios", "new_company_create", newSupplierEvent);
        //END Guild 1
        //Guild 5.
        //User/Supplier Count.
        const userCount = yield user_model_1.default.countDocuments();
        const supplierCount = yield supplier_model_1.default.countDocuments();
        const userSupplierCount = {
            userCount,
            supplierCount,
        };
        eda.publishMessage("/app/send/usuarios", "user_supplier_count", userSupplierCount);
        //END Guild 5.
        return {
            code: 200,
            payload: {
                name: NewSupplier.name,
                businessName: NewSupplier.businessName,
                cuit: NewSupplier.cuit,
                domain: NewSupplier.domain,
                address: NewSupplier.address,
                phone: NewSupplier.phone,
                category: NewSupplier.category,
                email: NewSupplier.email,
                primaryColor: NewSupplier.primaryColor,
                secondaryColor: NewSupplier.secondaryColor,
                isProvider: NewSupplier.isProvider,
                createdOn: NewSupplier.createdOn,
            },
        };
    }
    catch (error) {
        console.log(error);
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.UpdateSupplier = ({ cuit, name, businessName, domain, address, phone, category, email, primaryColor, secondaryColor, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let supplier = yield supplier_model_1.default.findOne({ cuit });
        if (!supplier) {
            return { code: 400, message: "Supplier does not exist" };
        }
        const updateFields = {};
        if (name && name.trim() !== "") {
            updateFields.name = name;
        }
        if (businessName && businessName.trim() !== "") {
            updateFields.businessName = businessName;
        }
        if (domain && domain.trim() !== "") {
            updateFields.domain = domain;
        }
        if (address && address.trim() !== "") {
            updateFields.address = address;
        }
        if (phone && phone.trim() !== "") {
            updateFields.phone = phone;
        }
        if (category && category.trim() !== "") {
            updateFields.category = category;
        }
        if (email && email.trim() !== "") {
            updateFields.email = email;
        }
        if (primaryColor && primaryColor.trim() !== "") {
            updateFields.primaryColor = primaryColor;
        }
        if (secondaryColor && secondaryColor.trim() !== "") {
            updateFields.secondaryColor = secondaryColor;
        }
        // Check if password is provided and is not an empty string
        if (password && password.trim() !== "") {
            const salt = yield bcrypt.genSalt(10);
            updateFields.password = yield bcrypt.hash(password, salt);
        }
        // If there are no fields to update, you can immediately return
        if (Object.keys(updateFields).length === 0) {
            return {
                code: 400,
                message: "No valid fields provided for update.",
            };
        }
        yield supplier_model_1.default.updateOne({ cuit }, { $set: updateFields });
        supplier = yield supplier_model_1.default.findOne({ cuit }).lean();
        return {
            code: 200,
            payload: {
                name: supplier === null || supplier === void 0 ? void 0 : supplier.name,
                businessName: supplier === null || supplier === void 0 ? void 0 : supplier.businessName,
                cuit,
                domain: supplier === null || supplier === void 0 ? void 0 : supplier.domain,
                address: supplier === null || supplier === void 0 ? void 0 : supplier.address,
                phone: supplier === null || supplier === void 0 ? void 0 : supplier.phone,
                category: supplier === null || supplier === void 0 ? void 0 : supplier.category,
                email: supplier === null || supplier === void 0 ? void 0 : supplier.email,
                primaryColor: supplier === null || supplier === void 0 ? void 0 : supplier.primaryColor,
                secondaryColor: supplier === null || supplier === void 0 ? void 0 : supplier.secondaryColor,
                isProvider: true,
                createdOn: supplier === null || supplier === void 0 ? void 0 : supplier.createdOn,
            },
        };
    }
    catch (error) {
        console.log(error);
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.UpdateSupplierLogo = (cuit, logo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cloudinaryResult = yield CloudinaryService_1.default.uploadImage(logo);
        const updatedSupplier = yield supplier_model_1.default.findOneAndUpdate({ cuit: cuit }, { $set: { logo: cloudinaryResult.url } }, { new: true }).lean();
        if (!updatedSupplier) {
            return { code: 400, message: "Supplier does not exists" };
        }
        return {
            code: 200,
            payload: {
                supplier: updatedSupplier,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.updateSupplierCoverPhoto = (cuit, coverPhoto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cloudinaryResult = yield CloudinaryService_1.default.uploadImage(coverPhoto);
        const updatedSupplier = yield supplier_model_1.default.findOneAndUpdate({ cuit: cuit }, { $set: { coverPhoto: cloudinaryResult.url } }, { new: true }).lean();
        if (!updatedSupplier) {
            return { code: 400, message: "Supplier does not exists" };
        }
        return {
            code: 200,
            payload: {
                supplier: updatedSupplier,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.DeleteSupplier = (cuit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield supplier_model_1.default.deleteOne({ cuit: cuit }).lean();
        return { code: 200, message: "Supplier Deleted" };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.GetSupplier = (cuit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield supplier_model_1.default.findOne({ cuit: cuit }).lean();
        if (!supplier) {
            return { code: 404, message: "Supplier not found" };
        }
        return {
            code: 200,
            payload: {
                supplier,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.GetSupplierCount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield supplier_model_1.default.countDocuments();
        return { code: 200, count: count };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
