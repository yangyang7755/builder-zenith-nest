import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Share2, Database, MapPin, Bell } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

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
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">Privacy Policy</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="px-6 pb-20 space-y-6">
        {/* Header */}
        <div className="text-center">
          <Lock className="w-16 h-16 text-explore-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
            Privacy Policy
          </h2>
          <p className="text-gray-600 font-cabin text-sm">
            Last updated: January 2025
          </p>
        </div>

        {/* Privacy Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-explore-green" />
              <h3 className="text-lg font-bold text-black font-cabin">1. Information We Collect</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black font-cabin text-sm mb-2">Personal Information:</h4>
                <ul className="text-gray-700 font-cabin text-sm space-y-1 ml-4">
                  <li>• Name, email address, and phone number</li>
                  <li>• Date of birth and gender (for age-appropriate matching)</li>
                  <li>• Profile photos and bio information</li>
                  <li>• University/institution and profession</li>
                  <li>• Sports interests and skill levels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black font-cabin text-sm mb-2">Activity Data:</h4>
                <ul className="text-gray-700 font-cabin text-sm space-y-1 ml-4">
                  <li>• Activities you create, join, or express interest in</li>
                  <li>• Messages and communications with other users</li>
                  <li>• Reviews and feedback you provide</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-black font-cabin">2. Location Information</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 font-cabin text-sm leading-relaxed">
                We collect location data to show nearby activities and help you find local sports partners. You can control location sharing in your device settings. We do not track your location continuously.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-explore-green" />
              <h3 className="text-lg font-bold text-black font-cabin">3. How We Use Your Information</h3>
            </div>
            <ul className="text-gray-700 font-cabin text-sm space-y-2">
              <li>• Connect you with compatible sports partners and activities</li>
              <li>• Personalize your experience and activity recommendations</li>
              <li>• Facilitate communication between users</li>
              <li>• Ensure platform safety and prevent misuse</li>
              <li>• Send important updates and notifications</li>
              <li>• Improve our services through analytics</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-black font-cabin">4. Information Sharing</h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-black font-cabin text-sm mb-2">With Other Users:</h4>
                <p className="text-gray-700 font-cabin text-sm leading-relaxed">
                  Your profile information (name, photo, sports interests, skill level) is visible to other users to facilitate connections. You control what additional information to share.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-black font-cabin text-sm mb-2">We DO NOT Sell Your Data:</h4>
                <p className="text-gray-700 font-cabin text-sm leading-relaxed">
                  We never sell personal information to third parties. We only share data when required by law or to protect users' safety.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">5. Data Security</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We use industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no system is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-black font-cabin">6. Communications & Notifications</h3>
            </div>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We may send you activity updates, safety alerts, and promotional messages. You can control notification preferences in your account settings or unsubscribe at any time.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">7. Data Retention</h3>
            <ul className="text-gray-700 font-cabin text-sm space-y-2">
              <li>• Account information: Retained while your account is active</li>
              <li>• Activity history: Kept for 2 years for safety and platform improvement</li>
              <li>• Messages: Deleted after 1 year unless reported for safety</li>
              <li>• You can request account deletion at any time</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">8. Your Rights (GDPR)</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 font-cabin text-sm leading-relaxed mb-2">
                You have the right to:
              </p>
              <ul className="text-gray-700 font-cabin text-sm space-y-1">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and data</li>
                <li>• Export your data</li>
                <li>• Object to certain processing</li>
              </ul>
            </div>
          </div>

          {/* Section 9 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">9. Cookies & Analytics</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We use essential cookies for app functionality and analytics cookies to understand how users interact with our platform. You can control cookie preferences in your browser settings.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">10. Children's Privacy</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              Wildpals is not intended for users under 16. We do not knowingly collect personal information from children under 16. If you believe we have collected such information, please contact us immediately.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">11. International Transfers</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              Your data may be processed in countries outside your residence. We ensure appropriate safeguards are in place to protect your information during any transfers.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">12. Changes to Privacy Policy</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We may update this privacy policy to reflect changes in our practices or for legal reasons. We'll notify you of significant changes and update the "Last modified" date.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-black font-cabin mb-2">Contact Us</h3>
            <p className="text-gray-700 font-cabin text-sm mb-2">
              For privacy questions or to exercise your rights:
            </p>
            <div className="space-y-1">
              <p className="text-explore-green font-cabin font-medium text-sm">
                Email: privacy@wildpals.com
              </p>
              <p className="text-explore-green font-cabin font-medium text-sm">
                Data Protection Officer: dpo@wildpals.com
              </p>
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <div className="pt-6">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-explore-green text-white py-4 px-6 rounded-lg font-cabin font-medium text-lg hover:bg-green-600"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
