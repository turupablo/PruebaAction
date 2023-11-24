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
exports.GetUserCount = exports.updateUserProfilePicture = void 0;
const supplier_model_1 = __importDefault(require("../Models/supplier.model"));
const user_model_1 = __importDefault(require("../Models/user.model"));
const bcrypt = require("bcrypt");
const CloudinaryService_1 = __importDefault(require("./CloudinaryService"));
const EdaIntegrator_1 = require("./EDA/EdaIntegrator");
exports.Register = ({ name, email, dni, address, phone, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_model_1.default.findOne({ email }).lean();
        if (user) {
            return { code: 400, message: "User already exists" };
        }
        const NewUser = new user_model_1.default({
            name,
            email,
            dni,
            address,
            phone,
            createdOn: Date.now(),
            vip: false,
            discount: 0,
        });
        const salt = yield bcrypt.genSalt(10);
        NewUser.password = yield bcrypt.hash(password, salt);
        const eda = EdaIntegrator_1.EDA.getInstance();
        yield NewUser.save();
        const newUserEvent = {
            username: NewUser.name,
            password: password,
            name: NewUser.name,
            email: NewUser.email,
            document: NewUser.dni,
            address: NewUser.address ? NewUser.address : "",
            vip: NewUser.vip ? NewUser.vip : false,
            discount: NewUser.discount ? NewUser.discount : 0,
        };
        //Guild 2 Use Case
        eda.publishMessage("/app/send/usuarios", "new_user_create", newUserEvent);
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
                name: NewUser.name,
                email: NewUser.email,
                dni: NewUser.dni,
                address: NewUser.address,
                phone: NewUser.phone,
                createdOn: NewUser.createdOn,
                isProvider: NewUser.isProvider,
                isEmployee: NewUser.isEmployee,
                group: NewUser.group,
                discount: NewUser.discount,
                vip: NewUser.vip,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.UpdateUser = ({ email, name, dni, address, phone, password, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_model_1.default.findOne({ email }).lean();
        if (!user) {
            return { code: 404, message: "User not found" };
        }
        const updateFields = {};
        if (name && name.trim() !== "") {
            updateFields.name = name;
        }
        if (dni && dni.trim() !== "") {
            updateFields.dni = dni;
        }
        if (address && address.trim() !== "") {
            updateFields.address = address;
        }
        if (phone && phone.trim() !== "") {
            updateFields.phone = phone;
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
        user = yield user_model_1.default.findOneAndUpdate({ email }, { $set: updateFields }, { new: true }).lean();
        if (password && password.trim() !== "" && (user === null || user === void 0 ? void 0 : user.isEmployee)) {
            const eventPayload = {
                sender: "usuarios",
                created_at: Date.now(),
                event_name: "user_employee_password_change",
                data: {
                    username: user === null || user === void 0 ? void 0 : user.name,
                    newPassword: password,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    dni: user === null || user === void 0 ? void 0 : user.dni,
                },
            };
            const eda = EdaIntegrator_1.EDA.getInstance();
            eda.publishMessage("/app/send/usuarios", "user_employee_password_change", eventPayload);
        }
        return {
            code: 200,
            payload: {
                name: user === null || user === void 0 ? void 0 : user.name,
                email: user === null || user === void 0 ? void 0 : user.email,
                dni: user === null || user === void 0 ? void 0 : user.dni,
                address: user === null || user === void 0 ? void 0 : user.address,
                phone: user === null || user === void 0 ? void 0 : user.phone,
                profilePicture: user === null || user === void 0 ? void 0 : user.profilePicture,
                isProvider: user === null || user === void 0 ? void 0 : user.isProvider,
                isEmployee: user === null || user === void 0 ? void 0 : user.isEmployee,
                group: user === null || user === void 0 ? void 0 : user.group,
                discount: user === null || user === void 0 ? void 0 : user.discount,
                vip: user === null || user === void 0 ? void 0 : user.vip,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
const updateUserProfilePicture = (email, profilePicture) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cloudinaryResult = yield CloudinaryService_1.default.uploadImage(profilePicture);
        const updateUser = yield user_model_1.default.findOneAndUpdate({ email }, { $set: { profilePicture: cloudinaryResult.url } }, { new: true }).lean();
        if (!updateUser) {
            return { code: 404, message: "User not found" };
        }
        return {
            code: 200,
            payload: {
                user: updateUser,
            },
        };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.updateUserProfilePicture = updateUserProfilePicture;
exports.DeleteUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.default.deleteOne({ email }).lean();
        return { code: 200, message: "User Deleted" };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.GetUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_model_1.default.findOne({ email }).lean();
        return { code: 200, user: user };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
const GetUserCount = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield user_model_1.default.countDocuments();
        return { code: 200, count: count };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.GetUserCount = GetUserCount;
exports.CreateUserFromEmployee = (employee) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isCeo = employee.grupo === "509";
        const NewUser = new user_model_1.default({
            name: employee.username,
            email: employee.username,
            dni: employee.carLicense,
            address: "",
            phone: "",
            createdOn: Date.now(),
            password: employee.password,
            isProvider: false,
            isEmployee: true,
            group: employee.grupo,
            discount: isCeo ? 60 : 30,
            vip: isCeo ? true : false,
        });
        const salt = yield bcrypt.genSalt(10);
        NewUser.password = yield bcrypt.hash(NewUser.password, salt);
        yield NewUser.save();
        const eventPayload = {
            sender: "usuarios",
            created_at: Date.now(),
            event_name: "new_user_employee_create",
            data: {
                name: NewUser.name,
                email: NewUser.email,
                dni: NewUser.dni,
                address: NewUser.address ? NewUser.address : "",
                phone: NewUser.phone ? NewUser.phone : "",
                createdOn: NewUser.createdOn,
                password: NewUser.password,
                discount: NewUser.discount ? NewUser.discount : 0,
                vip: NewUser.vip ? NewUser.vip : false,
            },
        };
        const eda = EdaIntegrator_1.EDA.getInstance();
        eda.publishMessage("/app/send/usuarios", "new_user_employee_create", NewUser);
        return { code: 200, message: "User created" };
    }
    catch (error) {
        return { code: 500, message: "Internal Server Error" };
    }
});
exports.handleGoogleSignIn = (props) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, picture } = props;
    let user = yield user_model_1.default.findOne({ email }).lean();
    if (user) {
        return {
            code: 200,
            payload: {
                name: user.name,
                email: user.email,
                dni: user.dni,
                address: user.address,
                phone: user.phone,
                createdOn: user.createdOn,
                isProvider: user.isProvider,
                isEmployee: user.isEmployee,
                group: user.group,
                discount: user.discount,
                vip: user.vip,
                profilePicture: user.profilePicture,
            },
        };
    }
    //If not, create user.
    const NewUser = new user_model_1.default({
        name,
        email,
        dni: "",
        address: "",
        phone: "",
        createdOn: Date.now(),
        password: "",
        isProvider: false,
        isEmployee: false,
        group: "",
        discount: 0,
        vip: false,
        profilePicture: picture,
    });
    yield NewUser.save();
    return {
        code: 200,
        payload: {
            name: NewUser.name,
            email: NewUser.email,
            dni: NewUser.dni,
            address: NewUser.address,
            phone: NewUser.phone,
            createdOn: NewUser.createdOn,
            isProvider: NewUser.isProvider,
            isEmployee: NewUser.isEmployee,
            group: NewUser.group,
            discount: NewUser.discount,
            vip: NewUser.vip,
            profilePicture: NewUser.profilePicture,
        },
    };
});
