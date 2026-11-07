
// Local storage helper functions
function getData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Set minimum reservation date
const dateInput = document.getElementById("reservationDate");

if (dateInput) {
    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.min = localDate;
}

// Customer Registration
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        const users = getData("restaurantUsers");

        if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
            document.getElementById("registerMessage").textContent =
                "Email already registered!";
            return;
        }

        users.push({ name, email, password });

        saveData("restaurantUsers", users);

        document.getElementById("registerMessage").textContent =
            "Registration successful! Please login.";

        registerForm.reset();
    });
}

// Customer Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = getData("restaurantUsers");

        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
            localStorage.setItem("restaurantCurrentUser", JSON.stringify({
                name: user.name,
                email: user.email
            }));

            alert("Login Successful!");

            window.location.href = "index.html";
        } else {
            document.getElementById("loginMessage").textContent =
                "Invalid email or password!";
        }
    });
}

// Table Reservation
const reservationForm =
    document.getElementById("reservationForm");

if (reservationForm) {
    reservationForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name =
            document.getElementById("customerName").value.trim();

        const email =
            document.getElementById("customerEmail").value.trim();

        const phone =
            document.getElementById("customerPhone").value;

        const date =
            document.getElementById("reservationDate").value;

        const time =
            document.getElementById("reservationTime").value;

        const guests =
            document.getElementById("guests").value;

        const table =
            document.getElementById("tableType").value;

        const request =
            document.getElementById("specialRequest").value;

        if (!date || date < dateInput.min) {
            alert("Please select today or a future date.");
            return;
        }

        const bookings = getData("restaurantBookings");

        // Check duplicate table reservation
        const alreadyBooked = bookings.some(b =>
            b.date === date &&
            b.time === time &&
            b.table === table &&
            b.status !== "Cancelled"
        );

        if (alreadyBooked) {
            alert("This table is already reserved for this time!");
            return;
        }

        const booking = {
            id: "GR" + Date.now(),
            name,
            email,
            phone,
            date,
            time,
            guests,
            table,
            request,
            status: "Confirmed"
        };

        bookings.push(booking);

        saveData("restaurantBookings", bookings);
        localStorage.setItem("lastRestaurantBooking", booking.id);

        window.location.href = "confirmation.html";
    });
}

// Reservation Confirmation
const confirmation =
    document.getElementById("confirmationDetails");

if (confirmation) {
    const bookings = getData("restaurantBookings");

    const id = localStorage.getItem("lastRestaurantBooking");

    const booking = bookings.find(b => b.id === id);

    confirmation.innerHTML = "";

    if (booking) {
        const heading = document.createElement("h2");
        heading.textContent = "🎉 Table Reserved Successfully!";

        const details = document.createElement("div");
        details.style.lineHeight = "2";

        const fields = [
            ["Reservation ID", booking.id],
            ["Customer Name", booking.name],
            ["Email", booking.email],
            ["Phone", booking.phone],
            ["Date", booking.date],
            ["Time", booking.time],
            ["Guests", booking.guests],
            ["Table", booking.table],
            ["Special Request", booking.request || "None"],
            ["Status", booking.status]
        ];

        fields.forEach(([label, value]) => {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = label + ": ";
            p.append(strong, document.createTextNode(value));
            details.appendChild(p);
        });

        confirmation.append(heading, details);
    } else {
        confirmation.textContent = "No reservation found!";
    }
}

// My Bookings
const bookingList = document.getElementById("bookingList");

if (bookingList) {
    const bookings = getData("restaurantBookings");

    bookingList.innerHTML = "";

    if (bookings.length === 0) {
        bookingList.textContent = "No reservations found.";
    } else {
        bookings.slice().reverse().forEach(booking => {
            const card = document.createElement("div");
            card.className = "reservation-item";

            const details = document.createElement("p");

            details.textContent =
                `ID: ${booking.id} | Name: ${booking.name} | Date: ${booking.date} | Time: ${booking.time} | Guests: ${booking.guests} | Table: ${booking.table} | Status: ${booking.status}`;

            card.appendChild(details);

            if (booking.status !== "Cancelled") {
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel Reservation";

                cancelButton.onclick = function() {
                    if (confirm("Cancel this reservation?")) {
                        const allBookings =
                            getData("restaurantBookings");

                        const index = allBookings.findIndex(
                            b => b.id === booking.id
                        );

                        if (index !== -1) {
                            allBookings[index].status = "Cancelled";
                            saveData("restaurantBookings", allBookings);
                            location.reload();
                        }
                    }
                };

                card.appendChild(cancelButton);
            }

            bookingList.appendChild(card);
        });
    }
}
