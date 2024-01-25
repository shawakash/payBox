import { kafka } from "./client";

(async () => {
    const admin = kafka.admin( );
    console.log("Admin Connecting");
    await admin.connect();
    console.log("Admin Connected");

    await admin.createTopics({
        topics: [{
            topic: "transaction2",
            numPartitions: 2
        }]
    });

    console.log("Topic creatation success transaction-updates");

    console.log("Disconnecting Admin..");
    await admin.disconnect();
    console.log("Admin disconnection success..");

})().then(_ => console.log("then"));