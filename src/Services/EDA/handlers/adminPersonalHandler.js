"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPersonalHandler = void 0;
const UserService = require("../../UserService");
const adminPersonalHandler = (data) => {
    try {
        const event = JSON.parse(data);
        const eventContent = JSON.parse(event.content);
        switch (eventContent.event_name) {
            case "new_user_create":
                adminPersonaHandleNewUserCreate(eventContent.data);
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
exports.adminPersonalHandler = adminPersonalHandler;
const adminPersonaHandleNewUserCreate = (employee) => {
    try {
        UserService.CreateUserFromEmployee(employee);
    }
    catch (error) {
        console.log(error);
    }
};
