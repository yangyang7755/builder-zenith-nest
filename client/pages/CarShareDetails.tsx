import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Users, Car, DollarSign, X } from "lucide-react";

// Car share data
const carShareData = {
  "peak-district": {
    id: "peak-district",
    destination: "Peak District",
    date: "Saturday, August 10th, 2025",
    time: "7:00 AM",
    returnTime: "6:00 PM",
    driver: {
      name: "Mike Johnson",
      rating: 4.8,
      trips: 23,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    },
    vehicle: {
      make: "Toyota RAV4",
      year: "2019",
      color: "Silver",
      plate: "BV19 KLM",
      features: ["GPS Navigation", "Climate Control", "Bluetooth", "Roof Box"]
    },
    route: {
      departure: "London Victoria Station",
      destination: "Stanage Edge Car Park",
      distance: "180 miles",
      duration: "3 hours",
      stops: ["Sheffield Services (30 min)", "Hathersage Village (10 min)"]
    },
    cost: {
      perPerson: "£15",
      total: "£60",
      includes: ["Fuel", "Parking", "Toll charges"]
    },
    availableSeats: 3,
    totalSeats: 4,
    currentPassengers: [
      {
        name: "Sarah K.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
      }
    ],
    description: "Join me for a climbing trip to the Peak District! We'll be heading to Stanage Edge for some fantastic gritstone climbing. Perfect for intermediate to advanced climbers. Bring your own gear and lunch.",
    requirements: [
      "Own climbing gear (shoes, harness, helmet)",
      "Packed lunch and water",
      "Weather-appropriate clothing",
      "Share of fuel costs"
    ],
    meetingPoint: {
      location: "London Victoria Station",
      details: "Main entrance by the clock tower",
      time: "6:45 AM"
    }
  },
  "snowdonia": {
    id: "snowdonia",
    destination: "Snowdonia",
    date: "Saturday, August 17th, 2025",
    time: "6:00 AM",
    returnTime: "8:00 PM",
    driver: {
      name: "Sarah Chen",
      rating: 4.9,
      trips: 31,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=80&h=80&fit=crop&crop=face",
    },
    vehicle: {
      make: "Ford Explorer",
      year: "2020",
      color: "Blue",
      plate: "SK20 ABC",
      features: ["4WD", "Roof Rack", "First Aid Kit", "Emergency Kit"]
    },
    route: {
      departure: "London Paddington Station",
      destination: "Pen-y-Pass Car Park",
      distance: "220 miles",
      duration: "4 hours",
      stops: ["Birmingham Services (20 min)", "Betws-y-Coed (15 min)"]
    },
    cost: {
      perPerson: "£25",
      total: "£100",
      includes: ["Fuel", "Parking", "Mountain rescue insurance"]
    },
    availableSeats: 2,
    totalSeats: 4,
    currentPassengers: [
      {
        name: "James R.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
      },
      {
        name: "Lucy M.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
      }
    ],
    description: "Epic hiking adventure to Snowdonia! Planning to tackle Mount Snowdon via the Pyg Track. Suitable for experienced hikers with good fitness levels. Mountain weather can change quickly, so come prepared!",
    requirements: [
      "Hiking boots and waterproof clothing",
      "Full day hiking experience",
      "Emergency whistle and head torch",
      "Food and plenty of water"
    ],
    meetingPoint: {
      location: "London Paddington Station",
      details: "Costa Coffee near Platform 1",
      time: "5:45 AM"
    }
  },
  "brighton-beach": {
    id: "brighton-beach",
    destination: "Brighton Beach",
    date: "Sunday, August 24th, 2025",
    time: "8:00 AM",
    returnTime: "7:00 PM",
    driver: {
      name: "Alex Rodriguez",
      rating: 4.7,
      trips: 18,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    },
    vehicle: {
      make: "Volkswagen Tiguan",
      year: "2018",
      color: "White",
      plate: "AR18 XYZ",
      features: ["Beach Storage", "Cooler Box", "Beach Umbrella", "Portable Chairs"]
    },
    route: {
      departure: "London Bridge Station",
      destination: "Brighton Beach",
      distance: "55 miles",
      duration: "1.5 hours",
      stops: ["Gatwick Airport (10 min)"]
    },
    cost: {
      perPerson: "£12",
      total: "£48",
      includes: ["Fuel", "Parking", "Beach equipment"]
    },
    availableSeats: 4,
    totalSeats: 4,
    currentPassengers: [],
    description: "Beach day in Brighton! Perfect for relaxing, swimming, and enjoying the seaside. We'll spend the day at the beach and explore Brighton Pier. Great for families and solo travelers alike.",
    requirements: [
      "Swimwear and towels",
      "Sun protection (sunscreen, hat)",
      "Beach snacks and drinks",
      "Comfortable walking shoes for pier"
    ],
    meetingPoint: {
      location: "London Bridge Station",
      details: "Outside WH Smith in main concourse",
      time: "7:45 AM"
    }
  }
};

