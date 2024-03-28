import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { MAILPORT } from "@paybox/common";



const app = new SMTPServer({
    authOptional: true,
    // Make it false if you want to send mail
    allowInsecureAuth: true,

    onConnect(session, callback) {
        //todo: handle error
        console.log("Connected with: ", session.id);
        return callback();
    },

    onMailFrom(address, session, callback) {
        //todo: check if the email is valid by spf and dkim
        console.log("Mail from: ", address.address, session.id);
        return callback();
    },

    onRcptTo(address, session, callback) {
        //todo: query the database to check if the email key is valid
        console.log("Mail to: ", address.address, session.id);
        return callback();
    },

    onData(stream, session, callback) {
        // todo: save the metadata to the database or use worker for that
        console.log("Data: ", session.id);
        let data = '';
        stream.on("data", async (chunk) => {
            data += chunk.toString();
            console.log("Chunk: ", chunk.toString());
        });
        stream.on("end", async () => {
            let parsed = await simpleParser(data);
            console.log("Parsed: ", parsed);
            return callback();
        });
    },
});

app.on("error", (err) => {
    console.error(err);
});

process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});

process.on("unhandledRejection", function (reason, _promise) {
    console.log("Unhandled Rejection at:", reason);
});


app.listen(MAILPORT, () => {
    console.log(`Mail Server Listening on port: ${MAILPORT}`);
});