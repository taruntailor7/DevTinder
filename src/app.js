const express = require("express");

const app = express();

const port = 3000;

app.use((req, res) => {
    res.send("Hello from express server!!");
})

app.listen(port, () => {
    console.log('Server is listening on port:', port);
})