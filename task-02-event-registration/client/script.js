
// ==========================================
// 1. API CONFIGURATION
// ==========================================

const API_BASE_URL = "http://localhost:5001/api";
const TOKEN_KEY = "eventHubToken";

// ==========================================
// 2. APPLICATION STATE
// ==========================================

let allEvents = [];
let currentUser = null;
let myRegistrations = [];
let organizerEvents = [];

// ==========================================
// 3. DOM ELEMENTS
// ==========================================

const eventsContainer = document.getElementById("eventsContainer");
const eventsMessage = document.getElementById("eventsMessage");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const authSection = document.getElementById("auth");

const authNavLink = document.getElementById("authNavLink");
const logoutBtn = document.getElementById("logoutBtn");

const userDashboard = document.getElementById("userDashboard");
const myRegistrationsContainer = document.getElementById("myRegistrations");

const organizerDashboard = document.getElementById("organizerDashboard");
const createEventForm = document.getElementById("createEventForm");
const organizerEventsContainer = document.getElementById("organizerEvents");
const organizerMessage = document.getElementById("organizerMessage");
const organizerEventsMessage = document.getElementById(
    "organizerEventsMessage"
);

const adminDashboard = document.getElementById("adminDashboard");
const adminEventsContainer = document.getElementById("adminEvents");

// ==========================================
// 4. AUTHENTICATION HELPERS
// ==========================================
const organizerAttendeesSection = document.getElementById(
    "organizerAttendeesSection"
);

const attendeesEventTitle = document.getElementById("attendeesEventTitle");

const organizerAttendeesContainer = document.getElementById(
    "organizerAttendees"
);

const organizerStatisticsSection = document.getElementById("organizerStatisticsSection");
const statisticsEventTitle = document.getElementById("statisticsEventTitle");
const organizerStatisticsContainer = document.getElementById("organizerStatistics");

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

function getAuthHeaders() {
    const token = getToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

function showAuthMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.style.color = isError ? "#dc2626" : "#15803d";
}

function showOrganizerMessage(message, isError = false) {
    organizerMessage.textContent = message;
    organizerMessage.style.color = isError ? "#dc2626" : "#15803d";
}

function showOrganizerEventsMessage(message, isError = false) {
    organizerEventsMessage.textContent = message;
    organizerEventsMessage.style.color = isError ? "#dc2626" : "#15803d";
}

// ==========================================
// 5. UPDATE AUTHENTICATION UI
// ==========================================

function updateAuthUI() {
    const isLoggedIn = Boolean(currentUser);

    authNavLink.textContent = isLoggedIn
        ? `Hello, ${currentUser.name}`
        : "Login / Register";

    authNavLink.href = isLoggedIn
        ? currentUser.role === "organizer"
            ? "#organizerDashboard"
            : currentUser.role === "admin"
                ? "#adminDashboard"
                : "#userDashboard"
        : "#auth";

    logoutBtn.classList.toggle("hidden", !isLoggedIn);
    authSection.classList.toggle("hidden", isLoggedIn);

    userDashboard.classList.add("hidden");
    organizerDashboard.classList.add("hidden");
    adminDashboard.classList.add("hidden");

    if (!isLoggedIn) {
        myRegistrationsContainer.innerHTML = "";
        organizerEventsContainer.innerHTML = "";

        myRegistrations = [];
        organizerEvents = [];

        return;
    }

    if (currentUser.role === "user") {
        userDashboard.classList.remove("hidden");
        fetchMyRegistrations();

    } else if (currentUser.role === "organizer") {
        organizerDashboard.classList.remove("hidden");
        fetchOrganizerEvents();

    } else if (currentUser.role === "admin") {
        adminDashboard.classList.remove("hidden");
        fetchAdminEvents();
    }
}

// ==========================================
// 6. USER REGISTRATION
// ==========================================

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        showAuthMessage("Account created successfully. Please log in.");
        registerForm.reset();

    } catch (error) {
        console.error("Registration error:", error);
        showAuthMessage(error.message, true);
    }
});