export default function CarShareDetails() {
  const navigate = useNavigate();
  const { carShareId } = useParams();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const carShare = carShareId
    ? carShareData[carShareId as keyof typeof carShareData]
    : null;

  if (!carShare) {
    navigate("/explore");
    return null;
  }

  const handleRequestSeat = () => {
    setShowRequestModal(true);
  };

  const handleSendRequest = () => {
    alert(`Request sent to ${carShare.driver.name}! They will contact you soon.`);
    setShowRequestModal(false);
    setRequestMessage("");
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none" />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-4 mb-4 text-blue-600 font-cabin"
        >
          ← Back to car shares
        </button>

        {/* Title and Basic Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800 font-cabin leading-tight mb-2">
            🚗 {carShare.destination}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 font-cabin">
            <span>📅 {carShare.date}</span>
            <span>🕐 {carShare.time}</span>
          </div>
        </div>

        {/* Driver Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Driver</h3>
          <div className="flex items-center gap-3">
            <img
              src={carShare.driver.avatar}
              alt={carShare.driver.name}
              className="w-12 h-12 rounded-full border border-blue-600 object-cover"
            />
            <div>
              <h4 className="font-medium text-black font-cabin">{carShare.driver.name}</h4>
              <div className="flex items-center gap-2 text-sm text-blue-700 font-cabin">
                <span>⭐ {carShare.driver.rating}</span>
                <span>•</span>
                <span>{carShare.driver.trips} trips</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Vehicle</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">Make & Model:</span>
              <span className="font-medium text-black font-cabin">{carShare.vehicle.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">Year & Color:</span>
              <span className="font-medium text-black font-cabin">{carShare.vehicle.year} {carShare.vehicle.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-cabin">License Plate:</span>
              <span className="font-medium text-black font-cabin">{carShare.vehicle.plate}</span>
            </div>
            <div className="mt-3">
              <span className="text-gray-600 font-cabin">Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {carShare.vehicle.features.map((feature, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-cabin">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Route</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-black font-cabin">{carShare.route.departure}</div>
                <div className="text-sm text-gray-600 font-cabin">Departure point</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-black font-cabin">{carShare.route.destination}</div>
                <div className="text-sm text-gray-600 font-cabin">Final destination</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-cabin">Distance:</span>
                <span className="font-medium text-black font-cabin">{carShare.route.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-cabin">Duration:</span>
                <span className="font-medium text-black font-cabin">{carShare.route.duration}</span>
              </div>
              {carShare.route.stops.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-600 font-cabin">Stops:</span>
                  <ul className="mt-1 space-y-1">
                    {carShare.route.stops.map((stop, index) => (
                      <li key={index} className="text-sm text-black font-cabin">• {stop}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost & Availability */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Cost & Availability</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-2xl font-bold text-green-700 font-cabin">{carShare.cost.perPerson}</div>
                <div className="text-sm text-gray-600 font-cabin">per person</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-black font-cabin">{carShare.availableSeats} / {carShare.totalSeats} seats</div>
                <div className="text-sm text-gray-600 font-cabin">available</div>
              </div>
            </div>
            <div>
              <span className="text-gray-600 font-cabin">Includes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {carShare.cost.includes.map((item, index) => (
                  <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-cabin">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Passengers */}
        {carShare.currentPassengers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black font-cabin mb-3">Current Passengers</h3>
            <div className="space-y-2">
              {carShare.currentPassengers.map((passenger, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={passenger.avatar}
                    alt={passenger.name}
                    className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                  />
                  <span className="font-medium text-black font-cabin">{passenger.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Point */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Meeting Point</h3>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-black font-cabin">{carShare.meetingPoint.time}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-black font-cabin">{carShare.meetingPoint.location}</div>
                <div className="text-sm text-gray-600 font-cabin">{carShare.meetingPoint.details}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">Trip Description</h3>
          <p className="text-sm text-black font-cabin leading-relaxed mb-4">
            {carShare.description}
          </p>
          <div>
            <h4 className="font-medium text-black font-cabin mb-2">What to bring:</h4>
            <ul className="space-y-1">
              {carShare.requirements.map((requirement, index) => (
                <li key={index} className="text-sm text-gray-700 font-cabin">• {requirement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Request Seat Button */}
        <button
          onClick={handleRequestSeat}
          disabled={carShare.availableSeats === 0}
          className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
            carShare.availableSeats > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {carShare.availableSeats > 0 ? "Request Seat" : "Fully Booked"}
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-800 font-cabin">
                Request Seat
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-cabin mb-3">
                Send a message to {carShare.driver.name} (optional):
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd like to join your trip to..."
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-cabin font-medium"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <Link to="/saved" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </Link>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75M6.25 15H23.75" />
        </svg>
      </Link>

      {/* Chat Icon */}
      <Link to="/chat" className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Profile Icon */}
      <Link to="/profile" className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
