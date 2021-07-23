const navbar = document.querySelector('.navbar');
const connectionBtn = document.getElementById('connection-btn');
const elapsedTime = document.getElementById('elapsed-time');
const automatic = document.getElementById('automatic');
const manual = document.getElementById('manual');
const lightTitle = document.getElementById('light-title');
const lightDescription = document.getElementById('light-description');
const poleForm = document.getElementById('pole-form');
const poleInput = poleForm.querySelector('input');
const slot1Card = document.getElementById('slot1');
const slot1P = slot1Card.querySelector('p');
const reserveButton1 = slot1Card.querySelector('.btn');
const slot2Card = document.getElementById('slot2');
const slot2P = slot2Card.querySelector('p');
const reserveButton2 = slot2Card.querySelector('.btn');
const boardOverlay = document.getElementById('board-overlay');
let data = {};

// a function to tell the status of the light pole in automatic mode
function checkLight() {
    if (automatic.classList.contains("active")) {
        if (data.photoResistor < 700) {
            lightTitle.textContent = "Low light intenisty, Light Poles are on";
            lightDescription.textContent = "If you want to control light poles manually, choose manual from the above options";
        }
        else {
            lightTitle.textContent = "High light intenisty, Light Poles are off";
            lightDescription.textContent = "If you want to control light poles manually, choose manual from the above options";
        }
    }
}


// a function to get the data from the server
async function getData() {
    await fetch("/data").then(async (response) => {
        await response.json().then(async (json) => {
            data = json
        });
    })
};

// a function to update the time
function updateTime() {
    data.time /= 1000;
    const hours = Math.floor(data.time / (60 * 60));
    data.time -= hours * 60 * 60;
    const mins = Math.floor(data.time / 60);
    data.time -= mins * 60;
    const sec = data.time;
    elapsedTime.textContent = "Elapsed Time: " + mins + ":" + String(sec).slice(0, 5);
}


async function updateContent() {
    await getData();

    // showing the disconnected status
    if (!data.status) {
        for (let i = 0; i < 10; i++) {
            await getData();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (data.status) break;
        }
    }
    if (!data.status) {
        boardOverlay.style.display = "block";
        if (!connectionBtn.classList.contains('btn-outline-danger')) {
            connectionBtn.classList.remove('btn-outline-success')
            connectionBtn.classList.add('btn-outline-danger')
            connectionBtn.textContent = "Disconnected";
        }
        return;
    }

    // hiding the disconnected status
    boardOverlay.style.display = "none";
    if (!connectionBtn.classList.contains('btn-outline-success')) {
        connectionBtn.classList.remove('btn-outline-danger')
        connectionBtn.classList.add('btn-outline-success')
        connectionBtn.textContent = "Connected";
    }

    // Elapsed time()
    updateTime();

    // check light
    if (automatic.classList.contains("active")) checkLight();

    // checking slot1
    if (data.slot1) {
        slot1P.textContent = "Reserved By: Car RFID Code";
        if (reserveButton1.classList.contains("btn-primary")) {
            reserveButton1.classList.remove("btn-primary");
            reserveButton1.classList.add("btn-secondary");
        }
    }
    else {
        slot1P.textContent = "Slot 1 is available ";
        if (reserveButton1.classList.contains("btn-secondary")) {
            reserveButton1.classList.remove("btn-secondary");
            reserveButton1.classList.add("btn-primary");
        }
    }

    // checking slot2
    if (data.slot2) {
        slot2P.textContent = "Reserved By: Car RFID Code";
        if (reserveButton2.classList.contains("btn-primary")) {
            reserveButton2.classList.remove("btn-primary");
            reserveButton2.classList.add("btn-secondary");
        }
    }
    else {
        slot2P.textContent = "Slot 2 is available ";
        if (reserveButton2.classList.contains("btn-secondary")) {
            reserveButton2.classList.remove("btn-secondary");
            reserveButton2.classList.add("btn-primary");
        }
    }
}

setInterval(updateContent, 2000);


automatic.addEventListener('click', (e) => {
    if (!e.target.classList.contains("active")) {
        e.target.classList.add("active");
        manual.classList.remove("active");
        poleForm.classList.toggle('d-none');
        poleForm.classList.toggle('d-inline-block');

        const poleLight = { mode: "automatic" };
        console.log(poleLight);
        fetch("http://10.2.44.187:3000/pole", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            mode: 'cors',
            body: JSON.stringify({poleLight})
        }).then(res => {
            console.log("Request complete! response:", res);
        }).catch(e => console.log(e));

        checkLight();
    }
})


manual.addEventListener('click', (e) => {
    if (!e.target.classList.contains("active")) {
        e.target.classList.add("active");
        poleForm.classList.toggle('d-inline-block');
        poleForm.classList.toggle('d-none');
        automatic.classList.remove("active");
        poleInput.checked = false;

        lightTitle.textContent = "Light pole";
        lightDescription.textContent = "If you want automatic control of light poles, choose automatic from the above options";

        const poleLight = { poleLight: { status: 0, mode: "manual" } };
        fetch("http://10.2.44.187:3000/pole", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            mode: 'cors',
            body: JSON.stringify(poleLight)
        }).then(res => {
            console.log("Request complete! response:", res);
        }).catch(e => console.log(e));
    }
})


poleInput.addEventListener('click', (e) => {
    poleForm.submit();
});