// ==========================================
// 7. USER LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        sessionStorage.setItem(TOKEN_KEY, data.token);
        currentUser = data.user;

        loginForm.reset();
        showAuthMessage("Login successful.");

        updateAuthUI();

    } catch (error) {
        console.error("Login error:", error);
        showAuthMessage(error.message, true);
    }
});

// ==========================================
// 8. RESTORE LOGIN SESSION
// ==========================================

async function restoreSession() {
    const token = getToken();

    if (!token) {
        updateAuthUI();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Session expired");
        }

        currentUser = data.user;
        updateAuthUI();

    } catch (error) {
        console.error("Session restoration error:", error);

        sessionStorage.removeItem(TOKEN_KEY);
        currentUser = null;

        updateAuthUI();

        showAuthMessage(
            "Your session has expired. Please log in again.",
            true
        );
    }
}

// ==========================================
// 9. USER LOGOUT
// ==========================================

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(TOKEN_KEY);
    currentUser = null;

    updateAuthUI();

    showAuthMessage("You have been logged out.");

    window.location.hash = "auth";
});

// ==========================================
// 10. FETCH UPCOMING EVENTS
// ==========================================

async function fetchEvents() {
    try {
        eventsMessage.textContent = "Loading events...";

        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch events");
        }

        allEvents = data.events || [];
        filterEvents();

    } catch (error) {
        console.error("Fetch events error:", error);

        eventsContainer.innerHTML = "";
        eventsMessage.textContent =
            "Unable to load events. Please check whether the backend server is running.";
    }
}

// ==========================================
// 11. DISPLAY PUBLIC EVENTS
// ==========================================

function displayEvents(events) {
    eventsContainer.innerHTML = "";

    if (!events || events.length === 0) {
        eventsMessage.textContent = "No upcoming events found.";
        return;
    }

    eventsMessage.textContent = "";

    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";

        const eventDate = new Date(event.date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });

        const availableSeats = Math.max(
            0,
            event.capacity - event.registeredCount
        );

        const category = document.createElement("span");
        category.className = "event-category";
        category.textContent = event.category;

        const title = document.createElement("h3");
        title.textContent = event.title;

        const description = document.createElement("p");
        description.textContent = event.description;

        const date = document.createElement("p");
        date.textContent = `Date: ${eventDate}`;

        const venue = document.createElement("p");
        venue.textContent = `Venue: ${event.venue}`;

        const seats = document.createElement("p");
        seats.textContent = `Available seats: ${availableSeats}`;

        const registerButton = document.createElement("button");
        registerButton.className = "btn btn-primary";

        if (availableSeats === 0) {
            registerButton.textContent = "Event Full";
            registerButton.disabled = true;
        } else {
            registerButton.textContent = "Register";
            registerButton.addEventListener("click", () => {
                registerForEvent(event._id, registerButton);
            });
        }

        eventCard.append(
            category,
            title,
            description,
            date,
            venue,
            seats,
            registerButton
        );

        eventsContainer.appendChild(eventCard);
    });
}

// ==========================================
// 12. REGISTER FOR AN EVENT
// ==========================================

