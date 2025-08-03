import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Share,
  Edit,
  CheckCircle,
  Star,
  MessageSquare,
  MapPin
} from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function ProfileCoachHollyNew() {
  const [following, setFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'completed' | 'organized'>('organized');
  const [activeSportTab, setActiveSportTab] = useState<'climbing' | 'cycling' | 'running'>('climbing');
  const activitiesRef = useRef<HTMLDivElement>(null);

  const handleFollow = () => {
    setFollowing(!following);
  };

  return (
    <div className="react-native-container bg-white font-cabin relative native-scroll">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <Link to="/explore">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="text-gray-500 font-medium">Profile</span>
        <Link to="/chat">
          <MessageSquare className="w-6 h-6 text-explore-green" />
        </Link>
      </div>

      {/* Profile Content */}
      <div className="bg-white">
        {/* Profile Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face"
                alt="Coach Holly Peristiani"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">Coach Holly Peristiani</h1>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <button 
                  onClick={() => setShowFollowers(true)}
                  className="hover:text-explore-green transition-colors"
                >
                  324 Followers
                </button>
                <span>•</span>
                <button 
                  onClick={() => setShowFollowing(true)}
                  className="hover:text-explore-green transition-colors"
                >
                  89 Following
                </button>
              </div>

              {/* Rating */}
              <button 
                onClick={() => activitiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 mb-3 hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-black">
                  4.9 (127 reviews)
                </span>
              </button>
            </div>
          </div>

          {/* Activity Tags */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-explore-green text-white rounded-full text-sm font-medium">
              Climbing • Expert
            </span>
            <span className="px-3 py-1 border border-orange-300 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
              Coach • Certified
            </span>
          </div>

          {/* Bio */}
          <p className="text-gray-700 mb-6 leading-relaxed text-sm">
            Certified climbing instructor with 15+ years experience. Passionate about helping people reach new heights safely and confidently. Specializing in women's climbing and youth programs.
          </p>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
              following
                ? "bg-gray-200 text-gray-700"
                : "bg-explore-green text-white hover:bg-explore-green-light"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        {/* Personal Details Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Personal Details</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gender:</span>
              <div className="font-medium text-black">Female</div>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <div className="font-medium text-black">34 years old</div>
            </div>
            <div>
              <span className="text-gray-600">Nationality:</span>
              <div className="font-medium text-black">British</div>
            </div>
            <div>
              <span className="text-gray-600">Experience:</span>
              <div className="font-medium text-black">15 years</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Institution:</span>
              <div className="font-medium text-black">London Mountain Centre</div>
            </div>
          </div>
        </div>

        {/* Sports & Licensing Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Sports & Licensing</h3>
          
          {/* Sports Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveSportTab('climbing')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'climbing'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧗 Climbing
            </button>
            <button
              onClick={() => setActiveSportTab('cycling')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'cycling'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚴 Cycling
            </button>
            <button
              onClick={() => setActiveSportTab('running')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeSportTab === 'running'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏃 Running
            </button>
          </div>

          {/* Sports Content */}
          <div className="space-y-4">
            {activeSportTab === 'climbing' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Rock Climbing</h4>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                    Professional
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">15 years</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Grade:</span>
                    <div className="font-medium text-black">V8 / 7a+</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Certifications:</span>
                    <div className="font-medium text-black">Instructor, Guide</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialties:</span>
                    <div className="font-medium text-black">Coaching, Youth</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Indoor</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Outdoor</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Top Rope</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Lead</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Traditional</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Rescue</span>
                  </div>
                </div>
              </div>
            )}

            {activeSportTab === 'cycling' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Road Cycling</h4>
                  <span className="px-3 py-1 bg-explore-green text-white rounded-full text-xs font-medium">
                    Expert
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">8 years</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Distance:</span>
                    <div className="font-medium text-black">60-100km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Preferred Pace:</span>
                    <div className="font-medium text-black">30-35 kph</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Group Rides:</span>
                    <div className="font-medium text-black">Leader</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Road</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Group Leader</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Racing</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Commuting</span>
                  </div>
                </div>
              </div>
            )}

            {activeSportTab === 'running' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black">Distance Running</h4>
                  <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">
                    Intermediate
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <div className="font-medium text-black">5 years</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Distance:</span>
                    <div className="font-medium text-black">10-15km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Best Pace:</span>
                    <div className="font-medium text-black">5:30/km</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Goals:</span>
                    <div className="font-medium text-black">Marathon</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Trail</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Road</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Morning Runs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activities & Reviews Section */}
        <div ref={activitiesRef} className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Activities & Reviews</h3>
            <span className="text-sm text-gray-500">42 total</span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed Activities
            </button>
            <button
              onClick={() => setActiveTab('organized')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'organized'
                  ? 'bg-white text-explore-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Organized Activities
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === 'completed' ? (
              <>
                {/* Completed Activities with Reviews */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Advanced Technique Workshop</h4>
                      <p className="text-sm text-gray-600">London Climbing Academy • Jan 15, 2025</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">Your review: "Excellent workshop!"</span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Organized Activities */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Westway Women's+ Climbing Morning</h4>
                      <p className="text-sm text-gray-600">You organized • Feb 5, 2025</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">4.9 avg rating (12 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">"Holly is an amazing coach!" - Sarah</p>
                    </div>
                    <div className="text-xs text-gray-500">12 joined</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-explore-green">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">🧗</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">Beginner Climbing Workshop</h4>
                      <p className="text-sm text-gray-600">You organized • Jan 28, 2025</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">4.8 avg rating (15 reviews)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">"Perfect for beginners, very patient" - Alice</p>
                    </div>
                    <div className="text-xs text-gray-500">15 joined</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clubs Section */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-black mb-4">Clubs</h3>
          
          <div className="space-y-3">
            <Link to="/club/westway" className="block">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=40&h=40&fit=crop"
                  alt="Westway Climbing"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black">Westway Climbing Centre</h4>
                  <p className="text-sm text-gray-600">Instructor • 245 members</p>
                </div>
              </div>
            </Link>
            
            <Link to="/club/richmond-runners" className="block">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F7c405a1be5e04dc69eb62c5c70ba6efc?format=webp&width=800"
                  alt="Richmond Cycling Club"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black">Richmond Cycling Club</h4>
                  <p className="text-sm text-gray-600">Member • 182 members</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Location Section */}
        <div className="px-6 pb-8">
          <h3 className="text-lg font-bold text-black mb-4">Location</h3>
          
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">London, UK</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
