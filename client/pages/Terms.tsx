import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, AlertTriangle, Gavel } from "lucide-react";

export default function Terms() {
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
        <h1 className="text-xl font-bold text-black font-cabin">Terms of Service</h1>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="px-6 pb-20 space-y-6">
        {/* Header */}
        <div className="text-center">
          <Shield className="w-16 h-16 text-explore-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-explore-green font-cabin mb-2">
            Terms of Service
          </h2>
          <p className="text-gray-600 font-cabin text-sm">
            Last updated: January 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-explore-green" />
              <h3 className="text-lg font-bold text-black font-cabin">1. Acceptance of Terms</h3>
            </div>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              By accessing and using Wildpals ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-black font-cabin">2. Activity Participation & Safety</h3>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700 font-cabin text-sm leading-relaxed">
                <strong>Important:</strong> Outdoor activities involve inherent risks. By participating in activities organized through Wildpals, you acknowledge that:
              </p>
              <ul className="text-gray-700 font-cabin text-sm space-y-2 ml-4">
                <li>• You participate at your own risk and responsibility</li>
                <li>• You have the necessary skills and fitness level for chosen activities</li>
                <li>• You will follow safety guidelines and use appropriate equipment</li>
                <li>• Wildpals is not responsible for accidents, injuries, or damages</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">3. User Responsibilities</h3>
            <ul className="text-gray-700 font-cabin text-sm space-y-2">
              <li>• Provide accurate and truthful information</li>
              <li>• Respect other users and maintain appropriate conduct</li>
              <li>• Only create activities you intend to organize</li>
              <li>• Communicate clearly about activity requirements and difficulty</li>
              <li>• Report any safety concerns or inappropriate behavior</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">4. Liability Disclaimer</h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-gray-700 font-cabin text-sm leading-relaxed">
                <strong>IMPORTANT:</strong> Wildpals acts solely as a platform connecting users. We do not organize, supervise, or guarantee any activities. Users participate entirely at their own risk. Wildpals disclaims all liability for personal injury, property damage, or any losses arising from activity participation.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">5. User Content</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              You retain ownership of content you post, but grant Wildpals a license to use, display, and distribute your content on the platform. You are responsible for ensuring your content doesn't violate any laws or third-party rights.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">6. Account Termination</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We may suspend or terminate accounts for violations of these terms, inappropriate behavior, or safety concerns. You may delete your account at any time through the app settings.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">7. Prohibited Activities</h3>
            <ul className="text-gray-700 font-cabin text-sm space-y-2">
              <li>• Commercial use without permission</li>
              <li>• Creating fake or misleading activities</li>
              <li>• Harassment or discriminatory behavior</li>
              <li>• Sharing inappropriate or offensive content</li>
              <li>• Attempting to access other users' accounts</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="w-5 h-5 text-explore-green" />
              <h3 className="text-lg font-bold text-black font-cabin">8. Governing Law</h3>
            </div>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              These terms are governed by the laws of the United Kingdom. Any disputes will be resolved through binding arbitration or UK courts.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h3 className="text-lg font-bold text-black font-cabin mb-3">9. Changes to Terms</h3>
            <p className="text-gray-700 font-cabin text-sm leading-relaxed">
              We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms. We'll notify users of significant changes.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-bold text-black font-cabin mb-2">Questions?</h3>
            <p className="text-gray-700 font-cabin text-sm">
              If you have questions about these terms, contact us at:
            </p>
            <p className="text-explore-green font-cabin font-medium text-sm mt-1">
              legal@wildpals.com
            </p>
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