async function registerForEvent(eventId, button) {
    if (!currentUser) {
        alert("Please log in before registering for an event.");
        window.location.hash = "auth";
        return;
    }

    if (currentUser.role !== "user") {
        alert("Only regular users can register through this interface.");
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Registering...";

        const response = await fetch(
            `${API_BASE_URL}/registrations/${eventId}`,
            {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        alert(data.message || "Successfully registered for the event!");

        await fetchEvents();
        await fetchMyRegistrations();

    } catch (error) {
        console.error("Event registration error:", error);

        alert(error.message);

        button.disabled = false;
        button.textContent = "Register";
    }
}

// ==========================================
// 13. FETCH MY REGISTRATIONS
// ==========================================

async function fetchMyRegistrations() {
    try {
        myRegistrationsContainer.innerHTML =
            "<p>Loading your registrations...</p>";

        const response = await fetch(
            `${API_BASE_URL}/registrations/my-registrations`,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load registrations");
        }

        myRegistrations = data.registrations || [];

        displayMyRegistrations(myRegistrations);

    } catch (error) {
        console.error("Fetch registrations error:", error);

        myRegistrationsContainer.innerHTML = "";

        const message = document.createElement("p");
        message.textContent = error.message;

        myRegistrationsContainer.appendChild(message);
    }
}

// ==========================================
// 14. DISPLAY MY REGISTRATIONS
// ==========================================

function displayMyRegistrations(registrations) {
    myRegistrationsContainer.innerHTML = "";

    if (!registrations || registrations.length === 0) {
        myRegistrationsContainer.textContent =
            "You haven't registered for any events yet.";
        return;
    }

    registrations.forEach((registration) => {
        const event = registration.event;

        const card = document.createElement("div");
        card.className = "event-card";

        if (!event) {
            card.textContent = "Event information is unavailable.";
            myRegistrationsContainer.appendChild(card);
            return;
        }

        const title = document.createElement("h3");
        title.textContent = event.title;

        const category = document.createElement("span");
        category.className = "event-category";
        category.textContent = event.category;

        const date = document.createElement("p");
        date.textContent = `Date: ${new Date(event.date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        })}`;

        const venue = document.createElement("p");
        venue.textContent = `Venue: ${event.venue}`;

        const status = document.createElement("p");
        status.textContent = `Registration status: ${registration.status}`;

        const eventStatus = document.createElement("p");
        eventStatus.textContent = `Event status: ${event.status}`;

        card.append(category, title, date, venue, status, eventStatus);

        if (registration.status === "confirmed") {
            const cancelButton = document.createElement("button");

            cancelButton.className = "btn btn-outline";
            cancelButton.textContent = "Cancel Registration";

            cancelButton.addEventListener("click", () => {
                cancelRegistration(event._id, cancelButton);
            });

            card.appendChild(cancelButton);
        }

        myRegistrationsContainer.appendChild(card);
    });
}

// ==========================================
// 15. CANCEL EVENT REGISTRATION
// ==========================================

async function cancelRegistration(eventId, button) {
    const confirmed = confirm(
        "Are you sure you want to cancel this registration?"
    );

    if (!confirmed) {
        return;
    }

    try {
        button.disabled = true;
        button.textContent = "Cancelling...";

        const response = await fetch(
            `${API_BASE_URL}/registrations/${eventId}`,
            {
                method: "DELETE",
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Cancellation failed");
        }

        alert(data.message || "Registration cancelled successfully.");

        await fetchMyRegistrations();
        await fetchEvents();

    } catch (error) {
        console.error("Cancellation error:", error);

        alert(error.message);

        button.disabled = false;
        button.textContent = "Cancel Registration";
    }
}

// ==========================================
// 16. SEARCH AND CATEGORY FILTER
// ==========================================

function filterEvents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value.toLowerCase();

    const filteredEvents = allEvents.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm);

        const matchesCategory =
            !selectedCategory ||
            event.category.toLowerCase() === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayEvents(filteredEvents);
}

searchInput.addEventListener("input", filterEvents);
categoryFilter.addEventListener("change", filterEvents);

// ==========================================
// 17. CREATE EVENT
// ==========================================

createEventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser || !["organizer", "admin"].includes(currentUser.role)) {
        showOrganizerMessage(
            "Only organizers and administrators can create events.",
            true
        );
        return;
    }

    const title = document.getElementById("eventTitle").value.trim();
    const description = document.getElementById("eventDescription").value.trim();
    const category = document.getElementById("eventCategory").value.trim();
    const date = document.getElementById("eventDate").value;
    const venue = document.getElementById("eventVenue").value.trim();
    const capacity = Number(
        document.getElementById("eventCapacity").value
    );

    if (!Number.isInteger(capacity) || capacity < 1) {
        showOrganizerMessage(
            "Capacity must be a positive whole number.",
            true
        );
        return;
    }

    const submitButton = createEventForm.querySelector(
        'button[type="submit"]'
    );

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Creating Event...";

        showOrganizerMessage("");

        const response = await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                title,
                description,
                category,
                date,
                venue,
                capacity,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to create event");
        }

        createEventForm.reset();

        showOrganizerMessage(
            data.message || "Event created successfully."
        );

        // Refresh organizer's event list
        await fetchOrganizerEvents();

        // Refresh public upcoming events
        await fetchEvents();

    } catch (error) {
        console.error("Create event error:", error);

        showOrganizerMessage(error.message, true);

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Event";
    }
});

