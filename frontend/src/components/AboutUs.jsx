import React from 'react';
import { FaShieldAlt, FaCheckCircle, FaMapMarkedAlt, FaRobot } from 'react-icons/fa';
import { GiMedicalPack, GiHealthPotion } from 'react-icons/gi';
import { MdVerified } from 'react-icons/md';

const AboutUs = () => {
  const features = [
    {
      icon: <MdVerified className="text-5xl text-yellow-500" />,
      title: "Verified Products",
      description: "Access only approved medicines and cosmetics registered with Sri Lankan health authorities.",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200"
    },
    {
      icon: <FaShieldAlt className="text-5xl text-green-500" />,
      title: "Safety First",
      description: "Ensure the products you buy are safe, effective, and legally approved for use.",
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      borderColor: "border-green-200"
    },
    {
      icon: <FaMapMarkedAlt className="text-5xl text-blue-500" />,
      title: "Easy Navigation",
      description: "Find nearby pharmacies and available products with our comprehensive location services.",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <GiMedicalPack className="text-5xl text-purple-500" />,
      title: "Rare Medicines",
      description: "Locate hard-to-find and life-saving drugs through our specialized search system.",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      icon: <FaRobot className="text-5xl text-red-500" />,
      title: "AI Assistant",
      description: "Get instant answers to your health product questions with our smart chatbot.",
      bgColor: "bg-gradient-to-br from-red-50 to-pink-50",
      borderColor: "border-red-200"
    },
    {
      icon: <GiHealthPotion className="text-5xl text-cyan-500" />,
      title: "Health Products",
      description: "Discover a wide range of approved cosmetics and healthcare items.",
      bgColor: "bg-gradient-to-br from-cyan-50 to-blue-50",
      borderColor: "border-cyan-200"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="text-center mb-12">
<h2  className="text-4xl md:text-5xl font-bold mb-4"
  style={{
    backgroundImage: 'linear-gradient(to right, #14532d, #15803d, #ca8a04)',WebkitBackgroundClip: 'text',MozBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',MozTextFillColor: 'transparent',backgroundClip: 'text',color: 'transparent',display: 'inline-block'
  }} >
  About CosmoMed Navigator</h2>
  <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-6 rounded-full"></div>
</div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your trusted companion for accessing safe medicines and health products in Sri Lanka. 
            We bridge the gap between consumers, pharmacies, and regulatory information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-4">
                To empower Sri Lankans with easy access to verified health products, 
                ensuring safety and transparency in every purchase.
              </p>
              <p className="text-gray-700 mb-6">
                We collaborate with the National Medicines Regulatory Authority (NMRA) 
                and pharmacies across the island to provide real-time information on 
                product availability and regulatory status.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">10,000+</div>
                  <div className="text-gray-600">Verified Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600">Partner Pharmacies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-gray-600">AI Support</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Us?</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time product approval verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Nationwide pharmacy network</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Mobile-friendly and accessible design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Free service with no hidden costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;