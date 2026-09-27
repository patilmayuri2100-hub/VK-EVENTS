import { useState, useEffect } from 'react'
import './App.css'

import logo from './assets/VK-logo.png'
import birthday from './assets/gallery/birthday.jpeg'
import reception from './assets/gallery/reception.jpeg'
import convocation from './assets/gallery/convocation .jpg'
import inauguration from './assets/gallery/inauguration.jpg'
import eventImage from './assets/gallery/event.jpg'
import wedding from './assets/gallery/wedding.jpg'
import vishalFounder from './assets/vishal-founder.jpeg'

const API_URL ="https://vk-events.onrender.com";
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
  const [eventFilter, setEventFilter] = useState('All')
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [eventsLoading, setEventsLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [newEvent, setNewEvent] = useState({
    
  name: '',
  date: '',
  location: '',
  event_type: ''
})
const [galleryTitle, setGalleryTitle] = useState('')
const [galleryCategory, setGalleryCategory] = useState('')
const [galleryFile, setGalleryFile] = useState(null)
const [galleryUploading, setGalleryUploading] = useState(false)
const [uploadedGalleryImages, setUploadedGalleryImages] = useState([])
const [videoTitle, setVideoTitle] = useState('')
const [videoCategory, setVideoCategory] = useState('')
const [videoFile, setVideoFile] = useState(null)
const [videoUploading, setVideoUploading] = useState(false)
const [uploadedVideos, setUploadedVideos] = useState([])
const [reviews, setReviews] = useState([])
const [adminReviews, setAdminReviews] = useState([])
const [reviewForm, setReviewForm] = useState({
  name: '',
  rating: 5,
  comment: ''
})

const [reviewSubmitting, setReviewSubmitting] = useState(false)
const submitReview = async (e) => {
  e.preventDefault();

  if (!reviewForm.name || !reviewForm.comment) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    setReviewSubmitting(true);

    const response = await fetch(
      "https://vk-events.onrender.com/api/reviews",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewForm)
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to submit review.");
      return;
    }

    alert(
      "Thank you for your review! It will appear after admin approval."
    );

    setReviewForm({
      name: "",
      rating: 5,
      comment: ""
    });

  } catch (error) {
    console.error("Review submission error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setReviewSubmitting(false);
  }
};
const handleEventChange = (e) => {
  const { name, value } = e.target

  setNewEvent((prev) => ({
    ...prev,
    [name]: value
  }))
}
const handleAddEvent = async (e) => {
  e.preventDefault()

  if (
    !newEvent.name ||
    !newEvent.date ||
    !newEvent.location ||
    !newEvent.event_type
  ) {
    alert("Please fill all event fields.")
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newEvent)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to add event.")
      return
    }

    alert("Event added successfully!")

    setNewEvent({
      name: "",
      date: "",
      location: "",
      event_type: ""
    })

    fetchEvents()

  } catch (error) {
    console.error("Add event error:", error)
    alert("Unable to connect to VK EVENTS server.")
  }
}
const fetchGalleryImages = async () => {

  try {

    const response = await fetch(
      `${API_URL}/api/gallery`
    )

    const data = await response.json()

    if (data.success) {

      const formattedImages = data.images.map(
        (item) => ({
          id: item.id,
          image: item.image.startsWith("http")
  ? item.image
  : `${API_URL}${item.image}`,
          title: item.title,
          category: item.category
        })
      )

      setUploadedGalleryImages(
        formattedImages
      )

    }

  } catch (error) {

    console.error(
      'Gallery fetch error:',
      error
    )

  }

}
const fetchVideos = async () => {
  try {
    const response = await fetch(`${API_URL}/api/videos`)
    const data = await response.json()

    if (data.success) {
      const formattedVideos = data.videos.map((item) => ({
        id: item.id,
        video: item.video,
        title: item.title,
        category: item.category
      }))

      setUploadedVideos(formattedVideos)
    }
  } catch (error) {
    console.error('Videos fetch error:', error)
  }
}
const handleDeleteGallery = async (id) => {

  const confirmDelete = window.confirm(
    'Are you sure you want to delete this gallery photo?'
  )

  if (!confirmDelete) {
    return
  }

  try {

    const response = await fetch(
      `${API_URL}/api/gallery/${id}`,
      {
        method: 'DELETE'
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        'Failed to delete gallery photo.'
      )

      return
    }

    alert('Gallery photo deleted successfully!')

    // Remove the deleted photo immediately
    setUploadedGalleryImages((previousImages) =>
      previousImages.filter(
        (image) => image.id !== id
      )
    )

  } catch (error) {

    console.error(
      'Gallery delete error:',
      error
    )

    alert(
      'Unable to connect to VK EVENTS server.'
    )

  }

}
const handleDeleteVideo = async (id) => {

  const confirmDelete = window.confirm(
    'Are you sure you want to delete this event video?'
  )

  if (!confirmDelete) {
    return
  }

  try {

    const response = await fetch(
      `${API_URL}/api/videos/${id}`,
      {
        method: 'DELETE'
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        'Failed to delete event video.'
      )

      return
    }

    alert('Event video deleted successfully!')

    setUploadedVideos((previousVideos) =>
      previousVideos.filter(
        (video) => video.id !== id
      )
    )

  } catch (error) {

    console.error(
      'Video delete error:',
      error
    )

    alert(
      'Unable to connect to VK EVENTS server.'
    )

  }

}
const handleGalleryUpload = async (e) => {
  e.preventDefault()

  if (!galleryTitle || !galleryCategory || !galleryFile) {
    alert('Please enter a title, select a category and choose a photo.')
    return
  }

  const formData = new FormData()

  formData.append('title', galleryTitle)
  formData.append('category', galleryCategory)
  formData.append('image', galleryFile)

  try {
    setGalleryUploading(true)

    const response = await fetch(
      `${API_URL}/api/gallery`,
      {
        method: 'POST',
        body: formData
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
      alert(data.message || 'Failed to upload photo.')
      return
    }

    alert('Gallery photo uploaded successfully!')

    setGalleryTitle('')
    setGalleryCategory('')
    setGalleryFile(null)
  } catch (error) {

    console.error(
      'Gallery upload error:',
      error
    )

    alert(
      'Unable to connect to VK EVENTS server.'
    )

  } finally {
    setGalleryUploading(false)
  }
}
const handleVideoUpload = async (e) => {
  e.preventDefault()

  if (!videoTitle || !videoCategory || !videoFile) {
    alert('Please enter a title, select a category and paste a video link.')
    return
  }

  try {
    setVideoUploading(true)

    const response = await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: videoTitle,
        category: videoCategory,
        video: videoFile
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      alert(data.message || 'Failed to add event video.')
      return
    }

    alert('Event video added successfully!')

    setVideoTitle('')
    setVideoCategory('')
    setVideoFile('')

    fetchVideos()

  } catch (error) {
    console.error('Video link error:', error)
    alert('Unable to connect to VK EVENTS server.')
  } finally {
    setVideoUploading(false)
  }
}
const handleAdminLogin = async () => {
  console.log("LOGIN BUTTON CLICKED");
  if (!adminUsername || !adminPassword) {
    alert("Please enter username and password.")
    return
  }

  try {

    const response = await fetch(
      `${API_URL}/api/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      }
    )

    const data = await response.json()

    if (response.ok && data.success) {

      setIsAdmin(true)
      setShowAdminLogin(false)

      setAdminUsername("")
      setAdminPassword("")

      alert("Admin login successful!")

    } else {

      alert(
        data.message ||
        "Invalid admin username or password."
      )

    }

  } catch (error) {

    console.error("Admin login error:", error)

    alert(
      "Unable to connect to the VK EVENTS server."
    )
  }
}
const handleChangePassword = async () => {

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill all password fields.")
    return
  }

  if (newPassword.length < 6) {
    alert("New password must be at least 6 characters long.")
    return
  }

  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match.")
    return
  }

  try {

    console.log("CHANGE PASSWORD BUTTON CLICKED")

    const response = await fetch(
      `${API_URL}/api/admin/change-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "Vishal_Chouksey",
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      }
    )

    const data = await response.json()

    console.log("CHANGE PASSWORD RESPONSE:", data)

    if (response.ok && data.success) {

      alert("Password changed successfully!")

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowChangePassword(false)

    } else {

      alert(
        data.message ||
        "Unable to change password."
      )

    }

  } catch (error) {

    console.error(
      "Change password error:",
      error
    )

    alert(
      "Unable to connect to the VK EVENTS server."
    )
  }
}

  /* =========================
     DASHBOARD COUNTS
     ========================= */

  const totalEnquiries = bookings.length
    const otherEnquiries = bookings.filter(
    (item) =>
      item.event_type !== 'Wedding' &&
      item.event_type !== 'Birthday Party' &&
      item.event_type !== 'Convocation' &&
      item.event_type !== 'Inauguration'
  ).length

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEventCount = events.filter((event) => {
    if (!event.date) return false

    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)

    return eventDate >= today
  }).length

  const upcomingBookingCount = bookings.filter((item) => {
    if (!item.event_date) return false

    const eventDate = new Date(
      `${item.event_date}T00:00:00`
    )

    return eventDate >= today
  }).length

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
      fetchAdminReviews()
       fetchReviews()
  }, [])
  useEffect(() => {
  fetchEvents()
}, [])
useEffect(() => {
  fetchGalleryImages()
   fetchVideos()
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
  const fetchReviews = async () => {
  try {
    const response = await fetch(
      "https://vk-events.onrender.com/api/reviews"
    );

    const data = await response.json();

    if (data.success) {
      setReviews(data.reviews);
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }
};
  const fetchAdminReviews = async () => {
  try {
    const response = await fetch(
      "https://vk-events.onrender.com/api/admin/reviews"
    );

    const data = await response.json();

    if (data.success) {
      setAdminReviews(data.reviews);
    }
  } catch (error) {
    console.error("Failed to fetch admin reviews:", error);
  }
};
/* =========================
   DELETE EVENT
   ========================= */

const handleDeleteEvent = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/events/${id}`,
      {
        method: 'DELETE'
      }
    )

    const data = await response.json()

    console.log('Delete event response:', response.status, data)

    if (response.ok && data.success) {
      alert('Event deleted successfully!')

      setEvents((previousEvents) =>
        previousEvents.filter(
          (event) => event.id !== id
        )
      )
    } else {
      alert(
        data.message || 'Unable to delete event.'
      )
    }

  } catch (error) {
    console.error('Delete event error:', error)

    alert(
      'Unable to connect to the VK EVENTS server.'
    )
  }
}
 /* =========================
   EDIT EVENT
   ========================= */

const handleEditEvent = async (event) => {

  const name = window.prompt(
    'Enter Event Name:',
    event.name
  )

  if (name === null) {
    return
  }

  const date = window.prompt(
    'Enter Event Date (YYYY-MM-DD):',
    event.date
      ? new Date(event.date).toISOString().split('T')[0]
      : ''
  )

  if (date === null) {
    return
  }

  const location = window.prompt(
    'Enter Event Location:',
    event.location
  )

  if (location === null) {
    return
  }

  const event_type = window.prompt(
    'Enter Event Type:',
    event.event_type
  )

  if (event_type === null) {
    return
  }

  if (!name || !date || !location || !event_type) {
    alert('Please fill all event fields.')
    return
  }

  try {

    const response = await fetch(
      `${API_URL}/api/events/${event.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          date,
          location,
          event_type
        })
      }
    )

    const data = await response.json()

    if (response.ok && data.success) {

      alert('Event updated successfully!')

      fetchEvents()

    } else {

      alert(
        data.message || 'Failed to update event.'
      )

    }

  } catch (error) {

    console.error(
      'Edit event error:',
      error
    )

    alert(
      'Unable to connect to VK EVENTS server.'
    )
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

const defaultGalleryImages = [
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

const galleryImages = [
  ...defaultGalleryImages,
  ...uploadedGalleryImages
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
          <a href="#services">Services</a>
           <a href="#process">How We Work</a>
          <a href="#why">Why Us</a>
          <a href="#expertise">Expertise</a>
           <a href="#gallery">Gallery</a>
          <a href="#about">About</a>

          <a href="#contact">Contact</a>
    {isAdmin ? (
  <>
    <button
      className="admin-login-btn"
      onClick={() => setIsAdmin(false)}
    >
      Logout
    </button>

    <button
      className="admin-login-btn"
      onClick={() => setShowChangePassword(true)}
    >
      Change Password
    </button>

  </>
) : (
  <button
  className="admin-login-btn"
  onClick={() => setShowAdminLogin(true)}
>
  Admin Login
</button>
)}
        {isAdmin && (
  <a href="#bookings">Enquiries</a>
)}

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
      VK Events & Services
    </h1>

    <div className="hero-line"></div>

    <p className="hero-description">
      Wedding Planning | Event Management | Corporate Events | Social Celebrations
       <p>LET US HANDLE THE MAGIC, WHILE YOU ENJOY THE SPOTLIGHT.</p>
    </p>

    <div className="hero-buttons">

      <a
        href="#booking"
        className="hero-main-button"
      >
        GET A QUOTE
      </a>

      <a
        href="https://wa.me/919424455947?text=Hello%20VK%20EVENTS,%20I%20would%20like%20to%20know%20more%20about%20your%20event%20services."
        target="_blank"
        rel="noopener noreferrer"
        className="hero-outline-button"
      >
        WHATSAPP US
      </a>

    </div>

  </div>

  <div className="hero-decoration-circle">

    <div className="circle-ring"></div>

    <div className="hero-center-logo">
      <span>VK</span>
    </div>

    <p className="circle-text">
      EVENTS • SERVICES • CELEBRATIONS
    </p>

  </div>

</section>
{/* =========================
    SERVICES
    ========================= */}

<section id="services" className="services-section">

  <div className="section-heading">
    <p>WHAT WE DO</p>
    <h2>Our Services</h2>
    <div className="gold-line"></div>
  </div>

  <p className="contact-intro">
    Complete event solutions designed to make your special occasions memorable.
  </p>

  <div className="service-cards">

    <div className="service-card">
      <span>01</span>
      <h3>Wedding Events</h3>
      <p>
        Complete wedding planning, decoration and coordination for your special day.
      </p>
    </div>

    <div className="service-card">
      <span>02</span>
      <h3>Wedding Functions</h3>
      <p>
        Beautifully planned receptions, engagements, mehendi and other wedding functions.
      </p>
    </div>

    <div className="service-card">
      <span>03</span>
      <h3>Birthday Parties</h3>
      <p>
        Creative themes, decoration and complete arrangements for memorable birthdays.
      </p>
    </div>

    <div className="service-card">
      <span>04</span>
      <h3>Convocation</h3>
      <p>
        Professional planning and management for memorable academic celebrations.
      </p>
    </div>

    <div className="service-card">
      <span>05</span>
      <h3>Inauguration</h3>
      <p>
        Elegant inauguration events with professional planning and smooth execution.
      </p>
    </div>

    <div className="service-card">
      <span>06</span>
      <h3>Special Events</h3>
      <p>
        Customized event solutions created according to your requirements.
      </p>
    </div>

  </div>

</section>


{/* =========================
    HOW WE WORK
    ========================= */}

<section id="process" className="process-section">

  <div className="section-heading">
    <p>OUR PROCESS</p>
    <h2>How We Work</h2>
    <div className="gold-line"></div>
  </div>

  <p className="contact-intro">
    From the first conversation to the final celebration, we carefully manage every stage of your event.
  </p>

  <div className="process-cards">

    <div className="process-card">
      <span className="process-number">01</span>
      <div className="process-icon">💡</div>
      <h3>Understanding Your Vision</h3>
      <p>
        We listen carefully to your ideas, requirements and expectations.
      </p>
    </div>

    <div className="process-card">
      <span className="process-number">02</span>
      <div className="process-icon">📋</div>
      <h3>Detailed Planning & Coordination</h3>
      <p>
        We create a detailed plan covering timelines, vendors and logistics.
      </p>
    </div>

    <div className="process-card">
      <span className="process-number">03</span>
      <div className="process-icon">✨</div>
      <h3>Creative Execution</h3>
      <p>
        We bring your ideas to life through creative design and professional execution.
      </p>
    </div>

    <div className="process-card">
      <span className="process-number">04</span>
      <div className="process-icon">🎯</div>
      <h3>On-Site Management & Support</h3>
      <p>
        Our team coordinates everything on-site and ensures the event runs smoothly.
      </p>
    </div>

  </div>

</section>


{/* =========================
    WHY US
    ========================= */}

<section id="why" className="why-section">

  <div className="section-heading">
    <p>WHY CHOOSE US</p>
    <h2>Why VK EVENTS?</h2>
    <div className="gold-line"></div>
  </div>

  <div className="why-cards">

    <div className="why-card">
      <span className="why-number">01</span>
      <h3>Creative & Elegant Planning</h3>
      <p>
        Creative concepts and elegant details for memorable events.
      </p>
    </div>

    <div className="why-card">
      <span className="why-number">02</span>
      <h3>Complete Event Management</h3>
      <p>
        We manage planning, decoration and execution.
      </p>
    </div>

    <div className="why-card">
      <span className="why-number">03</span>
      <h3>Customized Celebrations</h3>
      <p>
        Services tailored to your requirements and vision.
      </p>
    </div>

    <div className="why-card">
      <span className="why-number">04</span>
      <h3>Trusted & Dedicated Service</h3>
      <p>
        Professional service and smooth coordination.
      </p>
    </div>

  </div>

</section>


{/* =========================
    OUR EXPERTISE
    ========================= */}

<section id="expertise" className="expertise-section">

  <div className="section-heading">
    <p>OUR EXPERTISE</p>
    <h2>Everything You Need for a Perfect Event</h2>
    <div className="gold-line"></div>
  </div>

  <p className="contact-intro">
    We bring together creativity, planning and professional coordination to make every celebration memorable.
  </p>

  <div className="expertise-grid">

    <div className="expertise-item">
      <span>01</span>
      <h3>Event Planning</h3>
      <p>Complete planning and coordination tailored to your event.</p>
    </div>

    <div className="expertise-item">
      <span>02</span>
      <h3>Venue Management</h3>
      <p>Professional venue preparation and smooth event-day coordination.</p>
    </div>

    <div className="expertise-item">
      <span>03</span>
      <h3>Creative Design</h3>
      <p>Elegant themes, decoration and creative event concepts.</p>
    </div>

    <div className="expertise-item">
      <span>04</span>
      <h3>Guest Experience</h3>
      <p>Thoughtful arrangements focused on guest comfort and experience.</p>
    </div>

    <div className="expertise-item">
      <span>05</span>
      <h3>Entertainment</h3>
      <p>Artists, entertainment and activities suited to your celebration.</p>
    </div>

    <div className="expertise-item">
      <span>06</span>
      <h3>Event Support</h3>
      <p>Dedicated on-site support from setup through completion.</p>
    </div>

  </div>

</section>
{/* =========================
    GALLERY
    ========================= */}

<section id="gallery" className="gallery-section">

  <div className="section-heading">
    <p>OUR WORK</p>
    <h2>Event Gallery</h2>
    <div className="gold-line"></div>
  </div>

  <div className="gallery-grid">

    {galleryImages.map((item, index) => (
      <div
        className="gallery-item"
        key={index}
        onClick={() => setSelectedGalleryIndex(index)}
      >
        <img src={item.image} alt={item.title} />

        <div className="gallery-overlay">
          <span>{item.category}</span>
        </div>
      </div>
    ))}

  </div>
{uploadedVideos.length > 0 && (
  <div className="gallery-video-section">

    <h2>Event Videos</h2>

    {uploadedVideos.map((item) => (
      <div
        className="gallery-video-card"
        key={item.id}
      >

        <h3>{item.title}</h3>

        <p>{item.category}</p>

        <a
          href={item.video}
          target="_blank"
          rel="noopener noreferrer"
        >
          ▶ Watch Video
        </a>

      </div>
    ))}

  </div>
)}
  {selectedGalleryIndex !== null && (
    <div
      className="gallery-lightbox"
      onClick={() => setSelectedGalleryIndex(null)}
    >

      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          type="button"
          className="lightbox-close"
          onClick={() => setSelectedGalleryIndex(null)}
        >
          ×
        </button>

        <img
          src={galleryImages[selectedGalleryIndex].image}
          alt={galleryImages[selectedGalleryIndex].title}
          className="lightbox-image"
        />

        <div className="lightbox-info">

          <p>
            {galleryImages[selectedGalleryIndex].category}
          </p>

          <h2>
            {galleryImages[selectedGalleryIndex].title}
          </h2>

          <span>
            {selectedGalleryIndex + 1} / {galleryImages.length}
          </span>

        </div>

      </div>

    </div>
  )}

</section>
{/* =========================
    MEET THE DIRECTOR
    ========================= */}

<section
  id="founder"
  className="founder-section"
>

  <div className="section-heading">

    <p>
      MEET THE DIRECTOR
    </p>

    <h2>
      BEHIND EVERY SUCCESSFUL EVENT
    </h2>

    <div className="gold-line"></div>

  </div>


  <div className="founder-container">

    <div className="founder-image-wrapper">

      <div className="founder-image-frame">

        <img
          src={vishalFounder}
          alt="Vishal Chouksey - Director of VK Events"
          className="founder-image"
        />

      </div>

      <div className="founder-image-accent"></div>

    </div>


    <div className="founder-content">

      <p className="founder-label">
        DIRECTOR | VK EVENTS & SERVICES
      </p>

      <h3>
        VISHAL CHOUKSEY
      </h3>

      <div className="founder-small-line"></div>


      <p className="founder-intro">
        THERE'S EXPERIENCE YOU CAN TRUST.
      </p>


      <p className="founder-description">
        With experience across <strong>400+ events</strong>, I've had
        the opportunity to be part of celebrations of all kinds,
        from intimate family functions to large-scale events.
      </p>


      <h4 className="founder-approach-title">
        MY EXPERIENCE
      </h4>

      <p className="founder-description">
        Every event has taught me something new — about people,
        planning, creativity and the importance of getting
        every detail right.
      </p>


      <h4 className="founder-approach-title">
        MY APPROACH
      </h4>


      <div className="founder-approach">

        <div className="founder-approach-item">

          <strong>
            LISTEN FIRST
          </strong>

          <p>
            Every event starts with understanding what you actually want.
          </p>

        </div>


        <div className="founder-approach-item">

          <strong>
            PLAN SMART
          </strong>

          <p>
            A good event looks effortless because the planning behind it isn't.
          </p>

        </div>


        <div className="founder-approach-item">

          <strong>
            EXECUTE WITH PRECISION
          </strong>

          <p>
            On the event day, every detail matters.
          </p>

        </div>


        <div className="founder-approach-item">

          <strong>
            BE THERE
          </strong>

          <p>
            When something unexpected happens, our team is there to handle it.
          </p>

        </div>

      </div>


      <div className="founder-quote">

        <span>
          “
        </span>

        <p>
          Don't worry, VK Events is handling it.
        </p>

      </div>


      <div className="founder-signature">

        <strong>
          VISHAL CHOUKSEY
        </strong>

        <span>
          Director, VK Events & Services
        </span>

      </div>
<div className="founder-social-links">

  <a
    href="https://www.instagram.com/vk_events_services/"
    target="_blank"
    rel="noopener noreferrer"
    className="founder-instagram"
  >
    <span>VK EVENTS</span>
    @vk_events_services
  </a>

  <a
    href="https://www.instagram.com/vishal_chouksey06/"
    target="_blank"
    rel="noopener noreferrer"
    className="founder-instagram"
  >
    <span>DIRECTOR</span>
    @vishal_chouksey06
  </a>

</div>
      <button
        type="button"
        className="founder-cta"
        onClick={() => {
          document
            .getElementById("booking")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        LET'S DISCUSS YOUR EVENT
      </button>

    </div>

  </div>

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

        <p>WHO WE ARE</p>

        <h2>About VK EVENTS</h2>

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
    CONTACT
    ========================= */}

<section id="contact" className="contact-section">

  <div className="section-heading">

    <p>GET IN TOUCH</p>

    <h2>Contact VK EVENTS</h2>

    <div className="gold-line"></div>

  </div>

  <p className="contact-intro">
    Have an event in mind? Get in touch with our team and let's make it memorable.
  </p>

  <div className="contact-info">

    <div className="contact-item">
      <span>📞</span>
      <div>
        <strong>Call Us</strong>
        <p>9424455947</p>
      </div>
    </div>

    <div className="contact-item">
      <span>💬</span>
      <div>
        <strong>WhatsApp</strong>
        <p>Available for enquiries</p>
      </div>
    </div>

    <div className="contact-item">
      <span>📸</span>
      <div>
        <strong>Instagram</strong>
        <p>@vk_events_services</p>
      </div>
    </div>

  </div>

</section>
{/* =========================
    ADMIN DASHBOARD
    ========================= */}

{isAdmin && (
  <section
    id="dashboard"
    className="dashboard-section"
  >

    <div className="section-heading">

      <p>VK EVENTS MANAGEMENT</p>

      <h2>Admin Dashboard</h2>

      <div className="gold-line"></div>

    </div>

    <div className="dashboard-welcome">

      <div>

        <h3>Welcome to VK EVENTS</h3>

        <p>
          Manage your event enquiries and monitor
          customer requests from one place.
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
          <span>Total Enquiries</span>

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
          <span>Total Events</span>

          <strong>
            {events.length}
          </strong>
        </div>

      </div>

    </div>

  </section>
)}
{/* =========================
    GALLERY MANAGEMENT
    ========================= */}

{isAdmin && (
  <section
    id="gallery-management"
    className="gallery-management-section"
  >

    <div className="section-heading">

      <p>VK EVENTS MANAGEMENT</p>

      <h2>Gallery Management</h2>

      <div className="gold-line"></div>

    </div>

    <div className="gallery-management-card">

      <h3>Upload Event Photos</h3>

      <form
        className="gallery-upload-form"
        onSubmit={handleGalleryUpload}
      >

        <input
          type="text"
          placeholder="Photo Title"
          value={galleryTitle}
          onChange={(e) =>
            setGalleryTitle(e.target.value)
          }
        />

        <select
          value={galleryCategory}
          onChange={(e) =>
            setGalleryCategory(e.target.value)
          }
        >

          <option value="">
            Select Event Category
          </option>

          <option value="Wedding">
            Wedding
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

          <option value="Reception">
            Reception
          </option>

          <option value="Corporate Event">
            Corporate Event
          </option>

        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setGalleryFile(e.target.files[0])
          }
        />

        <button
          type="submit"
          className="add-event-button"
          disabled={galleryUploading}
        >
          {galleryUploading
            ? "Uploading..."
            : "+ Upload Photo"}
        </button>

      </form>

      <div className="uploaded-gallery-list">

        {uploadedGalleryImages.length === 0 ? (

          <p className="contact-intro">
            No uploaded photos yet.
          </p>

        ) : (

          uploadedGalleryImages.map((item) => (

            <div
              className="uploaded-gallery-item"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.title}
                className="uploaded-gallery-thumbnail"
              />

              <div className="uploaded-gallery-info">

                <h4>
                  {item.title}
                </h4>

                <span>
                  {item.category}
                </span>

              </div>

              <button
                type="button"
                className="delete-gallery-button"
                onClick={() =>
                  handleDeleteGallery(item.id)
                }
              >
                Delete
              </button>

            </div>

          ))

        )}

      </div>

    </div>

  </section>
)}
{/* =========================
    VIDEO MANAGEMENT
    ========================= */}

{isAdmin && (
  <section
    id="video-management"
    className="gallery-management-section"
  >

    <div className="section-heading">

      <p>VK EVENTS MANAGEMENT</p>

      <h2>Video Management</h2>

      <div className="gold-line"></div>

    </div>

    <div className="gallery-management-card">

      <h3>Add Event Video</h3>

      <form
        className="gallery-upload-form"
        onSubmit={handleVideoUpload}
      >

        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={(e) =>
            setVideoTitle(e.target.value)
          }
        />

        <select
          value={videoCategory}
          onChange={(e) =>
            setVideoCategory(e.target.value)
          }
        >

          <option value="">
            Select Event Category
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

          <option value="Other Events">
            Other Events
          </option>

        </select>

        <input
          type="text"
          placeholder="Paste YouTube / Video Link"
          value={videoFile || ''}
          onChange={(e) =>
            setVideoFile(e.target.value)
          }
        />

        <button
          type="submit"
          className="add-event-button"
          disabled={videoUploading}
        >
          {videoUploading
            ? "Adding..."
            : "+ Add Video"}
        </button>

      </form>

      <div className="uploaded-gallery-list">

        {uploadedVideos.length === 0 ? (

          <p className="contact-intro">
            No videos added yet.
          </p>

        ) : (

          uploadedVideos.map((item) => (

            <div
              className="uploaded-gallery-item"
              key={item.id}
            >

              <div className="uploaded-gallery-info">

                <h4>
                  {item.title}
                </h4>

                <span>
                  {item.category}
                </span>

              <a
  href={item.video}
  target="_blank"
  rel="noopener noreferrer"
>
  Watch Video
</a>
<button
  type="button"
  className="delete-gallery-button"
  onClick={() =>
    handleDeleteVideo(item.id)
  }
>
  Delete
</button>
              </div>

            </div>

          ))

        )}

      </div>

    </div>

  </section>
)}
{/* =========================
 CUSTOMER REVIEWS
 ========================= */}

<section id="reviews" className="reviews-section">

  <div className="section-heading">
    <p>WHAT OUR CUSTOMERS SAY</p>

    <h2>Customer Reviews</h2>

    <div className="gold-line"></div>
  </div>

  <p className="contact-intro">
    Have we made your event special? Share your experience with us!
  </p>

  <form
    className="review-form"
    onSubmit={submitReview}
  >

    <input
      type="text"
      placeholder="Your Name *"
      value={reviewForm.name}
      onChange={(e) =>
        setReviewForm({
          ...reviewForm,
          name: e.target.value
        })
      }
      required
    />

    <select
      value={reviewForm.rating}
      onChange={(e) =>
        setReviewForm({
          ...reviewForm,
          rating: Number(e.target.value)
        })
      }
    >
      <option value={5}>★★★★★ 5 Stars</option>
      <option value={4}>★★★★☆ 4 Stars</option>
      <option value={3}>★★★☆☆ 3 Stars</option>
      <option value={2}>★★☆☆☆ 2 Stars</option>
      <option value={1}>★☆☆☆☆ 1 Star</option>
    </select>

    <textarea
      placeholder="Write your review *"
      value={reviewForm.comment}
      onChange={(e) =>
        setReviewForm({
          ...reviewForm,
          comment: e.target.value
        })
      }
      required
    ></textarea>

    <button
      type="submit"
      disabled={reviewSubmitting}
    >
      {reviewSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
    </button>

 </form>

{reviews.length > 0 && (
  <div className="public-reviews-list">

    {reviews.map((review) => (
      <div
        className="public-review-card"
        key={review.id}
      >

        <h3>{review.name}</h3>

        <p className="review-stars">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </p>

        <p>{review.comment}</p>

      </div>
    ))}

  </div>
)}

</section>
   {/* =========================
    BOOK YOUR EVENT
    ========================= */}

<section id="booking" className="contact-section">

  <div className="section-heading">
    <p>LET'S CREATE SOMETHING SPECIAL</p>

    <h2>Book Your Event</h2>

    <div className="gold-line"></div>
  </div>

  <p className="contact-intro">
    Tell us about your event and our team will get in touch.
  </p>

  <form
    className="booking-form"
    onSubmit={async (e) => {
      e.preventDefault();

      const form = e.target;

      const data = {
        name: form.name.value,
        phone: form.phone.value,
        event_type: form.event_type.value,
        event_date: form.event_date.value,
        message: form.message.value,
        location: form.location.value,
        guests: form.guests.value
      };

      try {
        const response = await fetch(
          "http://localhost:5000/api/bookings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          }
        );

        if (!response.ok) {
          throw new Error("Booking failed");
        }

        alert("Your enquiry has been submitted successfully!");

        form.reset();

      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    }}
  >

    <input
      type="text"
      name="name"
      placeholder="Your Name *"
      required
    />

    <input
      type="tel"
      name="phone"
      placeholder="Phone Number *"
      required
    />

    <select
      name="event_type"
      required
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

      <option value="Other Events">
        Other Events
      </option>
    </select>

    <input
      type="date"
      name="event_date"
      required
    />

    <input
      type="text"
      name="location"
      placeholder="Event Location"
    />

    <input
      type="number"
      name="guests"
      placeholder="Number of Guests"
      min="1"
    />

    <textarea
      name="message"
      placeholder="Tell us about your event..."
    ></textarea>

    <button type="submit">
      SEND ENQUIRY
    </button>

  </form>

  <div className="contact-info">

    <div className="contact-item">
      <span>📞</span>
      <p>9424455947</p>
    </div>

    <div className="contact-item">
      <span>💬</span>
      <p>WhatsApp Available</p>
    </div>

  </div>

</section>

      {/* =========================
          CUSTOMER ENQUIRIES
          ========================= */}

    {isAdmin && (
      <>
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

  <div className="enquiry-filters">

  <div className="enquiry-search">
    <input
      type="text"
      placeholder="Search by name, phone, event or location..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  <select
    value={eventFilter}
    onChange={(e) => setEventFilter(e.target.value)}
    className="event-filter-select"
  >
    <option value="All">All Events</option>
    <option value="Wedding">Wedding</option>
    <option value="Birthday Party">Birthday Party</option>
    <option value="Convocation">Convocation</option>
    <option value="Inauguration">Inauguration</option>
    <option value="Other Events">Other Events</option>
  </select>

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

    const matchesSearch =
      item.name?.toLowerCase().includes(search) ||
      item.phone?.toLowerCase().includes(search) ||
      item.event_type?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search)

    const matchesEvent =
      eventFilter === 'All' ||
      item.event_type === eventFilter

    return matchesSearch && matchesEvent
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
    
{/* =========================
   ADMIN REVIEWS
   ========================= */}

<section className="admin-reviews-section">

  <div className="section-heading">
    <p>ADMIN PANEL</p>
    <h2>Customer Reviews</h2>
    <div className="gold-line"></div>
  </div>

  {adminReviews.length === 0 ? (

    <p>No reviews submitted yet.</p>

  ) : (

    <div className="admin-reviews-list">

      {adminReviews.map((review) => (

        <div
          className="admin-review-card"
          key={review.id}
        >

          <div className="admin-review-info">

            <h3>{review.name}</h3>

            <p className="review-stars">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </p>

            <p className="review-comment">
              {review.comment}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {review.status}
            </p>

          </div>

          {review.status === "pending" && (

            <div className="review-admin-actions">

              <button
                type="button"
                onClick={async () => {

                  try {

                    const response = await fetch(
                      `https://vk-events.onrender.com/api/admin/reviews/${review.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          status: "approved"
                        })
                      }
                    );

                    const data = await response.json();

                    if (data.success) {
                      alert("Review approved successfully!");
                      fetchAdminReviews();
                    } else {
                      alert(data.message || "Failed to approve review.");
                    }

                  } catch (error) {
                    console.error(error);
                    alert("Unable to connect to server.");
                  }

                }}
              >
                Approve
              </button>

              <button
                type="button"
                onClick={async () => {

                  try {

                    const response = await fetch(
                      `https://vk-events.onrender.com/api/admin/reviews/${review.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          status: "rejected"
                        })
                      }
                    );

                    const data = await response.json();

                    if (data.success) {
                      alert("Review rejected.");
                      fetchAdminReviews();
                    } else {
                      alert(data.message || "Failed to reject review.");
                    }

                  } catch (error) {
                    console.error(error);
                    alert("Unable to connect to server.");
                  }

                }}
              >
                Reject
              </button>

            </div>
        
          )}
<button
  type="button"
  onClick={async () => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(
        `https://vk-events.onrender.com/api/admin/reviews/${review.id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Review deleted successfully!");
        fetchAdminReviews();
      } else {
        alert(data.message || "Failed to delete review.");
      }

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }

  }}
>
  Delete
</button>
        </div>

      ))}

    </div>

  )}

</section>
</>
)}

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
            <a
  href="https://www.instagram.com/vk_events_services/"
  target="_blank"
  rel="noopener noreferrer"
  className="instagram-link"
>
  Instagram— @vk_events_services
</a>

          </div>

        </div>

        <div className="footer-line"></div>

        <p className="copyright">
          © 2026 VK EVENTS & SERVICES.
          All rights reserved.
        </p>

      </footer>
{showChangePassword && (
  <div
    className="change-password-overlay"
    onClick={() => setShowChangePassword(false)}
  >
    <div
      className="change-password-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        type="button"
        className="change-password-close"
        onClick={() => setShowChangePassword(false)}
      >
        ×
      </button>

      <p className="modal-label">
        ADMIN SECURITY
      </p>

      <h2>Change Password</h2>

      <div className="gold-line"></div>

      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) =>
          setCurrentPassword(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
      />

      <button
        type="button"
        className="change-password-submit"
        onClick={handleChangePassword}
      >
        Change Password
      </button>

    </div>
  </div>
)}
{showAdminLogin && (
  <div
    className="change-password-overlay"
    onClick={() => setShowAdminLogin(false)}
  >
    <div
      className="change-password-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        type="button"
        className="change-password-close"
        onClick={() => setShowAdminLogin(false)}
      >
        ×
      </button>

      <p className="modal-label">
        VK EVENTS MANAGEMENT
      </p>

      <h2>Admin Login</h2>

      <div className="gold-line"></div>

      <input
        type="text"
        placeholder="Username"
        value={adminUsername}
        onChange={(e) =>
          setAdminUsername(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={adminPassword}
        onChange={(e) =>
          setAdminPassword(e.target.value)
        }
      />

      <button
        type="button"
        className="change-password-submit"
        onClick={handleAdminLogin}
      >
        Login
      </button>

    </div>
  </div>
)}
    </>
  )
}

export default App