// ==========================================
// 18. FETCH ORGANIZER EVENTS
// ==========================================

async function fetchOrganizerEvents() {
    if (!currentUser || !["organizer", "admin"].includes(currentUser.role)) {
        return;
    }

    try {
        showOrganizerEventsMessage("Loading your events...");
        organizerEventsContainer.innerHTML = "";

        const response = await fetch(
            `${API_BASE_URL}/events/my-events`,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch your events");
        }

        organizerEvents = data.events || [];

        displayOrganizerEvents(organizerEvents);

    } catch (error) {
        console.error("Fetch organizer events error:", error);

        organizerEventsContainer.innerHTML = "";

        showOrganizerEventsMessage(error.message, true);
    }
}


// ==========================================
// EDIT EVENT
// ==========================================

async function editEvent(event) {
    const title = prompt("Enter event title:", event.title);
    if (title === null) return;

    const description = prompt("Enter event description:", event.description);
    if (description === null) return;

    const category = prompt("Enter event category:", event.category);
    if (category === null) return;

    const currentDate = new Date(event.date);
    const formattedDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16);

    const dateInput = prompt(
        "Enter event date (YYYY-MM-DDTHH:mm):",
        formattedDate
    );
    if (dateInput === null) return;

    const venue = prompt("Enter event venue:", event.venue);
    if (venue === null) return;

    const capacityInput = prompt(
        "Enter event capacity:",
        event.capacity
    );
    if (capacityInput === null) return;

    const capacity = Number(capacityInput);

    if (!Number.isInteger(capacity) || capacity < 1) {
        alert("Capacity must be a positive whole number.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/${event._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    category: category.trim(),
                    date: dateInput,
                    venue: venue.trim(),
                    capacity
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update event.");
        }

        alert(data.message || "Event updated successfully.");

        await fetchOrganizerEvents();
        await fetchEvents();

    } catch (error) {
        console.error("Edit event error:", error);
        alert(error.message);
    }
}


// ==========================================
// CANCEL EVENT
// ==========================================

