const express = require("express");
const path = require("path");
const app = express();

// Data variables
let slot1 = undefined;
let slot2 = undefined;
let photoResistor = undefined;
let time = 0;
let status = true;
let poleLight = {mode: "automatic"};

// ID for the connection timeout status 
let ID1 = setTimeout(() => {
    status = false;
}, 5000);

// Middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Starting the server
const port = 3000;

app.listen(port, () => {
    console.log("Listening on port 3000");
});


// rendering the home page in the browser
app.get('/home', (req, res) => {
    res.render('home');
});


// data submission from nodeMCU
app.post('/esp', (req, res) => {
    // saving the data
    ({slot1, slot2, photoResistor, time} = req.body);
    status = true;

    // clearing the previous timeout for disconnected status after data submission
    clearTimeout(ID1);
    // setting a timeout for the connection status after data submission from the board
    ID1 = setTimeout(() => {
        status = false;
    }, 2000);

    console.log(req.body, " status", status);
    res.send(poleLight);
});

// sending the data to the home page upon request
app.get("/data", (req, res) => {
    // console.log("browser request status:", status);
    // console.log(time);
    res.send(JSON.stringify({ status, slot1, slot2, photoResistor, time }))
});

// geting poleLight control from the user
app.post('/pole', (req, res) => {
    poleLight = req.body.poleLight;
    // console.log(poleLight);
    if (!poleLight) poleLight = { status: 0, mode: "manual" };
    else if(poleLight.status === "on") poleLight = { status: 1, mode: "manual" };
    res.send("Ok");
});


app.get('*', (req, res)=>res.redirect("/home"));
