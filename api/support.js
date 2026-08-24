"use strict";

/*
=========================================================
 SwiftCortex AI Ultra
 Customer Support API
 File:
 /api/support.js

 Purpose:
 - Customer Support
 - Live Agent request
 - Customer messages
 - Agent replies
 - CORS
=========================================================
*/


/* =========================================================
   CORS
========================================================= */

function setCors(res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

}


/* =========================================================
   MAIN HANDLER
========================================================= */

export default async function handler(req, res) {

    setCors(res);


    /* -----------------------------------------------------
       OPTIONS
    ----------------------------------------------------- */

    if (req.method === "OPTIONS") {

        return res.status(204).end();

    }


    /* -----------------------------------------------------
       GET
       Test endpoint
    ----------------------------------------------------- */

    if (req.method === "GET") {

        return res.status(200).json({

            success: true,

            service:
                "SwiftCortex Customer Support",

            status:
                "online",

            message:
                "Customer Support API is running.",

            supportEmail:
                "swiftcortexaisupport@gmail.com",

            liveAgent:
                true,

            time:
                new Date().toISOString()

        });

    }


    /* -----------------------------------------------------
       POST
    ----------------------------------------------------- */

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            error:
                "Method not allowed."

        });

    }


    try {

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : (req.body || {});


        const action =
            String(
                body.action || "message"
            ).trim();


        const message =
            String(
                body.message || ""
            ).trim();


        const customerName =
            String(
                body.customerName ||
                "Guest User"
            ).trim();


        const customerEmail =
            String(
                body.customerEmail || ""
            ).trim();


        const conversationId =
            String(
                body.conversationId ||
                ""
            ).trim();


        /* =================================================
           LIVE AGENT REQUEST
        ================================================= */

        if (
            action ===
            "request_agent"
        ) {

            const id =
                conversationId ||
                `SC-${Date.now()}`;


            return res.status(200).json({

                success: true,

                action:
                    "request_agent",

                conversationId:
                    id,

                status:
                    "waiting",

                customer: {

                    name:
                        customerName,

                    email:
                        customerEmail

                },

                message:
                    "Your live agent request has been received.",

                supportEmail:
                    "swiftcortexaisupport@gmail.com",

                note:
                    "Realtime agent connection will use the configured support database."

            });

        }


        /* =================================================
           CUSTOMER MESSAGE
        ================================================= */

        if (
            action ===
            "message"
        ) {

            if (!message) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Message cannot be empty."

                });

            }


            const id =
                conversationId ||
                `SC-${Date.now()}`;


            return res.status(200).json({

                success: true,

                action:
                    "message",

                conversationId:
                    id,

                status:
                    "received",

                customer: {

                    name:
                        customerName,

                    email:
                        customerEmail

                },

                message: {

                    id:
                        `MSG-${Date.now()}`,

                    text:
                        message,

                    sender:
                        "customer",

                    time:
                        new Date().toISOString()

                },

                supportEmail:
                    "swiftcortexaisupport@gmail.com"

            });

        }


        /* =================================================
           AGENT REPLY
        ================================================= */

        if (
            action ===
            "agent_reply"
        ) {

            if (!message) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Agent message cannot be empty."

                });

            }


            if (!conversationId) {

                return res.status(400).json({

                    success: false,

                    error:
                        "conversationId is required."

                });

            }


            return res.status(200).json({

                success: true,

                action:
                    "agent_reply",

                conversationId:
                    conversationId,

                message: {

                    id:
                        `AGENT-${Date.now()}`,

                    text:
                        message,

                    sender:
                        "agent",

                    time:
                        new Date().toISOString()

                }

            });

        }


        /* =================================================
           CLOSE CONVERSATION
        ================================================= */

        if (
            action ===
            "close"
        ) {

            if (!conversationId) {

                return res.status(400).json({

                    success: false,

                    error:
                        "conversationId is required."

                });

            }


            return res.status(200).json({

                success: true,

                action:
                    "close",

                conversationId:
                    conversationId,

                status:
                    "closed",

                message:
                    "Support conversation closed."

            });

        }


        /* =================================================
           UNKNOWN ACTION
        ================================================= */

        return res.status(400).json({

            success: false,

            error:
                "Unknown support action.",

            availableActions: [

                "message",

                "request_agent",

                "agent_reply",

                "close"

            ]

        });


    } catch (error) {

        console.error(
            "SwiftCortex Support API Error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Internal Customer Support server error."

        });

    }

}
