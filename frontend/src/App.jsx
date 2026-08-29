import { useState, useEffect } from 'react'
import './App.css'

import logo from './assets/VK-logo.png'
import birthday from './assets/gallery/birthday.jpeg'
import reception from './assets/gallery/reception.jpeg'
import convocation from './assets/gallery/convocation .jpg'
import inauguration from './assets/gallery/inauguration.jpg'
import eventImage from './assets/gallery/event.jpg'
import wedding from './assets/gallery/wedding.jpg'

const API_URL = "https://vk-events.onrender.com";
function App() {
  const [booking, setBooking] = useState({
    name: '',
    phone: '',
    event_type: '',
    event_date: '',
    location: '',
    guests: '',
    message: ''
  })

  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
const [eventsLoading, setEventsLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const handleAdminLogin = () => {
  const username = prompt('Enter Admin Username:')
  const password = prompt('Enter Admin Password:')

  if (username === 'Vishal_Chouksey' && password === 'VK@2122') {
    setIsAdmin(true)

setTimeout(() => {
  document.getElementById('dashboard')?.scrollIntoView({
    behavior: 'smooth'
  })
}, 100)
  } else {
    alert('Invalid admin username or password.')
  }
}

  /* =========================
     DASHBOARD COUNTS
     ========================= */

  const totalEnquiries = bookings.length

  const weddingEnquiries = bookings.filter(
    (item) => item.event_type === 'Wedding'
  ).length

  const birthdayEnquiries = bookings.filter(
    (item) => item.event_type === 'Birthday Party'
  ).length

  const convocationEnquiries = bookings.filter(
    (item) => item.event_type === 'Convocation'
  ).length

  const inaugurationEnquiries = bookings.filter(
    (item) => item.event_type === 'Inauguration'
  ).length

  /* =========================
     BOOKING FORM
     ========================= */
    
     const fetchEvents = async () => {
  try {
    setEventsLoading(true)

    const response = await fetch(`${API_URL}/api/events`)
    const data = await response.json()

    if (response.ok && data.success) {
      setEvents(data.events || [])
    } else {
      console.error('Failed to load events:', data)
    }
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    setEventsLoading(false)
  }
}
  const handleBookingChange = (e) => {

    const { name, value } = e.target

    setBooking((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  /* =========================
     FETCH BOOKINGS
     ========================= */

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true)

      const response = await fetch(`${API_URL}/api/bookings`)
      const data = await response.json()

      if (response.ok && data.success) {
        setBookings(data.bookings || [])
      } else {
        console.error('Failed to load bookings:', data)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])
  useEffect(() => {
  fetchEvents()
}, [])
useEffect(() => {
  if (isAdmin) {
    setTimeout(() => {
      document.getElementById('dashboard')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 300)
  }
}, [isAdmin])

  /* =========================
     DELETE BOOKING
     ========================= */

  const handleDeleteBooking = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this enquiry?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${id}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Enquiry deleted successfully.')

        setBookings((previousBookings) =>
          previousBookings.filter(
            (booking) => booking.id !== id
          )
        )
      } else {
        alert(data.message || 'Unable to delete enquiry.')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Unable to connect to the VK EVENTS server.')
    }
  }

  /* =========================
     SUBMIT BOOKING
     ========================= */
const handleBookingSubmit = async (e) => {
  e.preventDefault()

  const form = e.currentTarget

  // Get values directly from the form
  const name = form.elements.name.value.trim()
  const phone = form.elements.phone.value.trim()
  const event_type = form.elements.event_type.value
  const event_date = form.elements.event_date.value
  const location = form.elements.location.value.trim()
  const guests = form.elements.guests.value
  const message = form.elements.message.value.trim()

  // Check required fields
  if (
    !name ||
    !phone ||
    !event_type ||
    !event_date ||
    !location
  ) {
    alert('Please fill all required booking fields.')
    return
  }

  // Prepare booking data
  const bookingData = {
    name: name,
    phone: phone,
    event_type: event_type,
    event_date: event_date,
    location: location,
    guests: guests === '' ? null : Number(guests),
    message: message
  }

  console.log('BOOKING DATA:', bookingData)

  try {
    const response = await fetch(
      `${API_URL}/api/bookings`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(bookingData)
      }
    )

    const data = await response.json()

    console.log('Response status:', response.status)
    console.log('Server response:', data)

    if (response.ok && data.success) {

      alert(
        'Booking enquiry submitted successfully!'
      )

      // Clear React form state
      setBooking({
        name: '',
        phone: '',
        event_type: '',
        event_date: '',
        location: '',
        guests: '',
        message: ''
      })

      // Refresh enquiries
      fetchBookings()

    } else {

      alert(
        data.message ||
        'Unable to submit enquiry.'
      )

    }

  } catch (error) {

    console.error(
      'Booking error:',
      error
    )

    alert(
      'Unable to connect to the VK EVENTS server.'
    )
  }
}

  /* =========================
     GALLERY
     ========================= */

  const galleryImages = [
    {
      image: wedding,
      title: 'Wedding Events',
      category: 'Wedding'
    },
    {
      image: birthday,
      title: 'Birthday Celebrations',
      category: 'Birthday Party'
    },
    {
      image: reception,
      title: 'Wedding Reception',
      category: 'Wedding Function'
    },
    {
      image: convocation,
      title: 'Convocation Ceremony',
      category: 'Convocation'
    },
    {
      image: inauguration,
      title: 'Inauguration Events',
      category: 'Inauguration'
    },
    {
      image: eventImage,
      title: 'Special Events',
      category: 'Other Events'
    }
  ]

  /* =========================
     UPCOMING BOOKINGS
     ========================= */

  const upcomingBookings = bookings
    .filter((item) => {
      if (!item.event_date) {
        return false
      }

      const eventDate = new Date(
        `${item.event_date}T00:00:00`
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return eventDate >= today
    })
    .sort((a, b) => {
      return (
        new Date(a.event_date) -
        new Date(b.event_date)
      )
    })

  return (
    <>
    <a
  href="#home"
  className="back-to-top"
  aria-label="Back to top"
>
  ↑
</a>
      {/* =========================
          NAVBAR
          ========================= */}

      <nav className="navbar">

        <div className="brand">

          <img
            src={logo}
            alt="VK Events Logo"
            className="navbar-logo"
          />

          <div className="brand-text">

            <h2>VK EVENTS</h2>

            <span>
              Making Your Special Moments Unforgettable
            </span>

          </div>

        </div>

        <div className="nav-links">

          <a href="#home">Home</a>

         {isAdmin && (
  <a href="#dashboard">Dashboard</a>
)}

          <a href="#events">Events</a>

          <a href="#services">Services</a>
           <a href="#process">How We Work</a>
          <a href="#why">Why Us</a>
          <a href="#expertise">Expertise</a>
           <a href="#gallery">Gallery</a>
          <a href="#about">About</a>

          <a href="#contact">Contact</a>
          {isAdmin ? (
  <button
    className="admin-login-btn"
    onClick={() => setIsAdmin(false)}
  >
    Logout
  </button>
) : (
  <button
    className="admin-login-btn"
    onClick={handleAdminLogin}
  >
    Admin Login
  </button>
)}
          <a href="#bookings">Enquiries</a>

        </div>

      </nav>

      {/* =========================
          HERO
          ========================= */}

      <section
        id="home"
        className="hero-section"
      >

        <div className="hero-content">

          <p className="hero-small-title">
            VK EVENTS & SERVICES
          </p>

          <h1>
            Let us handle 
            <span> the Magic while you </span>
            enjoy the Spotlight!!
          </h1>

          <div className="hero-line"></div>

          <p className="hero-description">
            From beautiful weddings and birthday
            celebrations to memorable convocations
            and grand inaugurations, we create
            elegant and unforgettable experiences.
          </p>

          <div className="hero-buttons">

            <a
              href="#events"
              className="hero-main-button"
            >
              Explore Events
            </a>

            <a
              href="#contact"
              className="hero-outline-button"
            >
              Book Your Event
            </a>

          </div>

        </div>

        <div className="hero-decoration-circle">

          <div className="circle-ring"></div>

          <div className="hero-center-logo">

            <img
              src={logo}
              alt="VK Events"
            />

          </div>

          <span className="circle-text">
            CELEBRATE • CREATE • MEMORABLE •
          </span>

        </div>

      </section>

      {/* =========================
          DASHBOARD
          ========================= */}

     {isAdmin && (
  <section
    id="dashboard"
    className="dashboard-section"
  >
    
    

        <div className="section-heading">

          <p>
            VK EVENTS MANAGEMENT
          </p>

          <h2>
            Admin Dashboard
          </h2>

          <div className="gold-line"></div>

        </div>

        <div className="dashboard-welcome">

          <div>

            <h3>
              Welcome to VK EVENTS
            </h3>

            <p>
              Manage your event enquiries and
              monitor customer requests from
              one place.
            </p>

          </div>

          <div className="dashboard-status">

            <span className="status-dot"></span>

            System Active

          </div>

        </div>

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              📋
            </div>

            <div>

              <span>
                Total Enquiries
              </span>

              <strong>
                {totalEnquiries}
              </strong>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              💍
            </div>

            <div>

              <span>
                Wedding
              </span>

              <strong>
                {weddingEnquiries}
              </strong>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🎂
            </div>

            <div>

              <span>
                Birthday
              </span>

              <strong>
                {birthdayEnquiries}
              </strong>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🎓
            </div>

            <div>

              <span>
                Convocation
              </span>

              <strong>
                {convocationEnquiries}
              </strong>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-card-icon">
              🎊
            </div>

            <div>

              <span>
                Inauguration
              </span>

              <strong>
                {inaugurationEnquiries}
              </strong>

            </div>

          </div>

        </div>

        <div className="dashboard-bottom">

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <p>
                  RECENT ACTIVITY
                </p>

                <h3>
                  Recent Enquiries
                </h3>

              </div>

              <a href="#bookings">
                View All
              </a>

            </div>

            {bookings.length === 0 ? (

              <div className="dashboard-empty">

                <span>📋</span>

                <p>
                  No enquiries available yet.
                </p>

              </div>

            ) : (

              <div className="recent-enquiries">

                {bookings
                  .slice(-5)
                  .reverse()
                  .map((item) => (

                    <div
                      className="recent-enquiry"
                      key={item.id}
                    >

                      <div className="recent-avatar">

                        {item.name
                          ? item.name
                              .charAt(0)
                              .toUpperCase()
                          : 'C'}

                      </div>

                      <div className="recent-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.event_type}
                        </span>

                      </div>

                      <div className="recent-date">
                        {item.event_date}
                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <p>
                  EVENT CATEGORIES
                </p>

                <h3>
                  Enquiry Overview
                </h3>

              </div>

            </div>

            <div className="category-row">

              <span>
                Wedding
              </span>

              <strong>
                {weddingEnquiries}
              </strong>

            </div>

            <div className="category-row">

              <span>
                Birthday Party
              </span>

              <strong>
                {birthdayEnquiries}
              </strong>

            </div>

            <div className="category-row">

              <span>
                Convocation
              </span>

              <strong>
                {convocationEnquiries}
              </strong>

            </div>

            <div className="category-row">

              <span>
                Inauguration
              </span>

              <strong>
                {inaugurationEnquiries}
              </strong>

            </div>

            <div className="category-row">

              <span>
                Other Events
              </span>

              <strong>

                {bookings.filter(
                  (item) =>
                    item.event_type !==
                      'Wedding' &&
                    item.event_type !==
                      'Birthday Party' &&
                    item.event_type !==
                      'Convocation' &&
                    item.event_type !==
                      'Inauguration'
                ).length}

              </strong>

            </div>

          </div>

        </div>

        {/* =========================
            UPCOMING EVENTS
            ========================= */}

        <div className="upcoming-events-panel">

          <div className="dashboard-panel-header">

            <div>

              <p>
                EVENT SCHEDULE
              </p>

              <h3>
                Upcoming Events
              </h3>

            </div>

          </div>

          <div className="upcoming-events-list">

         {eventsLoading ? (
  <p className="contact-intro">
    Loading upcoming events...
  </p>
) : events.length === 0 ? (
  <p className="contact-intro">
    No upcoming events found.
  </p>
) : (
  events.map((event) => {
    const eventDate = new Date(event.date)

    return (
      <div
        className="upcoming-event"
        key={event.id}
      >
        <div className="upcoming-event-date">
          <span>
            {eventDate.getDate()}
          </span>

          <small>
            {eventDate
              .toLocaleString('en-US', {
                month: 'short'
              })
              .toUpperCase()}
          </small>
        </div>

        <div className="upcoming-event-info">
          <h4>{event.name}</h4>

          <p>
            📍 {event.location}
          </p>
        </div>

        <span className="upcoming-event-type">
          {event.event_type}
        </span>
      </div>
    )
  })
)}

          </div>

        </div>

      </section>
      )}

      {/* =========================
          EVENTS
          ========================= */}

      <section
        id="events"
        className="events-section"
      >

        <div className="section-heading">

          <p>
            CELEBRATE WITH US
          </p>

          <h2>
            Upcoming Events
          </h2>

          <div className="gold-line"></div>

        </div>
        <div className="event-cards">

          {eventsLoading ? (

            <p className="contact-intro">
              Loading events...
            </p>

          ) : events.length === 0 ? (

            <p className="contact-intro">
              No upcoming events available.
            </p>

          ) : (

            events.map((event) => {

              const eventDate = new Date(event.date)

              return (

                <div
                  className="event-card"
                  key={event.id}
                >

                  <img
                    src={
                      event.event_type === 'Wedding'
                        ? wedding
                        : event.event_type === 'Birthday Party'
                        ? birthday
                        : event.event_type === 'Convocation'
                        ? convocation
                        : event.event_type === 'Inauguration'
                        ? inauguration
                        : eventImage
                    }
                    alt={event.event_type}
                    className="event-image"
                  />

                  <div className="event-card-content">

                    <h3>
                      {event.name}
                    </h3>

                    <p>
                      📅{' '}
                      {eventDate.toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                    </p>

                    <p>
                      📍 {event.location}
                    </p>

                    <p>
                      🏷️ {event.event_type}
                    </p>

                  </div>

                </div>

              )

            })

          )}

        </div>

      </section>

     {/* =========================
    SERVICES
    ========================= */}

<section
  id="services"
  className="services-section"
>

  <div className="section-heading">

    <p>
      WHAT WE DO
    </p>

    <h2>
      Our Services
    </h2>

    <div className="gold-line"></div>

  </div>

  <p className="contact-intro">
    From intimate celebrations to large-scale events,
    VK EVENTS & SERVICES provides complete event
    management with creativity, precision and
    professional execution.
  </p>

  <div className="service-cards">

    <div className="service-card">

      <div className="service-icon">
        💍
      </div>

      <h3>
        Social Events
      </h3>

      <p>
        Weddings, birthday celebrations,
        family functions and other special
        occasions planned around your vision.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🏢
      </div>

      <h3>
        Corporate Events
      </h3>

      <p>
        Professional event planning and
        coordination for corporate gatherings,
        meetings and special occasions.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🎤
      </div>

      <h3>
        Public Events
      </h3>

      <p>
        Organized event solutions for public
        celebrations and larger gatherings.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        👥
      </div>

      <h3>
        Guest Management
      </h3>

      <p>
        Smooth guest coordination and
        professional management throughout
        your event.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        ✨
      </div>

      <h3>
        Decor & Design
      </h3>

      <p>
        Creative decoration and event design
        that transforms your venue into a
        memorable setting.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        📸
      </div>

      <h3>
        Photography & Videography
      </h3>

      <p>
        Professional photography and
        videography to capture your
        important moments.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🍽️
      </div>

      <h3>
        Catering & Food Services
      </h3>

      <p>
        Carefully planned food and catering
        services for a comfortable and
        enjoyable guest experience.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🎧
      </div>

      <h3>
        Audio & Visuals
      </h3>

      <p>
        Audio-visual arrangements designed
        to support smooth and engaging
        event experiences.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🎭
      </div>

      <h3>
        Artists & Entertainers
      </h3>

      <p>
        Entertainment and artist coordination
        to make your celebration lively
        and memorable.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🚗
      </div>

      <h3>
        Transport & Valet Parking
      </h3>

      <p>
        Convenient transportation and
        parking arrangements for your
        guests.
      </p>

    </div>

    <div className="service-card">

      <div className="service-icon">
        🛡️
      </div>

      <h3>
        Security & Safety
      </h3>

      <p>
        Professional safety and security
        arrangements for a smooth event.
      </p>

    </div>

  </div>

</section>
 {/* =========================
    HOW WE WORK
    ========================= */}

<section
  id="process"
  className="process-section"
>

  <div className="section-heading">

    <p>
      OUR PROCESS
    </p>

    <h2>
      How We Work
    </h2>

    <div className="gold-line"></div>

  </div>

  <p className="contact-intro">
    From the first conversation to the final
    celebration, we carefully manage every
    stage of your event.
  </p>

  <div className="process-cards">

    <div className="process-card">

      <span className="process-number">
        01
      </span>

      <div className="process-icon">
        💡
      </div>

      <h3>
        Understanding Your Vision
      </h3>

      <p>
        We listen carefully to your ideas,
        requirements and expectations to
        understand the event you envision.
      </p>

    </div>

    <div className="process-card">

      <span className="process-number">
        02
      </span>

      <div className="process-icon">
        📋
      </div>

      <h3>
        Detailed Planning & Coordination
      </h3>

      <p>
        Our team develops a detailed plan
        covering timelines, vendors, logistics
        and every important requirement.
      </p>

    </div>

    <div className="process-card">

      <span className="process-number">
        03
      </span>

      <div className="process-icon">
        ✨
      </div>

      <h3>
        Creative Execution
      </h3>

      <p>
        We bring your ideas to life through
        creative concepts, elegant design
        and professional execution.
      </p>

    </div>

    <div className="process-card">

      <span className="process-number">
        04
      </span>

      <div className="process-icon">
        🎯
      </div>

      <h3>
        On-Site Management & Support
      </h3>

      <p>
        Our team coordinates the event on-site
        and ensures everything runs smoothly
        from beginning to end.
      </p>

    </div>

  </div>

</section>
      

      {/* =========================
          WHY US
          ========================= */}

      <section
        id="why"
        className="why-section"
      >

        <div className="section-heading">

          <p>
            WHY CHOOSE US
          </p>

          <h2>
            Why VK EVENTS?
          </h2>

          <div className="gold-line"></div>

        </div>

        <div className="why-cards">

          <div className="why-card">

            <span className="why-number">
              01
            </span>

            <h3>
              Creative & Elegant Planning
            </h3>

            <p>
              Creative concepts and elegant
              details for memorable events.
            </p>

          </div>

          <div className="why-card">

            <span className="why-number">
              02
            </span>

            <h3>
              Complete Event Management
            </h3>

            <p>
              We manage planning, decoration
              and execution.
            </p>

          </div>

          <div className="why-card">

            <span className="why-number">
              03
            </span>

            <h3>
              Customized Celebrations
            </h3>

            <p>
              Services tailored to your
              requirements and vision.
            </p>

          </div>

          <div className="why-card">

            <span className="why-number">
              04
            </span>

            <h3>
              Trusted & Dedicated Service
            </h3>

            <p>
              Professional service and
              smooth coordination.
            </p>

          </div>

        </div>

      </section>

      {/* =========================
          GALLERY
          ========================= */}
        {/* =========================
    OUR EXPERTISE
    ========================= */}

<section
  id="expertise"
  className="expertise-section"
>

  <div className="section-heading">

    <p>
      OUR EXPERTISE
    </p>

    <h2>
      Everything You Need for a Perfect Event
    </h2>

    <div className="gold-line"></div>

  </div>

  <p className="contact-intro">
    We bring together creativity, planning and
    professional coordination to make every
    celebration memorable.
  </p>

  <div className="expertise-grid">

    <div className="expertise-item">
      <span>01</span>
      <h3>Event Planning</h3>
      <p>
        Complete planning and coordination
        tailored to your event.
      </p>
    </div>

    <div className="expertise-item">
      <span>02</span>
      <h3>Venue Management</h3>
      <p>
        Professional venue preparation and
        smooth event-day coordination.
      </p>
    </div>

    <div className="expertise-item">
      <span>03</span>
      <h3>Creative Design</h3>
      <p>
        Elegant themes, decoration and
        creative event concepts.
      </p>
    </div>

    <div className="expertise-item">
      <span>04</span>
      <h3>Guest Experience</h3>
      <p>
        Thoughtful arrangements focused on
        guest comfort and experience.
      </p>
    </div>

    <div className="expertise-item">
      <span>05</span>
      <h3>Entertainment</h3>
      <p>
        Artists, entertainment and activities
        suited to your celebration.
      </p>
    </div>

    <div className="expertise-item">
      <span>06</span>
      <h3>Event Support</h3>
      <p>
        Dedicated on-site support from setup
        through the completion of your event.
      </p>
    </div>

  </div>

</section>
      <section
        id="gallery"
        className="gallery-section"
      >

        <div className="section-heading">

          <p>
            OUR WORK
          </p>

          <h2>
            Event Gallery
          </h2>

          <div className="gold-line"></div>

        </div>

        <div className="gallery-grid">

          {galleryImages.map(
            (item, index) => (

              <div
                className="gallery-item"
                key={index}
                onClick={() =>
                  setSelectedGalleryIndex(
                    index
                  )
                }
              >

                <img
                  src={item.image}
                  alt={item.title}
                />

                <div className="gallery-overlay">

                  <span>
                    {item.category}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

        {selectedGalleryIndex !== null && (

          <div
            className="gallery-lightbox"
            onClick={() =>
              setSelectedGalleryIndex(null)
            }
          >

            <div
              className="lightbox-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                className="lightbox-close"
                onClick={() =>
                  setSelectedGalleryIndex(null)
                }
              >
                ×
              </button>

              <img
                src={
                  galleryImages[
                    selectedGalleryIndex
                  ].image
                }
                alt={
                  galleryImages[
                    selectedGalleryIndex
                  ].title
                }
                className="lightbox-image"
              />

              <div className="lightbox-info">

                <p>
                  {
                    galleryImages[
                      selectedGalleryIndex
                    ].category
                  }
                </p>

                <h2>
                  {
                    galleryImages[
                      selectedGalleryIndex
                    ].title
                  }
                </h2>

                <span>
                  {selectedGalleryIndex + 1}
                  {' / '}
                  {galleryImages.length}
                </span>

              </div>

            </div>

          </div>

        )}

      </section>

      {/* =========================
          ABOUT
          ========================= */}

      <section
        id="about"
        className="about-section"
      >

        <div className="about-content">

          <div className="about-badge">
            VK
          </div>

          <div>

            <div className="section-heading left-heading">

              <p>
                WHO WE ARE
              </p>

              <h2>
                About VK EVENTS
              </h2>

              <div className="gold-line"></div>

            </div>

            <p className="about-text">

              Welcome to VK EVENTS & SERVICES,
              where creativity meets precision.
              We are a dynamic event management
              company dedicated to crafting
              unforgettable experiences for
              every occasion.

              <br />
              <br />

              Whether it is a dream wedding,
              a corporate event, a birthday
              celebration, a convocation ceremony,
              or a grand inauguration, we bring
              your vision to life through creativity,
              innovation, and meticulous planning.

              <br />
              <br />

              From concept to flawless execution,
              our team ensures that every event
              becomes a memorable experience
              while you enjoy every special moment.

            </p>

          </div>

        </div>

      </section>

      {/* =========================
          CONTACT / BOOKING
          ========================= */}

      <section
        id="contact"
        className="contact-section"
      >

        <div className="section-heading">

          <p>
            LET'S CREATE SOMETHING SPECIAL
          </p>

          <h2>
            Book Your Event
          </h2>

          <div className="gold-line"></div>

        </div>

        <p className="contact-intro">
          Tell us about your event and our
          team will get in touch.
        </p>

        <form
          className="booking-form"
          onSubmit={handleBookingSubmit}
        >

          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={booking.name}
            onChange={handleBookingChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={booking.phone}
            onChange={handleBookingChange}
          />

          <select
            name="event_type"
            value={booking.event_type}
            onChange={handleBookingChange}
          >

            <option value="">
              Select Event Type *
            </option>

            <option value="Wedding">
              Wedding
            </option>

            <option value="Wedding Function">
              Wedding Function
            </option>

            <option value="Birthday Party">
              Birthday Party
            </option>

            <option value="Convocation">
              Convocation
            </option>

            <option value="Inauguration">
              Inauguration
            </option>

            <option value="Other Celebration">
              Other Celebration
            </option>

          </select>

          <input
            type="date"
            name="event_date"
            value={booking.event_date}
            onChange={handleBookingChange}
          />

          <input
            type="text"
            name="location"
            placeholder="Event Location *"
            value={booking.location}
            onChange={handleBookingChange}
          />

          <input
            type="number"
            name="guests"
            placeholder="Number of Guests"
            min="1"
            value={booking.guests}
            onChange={handleBookingChange}
          />

          <textarea
            name="message"
            placeholder="Tell us about your requirements"
            value={booking.message}
            onChange={handleBookingChange}
          ></textarea>

          <button type="submit">
            Send Enquiry
          </button>

          <a
            href="tel:+919424455947"
            className="call-button"
          >
            Call Now
          </a>

          <a
            href="https://wa.me/919424455947?text=Hello%20VK%20EVENTS,%20I%20would%20like%20to%20enquire%20about%20an%20event."
            className="whatsapp-button"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Us
          </a>

        </form>

        <div className="contact-info">

          <div className="contact-item">

            <span>
              📧
            </span>

            <p>
              vkevents.services06@gmail.com
            </p>

          </div>

          <div className="contact-item">

            <span>
              📞
            </span>

            <p>
              +91 94244 55947
            </p>

          </div>

        </div>

      </section>
   

      {/* =========================
          CUSTOMER ENQUIRIES
          ========================= */}

     <section id="bookings" className="bookings-section">

  <div className="section-heading">
    <p>VK EVENTS MANAGEMENT</p>

    <h2>Customer Enquiries</h2>

    <div className="gold-line"></div>
    
    <button
  type="button"
  className="refresh-enquiries-btn"
  onClick={fetchBookings}
>
  ↻ Refresh Enquiries
</button>
    </div>

  <div className="enquiry-search">
    <input
      type="text"
      placeholder="Search by name, phone, event or location..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <div className="enquiries-header">

    <div>
      <h3>All Customer Enquiries</h3>


      <p>
        Manage and review customer event requests.
      </p>
    </div>

    <div className="enquiries-count">
      <span>Total</span>
      <strong>{bookings.length}</strong>
    </div>

  </div>

  {bookingsLoading ? (

    <div className="dashboard-empty">
      <span>📋</span>

      <p>
        Loading customer enquiries...
      </p>
    </div>

  ) : bookings.length === 0 ? (

    <div className="dashboard-empty">
      <span>📋</span>

      <p>
        No customer enquiries found.
      </p>
    </div>

  ) : (

    <div className="bookings-table-wrapper">

      <table className="bookings-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Event</th>
            <th>Date</th>
            <th>Location</th>
            <th>Guests</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

         {bookings
  .filter((item) => {
    const search = searchTerm.toLowerCase()

    return (
      item.name?.toLowerCase().includes(search) ||
      item.phone?.toLowerCase().includes(search) ||
      item.event_type?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search)
    )
  })
  .map((item) => (

            <tr key={item.id}>

              <td>
                <strong className="customer-name">
                  {item.name}
                </strong>
              </td>

              <td>
                <span className="customer-phone">
                  {item.phone}
                </span>
              </td>

              <td>
                <span className="event-badge">
                  {item.event_type}
                </span>
              </td>

              <td>
  {item.event_date
    ? new Date(item.event_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-"}
</td>

              <td>
                {item.location}
              </td>

              <td>
                {item.guests || '-'}
              </td>

              <td className="message-cell">
                {item.message || '-'}
              </td>
<td>

  <button
    type="button"
    className="view-booking-button"
    onClick={() => setSelectedBooking(item)}
  >
    View
  </button>

  <button
    type="button"
    className="delete-booking-button"
    onClick={() => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this enquiry?"
      );

      if (confirmed) {
        handleDeleteBooking(item.id);
      }
    }}
  >
    Delete
  </button>

</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</section>
{selectedBooking && (
  <div
    className="booking-modal-overlay"
    onClick={() => setSelectedBooking(null)}
  >
    <div
      className="booking-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="booking-modal-close"
        onClick={() => setSelectedBooking(null)}
      >
        ×
      </button>

      <p className="modal-label">
        CUSTOMER ENQUIRY
      </p>

      <h2>
        {selectedBooking.name}
      </h2>

      <div className="booking-details">

        <p>
          <strong>Phone:</strong>{" "}
          {selectedBooking.phone}
        </p>

        <p>
          <strong>Event:</strong>{" "}
          {selectedBooking.event_type}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {selectedBooking.event_date
            ? new Date(
                selectedBooking.event_date
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {selectedBooking.location || "-"}
        </p>

        <p>
          <strong>Guests:</strong>{" "}
          {selectedBooking.guests || "-"}
        </p>

        <p>
          <strong>Message:</strong>{" "}
          {selectedBooking.message || "-"}
        </p>

      </div>

      <button
        className="close-details-button"
        onClick={() => setSelectedBooking(null)}
      >
        Close
      </button>

    </div>
  </div>
)}
      {/* =========================
          FOOTER
          ========================= */}

      <footer>

        <div className="footer-logo">

          <img
            src={logo}
            alt="VK Events Logo"
          />

          <div>

            <h3>
              VK EVENTS
            </h3>

            <p>
              Making Your Special Moments
              Unforgettable.
            </p>

          </div>

        </div>

        <div className="footer-line"></div>

        <p className="copyright">
          © 2026 VK EVENTS & SERVICES.
          All rights reserved.
        </p>

      </footer>

    </>
  )
}

export default App