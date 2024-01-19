require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const uniqid = require('uniqid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

let rooms = [];
let roomNo = 100;
let bookings = [];
let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let timeRegex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get("/", (req, res) => res.json({ output: "Homepage" }));

app.get("/getAllRooms", (req, res) => res.json({ output: rooms }));

app.get("/getAllBookings", (req, res) => res.json({ output: bookings }));

app.post("/createRoom", (req, res) => {
    if (!req.body.noSeats || !req.body.amenities || !req.body.price) {
        return res.status(400).json({ output: 'Please specify No of seats, Amenities, and price for Room' });
    }
    rooms.push({
        id: uniqid(),
        roomNo: roomNo++,
        bookings: [],
        noSeats: req.body.noSeats,
        amenities: req.body.amenities,
        price: req.body.price
    });
    res.status(200).json({ output: 'Room Created Successfully' });
});

app.post("/createBooking", (req, res) => {
    const { custName, date, startTime, endTime } = req.body;
    if (!custName || !date || !startTime || !endTime || !dateRegex.test(date) || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({ output: 'Invalid booking details' });
    }

    const availableRooms = rooms.filter(room => room.bookings.every(
        booking => booking.date !== date ||
            (parseInt(booking.startTime.substring(0, 2)) >= parseInt(endTime.substring(0, 2)) ||
                parseInt(booking.endTime.substring(0, 2)) <= parseInt(startTime.substring(0, 2)))
    ));

    if (availableRooms.length === 0) {
        return res.status(400).json({ output: 'No Available Rooms on Selected Date and Time' });
    }

    const roomRec = availableRooms[0];
    roomRec.bookings.push({ custName, startTime, endTime, date });

    const bookingRec = { ...req.body, roomNo: roomRec.roomNo, cost: parseInt(roomRec.price) * (parseInt(endTime.substring(0, 2)) - parseInt(startTime.substring(0, 2))) };
    bookings.push(bookingRec);

    res.status(200).json({ output: 'Room Booking Successfully' });
});
