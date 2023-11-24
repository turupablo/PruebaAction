"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDA = void 0;
const stompjs_1 = require("@stomp/stompjs");
const ws_1 = require("ws");
const adminPersonalHandler_1 = require("./handlers/adminPersonalHandler");
const robotsHandler_1 = require("./handlers/robotsHandler");
const marketplaceHandler_1 = require("./handlers/marketplaceHandler");
let fs = require("fs");
Object.assign(global, { WebSocket: ws_1.WebSocket });
class EDA {
    constructor() {
        this.isConnected = false;
        this.messageQueue = [];
        // Singleton
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new EDA();
            this.instance.initialize();
        }
        return this.instance;
    }
    initialize() {
        console.log("Initializing EDA connection...");
        this.brokerURL = "ws://intappscore.azurewebsites.net/usuarios";
        this.eda_init();
        this.client.activate();
        console.log("Finished EDA init...");
    }
    publishMessage(topic, eventName, message) {
        const event = {
            sender: "usuarios",
            created_at: Date.now(),
            event_name: eventName,
            data: message,
        };
        if (this.client.connected) {
            console.log("Publishing message to topic", topic);
            this.client.publish({
                destination: topic,
                body: JSON.stringify(event),
            });
        }
        else {
            this.messageQueue.push({ topic, message });
        }
    }
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const dequeuedItem = this.messageQueue.shift();
            if (dequeuedItem) {
                // Check if dequeuedItem is not undefined
                const { topic, message } = dequeuedItem;
                console.log("Publishing message to topiccccc", topic);
                try {
                    this.client.publish({
                        destination: topic,
                        body: JSON.stringify(message),
                    });
                }
                catch (err) {
                    console.log("Error en el publish");
                }
            }
        }
    }
    process_usuarios(data) {
        fs.appendFile("logs.txt", data + "\n", function (err) {
            if (err) {
                console.log("EDA Usuarios error" + err.message);
            }
        });
    }
    process_admin_personal(data) {
        console.log("Admin Personal");
        fs.appendFile("AdminDePersonal.txt", data + "\n", function (err) {
            if (err) {
                console.log("EDA Adm. Personal error" + err.message);
            }
        });
    }
    process_robots(data) {
        fs.appendFile("robots.txt", data + "\n", function (err) {
            if (err) {
                console.log("EDA Robots error" + err.message);
            }
        });
    }
    process_core_bancario(data) {
        fs.appendFile("logsBancario.txt", data + "\n", function (err) {
            if (err) {
                console.log("EDA Core Bancario error" + err.message);
            }
        });
    }
    process_marketplace(data) {
        fs.appendFile("marketplace.txt", data + "\n", function (err) {
            if (err) {
                console.log("EDA Marketplace error" + err.message);
            }
        });
    }
    // Vamos a quedarnos escuchando las diferentes colas aca
    // Como no sabemos la info que nos va a llegar, vamos a meter todos los mensajes
    // en un archivo hasta que sepamos procesarlos todos
    eda_init() {
        console.log("Eda Init function....");
        this.client = new stompjs_1.Client({
            brokerURL: this.brokerURL,
            onConnect: (frame) => {
                console.log("Connected to websocket");
                this.isConnected = true;
                this.client.subscribe("/topic/usuarios", (message) => {
                    this.process_usuarios(message.body);
                });
                this.client.subscribe("/topic/admin-personal", (message) => {
                    console.log("Admin Personal");
                    (0, adminPersonalHandler_1.adminPersonalHandler)(message.body);
                    this.process_admin_personal(message.body);
                });
                this.client.subscribe("/topic/robots", (message) => {
                    console.log("Robots");
                    (0, robotsHandler_1.robotsHandler)(message.body);
                    this.process_robots(message.body);
                });
                this.client.subscribe("/topic/marketplace", (message) => {
                    console.log("Marketplace");
                    (0, marketplaceHandler_1.marketplaceHandler)(message.body);
                    this.process_marketplace(message.body);
                });
                this.client.subscribe("/topic/core-bancario", (message) => this.process_core_bancario(message.body));
                this.processMessageQueue();
            },
            onDisconnect: () => {
                console.log("Disconnected from websocket");
            },
            onStompError: (frame) => {
                console.log("Broker reported error: " + frame.headers["message"]);
                console.log("Additional details: " + frame.body);
            },
        });
    }
}
exports.EDA = EDA;