async function cancelEvent(eventId) {
    const confirmed = confirm(
        "Are you sure you want to cancel this event? This action cannot be undone from this interface."
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/${eventId}/cancel`,
            {
                method: "PATCH",
                headers: {
                    ...getAuthHeaders()
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to cancel event.");
        }

        alert(data.message || "Event cancelled successfully.");

        if (currentUser.role === "admin") {
            await fetchAdminEvents();
        } else if (currentUser.role === "organizer") {
            await fetchOrganizerEvents();
        }

        await fetchEvents();

    } catch (error) {
        console.error("Cancel event error:", error);
        alert(error.message);
    }
}


// ==========================================
// FETCH EVENT ATTENDEES
// ==========================================

async function fetchEventAttendees(eventId) {
    try {
        organizerAttendeesSection.classList.remove("hidden");

        attendeesEventTitle.textContent = "Loading attendees...";
        organizerAttendeesContainer.innerHTML = "";

        const response = await fetch(
            `${API_BASE_URL}/registrations/event/${eventId}`,
            {
                headers: {
                    ...getAuthHeaders()
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch attendees.");
        }

        attendeesEventTitle.textContent =
            `Attendees: ${data.event.title}`;

        displayEventAttendees(data.registrations || []);

        organizerAttendeesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Fetch attendees error:", error);

        attendeesEventTitle.textContent = "Unable to load attendees.";

        organizerAttendeesContainer.textContent = error.message;
    }
}


// ==========================================
// DISPLAY EVENT ATTENDEES
// ==========================================

function displayEventAttendees(registrations) {
    organizerAttendeesContainer.innerHTML = "";

    if (registrations.length === 0) {
        organizerAttendeesContainer.textContent =
            "No registrations found for this event yet.";
        return;
    }

    registrations.forEach((registration) => {
        const card = document.createElement("div");
        card.className = "event-card";

        const userName = document.createElement("h3");
        userName.textContent =
            registration.user?.name || "User information unavailable";

        const email = document.createElement("p");
        email.textContent =
            `Email: ${registration.user?.email || "Unavailable"}`;

        const status = document.createElement("p");
        status.textContent =
            `Registration status: ${registration.status}`;

        const registeredAt = document.createElement("p");
        registeredAt.textContent =
            `Registered on: ${registration.registeredAt
                ? new Date(registration.registeredAt).toLocaleString("en-IN")
                : "Unavailable"}`;

        card.append(userName, email, status, registeredAt);

        organizerAttendeesContainer.appendChild(card);
    });
}

// 18.5 FETCH EVENT STATISTICS
async function fetchEventStatistics(eventId) {
    organizerStatisticsSection.classList.remove("hidden");
    statisticsEventTitle.textContent = "Loading statistics...";
    organizerStatisticsContainer.innerHTML = "<p>Fetching event statistics...</p>";

    try {
        const response = await fetch(
            `${API_BASE_URL}/registrations/event/${eventId}/statistics`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch event statistics");
        }

        const stats = data.statistics;

        statisticsEventTitle.textContent = stats.eventTitle;

        organizerStatisticsContainer.innerHTML = `
            <div class="event-stats-grid">
                <div class="stat-card">
                    <h3>${stats.totalRegistrations}</h3>
                    <p>Total Registrations</p>
                </div>

                <div class="stat-card">
                    <h3>${stats.confirmedRegistrations}</h3>
                    <p>Confirmed Registrations</p>
                </div>

                <div class="stat-card">
                    <h3>${stats.cancelledRegistrations}</h3>
                    <p>Cancelled Registrations</p>
                </div>

                <div class="stat-card">
                    <h3>${stats.availableSeats}</h3>
                    <p>Available Seats</p>
                </div>

                <div class="stat-card">
                    <h3>${stats.registrationPercentage}%</h3>
                    <p>Registration Percentage</p>
                </div>
            </div>
        `;

        organizerStatisticsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        statisticsEventTitle.textContent = "Statistics unavailable";
        organizerStatisticsContainer.innerHTML = `
            <p class="error-message">${error.message}</p>
        `;
    }
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

async function fetchAdminEvents() {
    if (!currentUser || currentUser.role !== "admin") {
        return;
    }

    try {
        adminEventsContainer.innerHTML = "<p>Loading all events...</p>";

        const response = await fetch(
            `${API_BASE_URL}/events/my-events`,
            {
                headers: getAuthHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch events");
        }

        displayAdminEvents(data.events || []);

    } catch (error) {
        console.error("Admin events error:", error);

        adminEventsContainer.textContent = error.message;
    }
}

function displayAdminEvents(events) {
    adminEventsContainer.innerHTML = "";

    if (events.length === 0) {
        adminEventsContainer.textContent = "No events found.";
        return;
    }

    const heading = document.createElement("h3");
    heading.textContent = `All Events (${events.length})`;

    adminEventsContainer.appendChild(heading);

    events.forEach((event) => {
        const card = document.createElement("div");
        card.className = "event-card";

        const title = document.createElement("h3");
        title.textContent = event.title;

        const category = document.createElement("p");
        category.textContent = `Category: ${event.category}`;

        const organizer = document.createElement("p");
        organizer.textContent =
            `Organizer: ${event.organizer?.name || "Not available"}`;

        const date = document.createElement("p");
        date.textContent = `Date: ${new Date(event.date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        )}`;

        const venue = document.createElement("p");
        venue.textContent = `Venue: ${event.venue}`;

        const registration = document.createElement("p");
        registration.textContent =
            `Registrations: ${event.registeredCount} / ${event.capacity}`;

        const status = document.createElement("p");
        status.textContent = `Status: ${event.status}`;

        card.append(
            title,
            category,
            organizer,
            date,
            venue,
            registration,
            status
        );

        const attendeesButton = document.createElement("button");
        attendeesButton.className = "btn btn-primary";
        attendeesButton.textContent = "View Attendees";

        attendeesButton.addEventListener("click", () => {
            fetchEventAttendees(event._id);
        });

        const statisticsButton = document.createElement("button");
        statisticsButton.className = "btn btn-primary";
        statisticsButton.textContent = "View Statistics";

        statisticsButton.addEventListener("click", () => {
            fetchEventStatistics(event._id);
        });

        card.append(attendeesButton, statisticsButton);

        // Admin event management buttons
        if (event.status === "upcoming") {
            const editButton = document.createElement("button");
            editButton.className = "btn btn-primary";
            editButton.textContent = "Edit Event";

            editButton.addEventListener("click", () => {
                editEvent(event);
            });

            const cancelButton = document.createElement("button");
            cancelButton.className = "btn btn-outline";
            cancelButton.textContent = "Cancel Event";

            cancelButton.addEventListener("click", () => {
                cancelEvent(event._id);
            });

            card.append(editButton, cancelButton);
        }

        adminEventsContainer.appendChild(card);
    });
}

// ==========================================
// 19. DISPLAY ORGANIZER EVENTS
// ==========================================


function displayOrganizerEvents(events) {
    organizerEventsContainer.innerHTML = "";

    if (!events || events.length === 0) {
        showOrganizerEventsMessage(
            "You haven't created any events yet."
        );
        return;
    }

    showOrganizerEventsMessage("");

    events.forEach((event) => {
        const card = document.createElement("div");
        card.className = "event-card";

        const category = document.createElement("span");
        category.className = "event-category";
        category.textContent = event.category;

        const title = document.createElement("h3");
        title.textContent = event.title;

        const description = document.createElement("p");
        description.textContent = event.description;

        const date = document.createElement("p");
        date.textContent = `Date: ${new Date(event.date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        )}`;

        const venue = document.createElement("p");
        venue.textContent = `Venue: ${event.venue}`;

        const capacity = document.createElement("p");
        capacity.textContent = `Capacity: ${event.capacity}`;

        const registered = document.createElement("p");
        registered.textContent =
            `Registered: ${event.registeredCount} / ${event.capacity}`;

        const availableSeats = Math.max(
            0,
            event.capacity - event.registeredCount
        );

        const available = document.createElement("p");
        available.textContent = `Available seats: ${availableSeats}`;

        const status = document.createElement("p");
        status.textContent = `Status: ${event.status}`;

        card.append(
            category,
            title,
            description,
            date,
            venue,
            capacity,
            registered,
            available,
            status
        );

        // View attendees button
        const attendeesButton = document.createElement("button");

        attendeesButton.className = "btn btn-primary";
        attendeesButton.textContent = "View Attendees";

        attendeesButton.addEventListener("click", () => {
            fetchEventAttendees(event._id);
        });

        card.appendChild(attendeesButton);

        const statisticsButton = document.createElement("button");
        statisticsButton.className = "btn btn-primary";
        statisticsButton.textContent = "View Statistics";

        statisticsButton.addEventListener("click", () => {
            fetchEventStatistics(event._id);
        });

        card.appendChild(statisticsButton);

        // Show management buttons only for upcoming events
        if (event.status === "upcoming") {
            const editButton = document.createElement("button");
            editButton.className = "btn btn-primary";
            editButton.textContent = "Edit Event";

            editButton.addEventListener("click", () => {
                editEvent(event);
            });

            const cancelButton = document.createElement("button");
            cancelButton.className = "btn btn-outline";
            cancelButton.textContent = "Cancel Event";

            cancelButton.addEventListener("click", () => {
                cancelEvent(event._id);
            });

            card.append(editButton, cancelButton);
        }

        organizerEventsContainer.appendChild(card);
    });
}

// ==========================================
// 20. INITIALIZE APPLICATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    fetchEvents();
    restoreSession();
});
