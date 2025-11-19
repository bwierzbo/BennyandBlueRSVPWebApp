'use client'

import Image from "next/image"
import Link from "next/link"
import { Button, PageBanner } from "@/components/ui"
import { useState } from "react"

export default function TravelPage() {
  const [activeTab, setActiveTab] = useState<'hotels' | 'airbnbs' | 'bnbs'>('hotels')

  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-dustyPink-50 to-wedding-lavender-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Banner with Floating Back Button */}
      <div className="relative">
        <PageBanner
          src="/images/lavender-banner.jpg"
          alt="Beautiful lavender fields"
          height={400}
          className="rounded-b-lg shadow-sm"
          priority={true}
        />

        {/* Floating Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-white/50 dark:border-gray-700/50 shadow-lg hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-10 h-10 text-wedding-roseGold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Travel & Accommodations
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about getting to Port Angeles
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Flying In Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Flying In
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Airport
                </h3>
                <p className="mb-2">
                  <span className="font-medium">Seattle-Tacoma International Airport</span> (SEA)
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Approximately 126 miles from Port Angeles (2.5-3 hours)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>💡 Tip:</strong> SEA-TAC is the only major airport serving the Olympic Peninsula. We recommend booking your flights early to get the best rates!
                </p>
              </div>
            </div>
          </div>

          {/* Car Rental Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Car Rental
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                A rental car is essential for getting to Port Angeles and exploring the Olympic Peninsula. All major car rental companies operate at SEA-TAC&apos;s off-site rental car facility.
              </p>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Available Companies
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Enterprise
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hertz
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Avis
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Budget
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    National
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Alamo
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Payless
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    SIXT
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm mb-2">
                  <strong>🚗 Getting to Rental Cars:</strong> Take the free 24/7 shuttle from the airport (5-minute ride to off-site facility).
                </p>
                <p className="text-sm">
                  <strong>⚠️ Note:</strong> The rental car facility is currently experiencing construction. Allow extra time for pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Getting There - Two Routes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Getting to Port Angeles
              </h2>
            </div>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <p className="text-gray-600 dark:text-gray-400">
                There are two ways to get from SEA-TAC to Port Angeles. Both take about the same total time (~2.5-3 hours), but offer different experiences.
              </p>

              {/* Route Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Route 1: Drive via Tacoma */}
                <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-5 bg-green-50 dark:bg-green-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Route 1: Drive via Tacoma
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Distance:</strong> 126 miles</p>
                    <p><strong>Time:</strong> 2.5-2.75 hours</p>
                    <p><strong>Cost:</strong> Free (no tolls northbound)</p>
                    <p className="text-green-700 dark:text-green-300"><strong>Pros:</strong> Fastest, most direct, preferred by locals</p>
                  </div>
                </div>

                {/* Route 2: Ferry + Drive */}
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-5 bg-blue-50 dark:bg-blue-900/10">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Route 2: Scenic Ferry Route
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Distance:</strong> 87 miles driving + 35-min ferry</p>
                    <p><strong>Time:</strong> 2.5-3 hours (includes ferry wait)</p>
                    <p><strong>Cost:</strong> $14.65-$18.65 vehicle + driver</p>
                    <p className="text-blue-700 dark:text-blue-300"><strong>Pros:</strong> Scenic, relaxing ferry experience</p>
                  </div>
                </div>
              </div>

              {/* Detailed Route 1 Directions */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                  Route 1: Detailed Directions (via Tacoma)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>From SEA-TAC, head north on I-5</li>
                  <li>Take I-5 South toward Tacoma</li>
                  <li>Exit onto Highway 16 West (toward Bremerton)</li>
                  <li>Cross the Tacoma Narrows Bridge (toll-free northbound)</li>
                  <li>Continue through Gig Harbor on Highway 16</li>
                  <li>Highway 16 becomes Highway 3 North</li>
                  <li>Cross the Hood Canal Bridge (Highway 104)</li>
                  <li>Continue on Highway 101 North</li>
                  <li>Follow Highway 101 to Port Angeles</li>
                </ol>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  <strong>💡 Tip:</strong> Avoid Friday late afternoons if possible to minimize traffic on I-5 and Highway 16.
                </p>
              </div>

              {/* Detailed Route 2 Directions + Ferry Info */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                  Route 2: Ferry + Drive Directions
                </h3>

                <div className="space-y-4">
                  {/* Part 1: SEA-TAC to Ferry */}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Part 1: Drive to Seattle Ferry Terminal</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>From SEA-TAC, head north on I-5</li>
                      <li>Take Exit 164A toward Waterfront/Stadiums</li>
                      <li>Follow signs to Coleman Dock Ferry Terminal</li>
                      <li>Address: 801 Alaskan Way Pier 52, Seattle, WA 98104</li>
                    </ol>
                  </div>

                  {/* Ferry Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-semibold text-gray-900 dark:text-white">Seattle-Bainbridge Ferry Information</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Crossing Time:</strong> 35 minutes</p>
                      <p><strong>Frequency:</strong> 10-12 sailings daily (weekdays), 9-11 (weekends)</p>
                      <p><strong>Fares:</strong> $14.65-$18.65 for vehicle + driver (one-way, westbound only)</p>
                      <p><strong>Passengers:</strong> $10.25 adults (round-trip), Seniors $5.10, Under 19 FREE</p>
                      <p className="text-orange-700 dark:text-orange-300">
                        <strong>⚠️ Important:</strong> NO RESERVATIONS available - first-come, first-served
                      </p>
                      <p>
                        <strong>💡 Arrival Time:</strong> Arrive 20 minutes early (1 hour during peak times/summer weekends)
                      </p>
                      <p>
                        <a
                          href="https://wsdot.com/ferries/schedule/scheduledetailbyroute.aspx?route=sea-bi"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-wedding-roseGold-600 hover:text-wedding-roseGold-700 dark:text-wedding-roseGold-400 font-medium"
                        >
                          View Live Ferry Schedule →
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Part 2: Bainbridge to Port Angeles */}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Part 2: Drive from Bainbridge Island to Port Angeles</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Exit ferry at 270 Olympic Drive SE, Bainbridge Island</li>
                      <li>Follow Highway 305 North (13 miles)</li>
                      <li>Continue on Highway 3 North (7 miles)</li>
                      <li>Cross Hood Canal Bridge on Highway 104 (11 miles)</li>
                      <li>Turn onto Highway 101 North</li>
                      <li>Continue through Sequim to Port Angeles</li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Note:</strong> Hood Canal Bridge occasionally opens for boat traffic, which may cause brief delays.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-wedding-roseGold-100 dark:bg-wedding-roseGold-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-wedding-roseGold-600 dark:text-wedding-roseGold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                The Venue
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Olympic Bluffs Cidery & Lavender Farm
                </h3>
                <p className="mb-3 text-gray-600 dark:text-gray-400">
                  A stunning location cradled between the Olympic Mountains and the Strait of Juan de Fuca, featuring lavender fields, orchards, and sweeping ocean and mountain views.
                </p>
                <p className="mb-2">
                  1025 Finn Hall Road<br />
                  Port Angeles, WA 98362
                </p>
                <a
                  href="https://www.google.com/maps/place/1025+Finn+Hall+Rd,+Port+Angeles,+WA+98362"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wedding-roseGold-600 hover:text-wedding-roseGold-700 dark:text-wedding-roseGold-400 font-medium inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Parking
                </h3>
                <p className="text-sm">
                  Free on-site parking is available at the venue.
                </p>
              </div>
            </div>
          </div>

          {/* Accommodations Section with Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Where to Stay
              </h2>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex gap-4" aria-label="Accommodation types">
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'hotels'
                      ? 'border-wedding-roseGold-600 text-wedding-roseGold-600 dark:text-wedding-roseGold-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Hotels
                </button>
                <button
                  onClick={() => setActiveTab('airbnbs')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'airbnbs'
                      ? 'border-wedding-roseGold-600 text-wedding-roseGold-600 dark:text-wedding-roseGold-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Airbnbs
                </button>
                <button
                  onClick={() => setActiveTab('bnbs')}
                  className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'bnbs'
                      ? 'border-wedding-roseGold-600 text-wedding-roseGold-600 dark:text-wedding-roseGold-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  B&Bs
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              {activeTab === 'hotels' && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Here are some recommended hotels in the Port Angeles area:
                  </p>

                  {/* Olympic Lodge by Ayres */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Olympic Lodge by Ayres
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      140 Del Guzzi Drive, Port Angeles, WA 98362
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Features:</span> Modern amenities, comfortable rooms, convenient location</p>
                      <p><span className="font-medium">Distance:</span> ~3 miles from venue</p>
                    </div>
                  </div>

                  {/* Red Lion Hotel */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Red Lion Hotel Port Angeles Harbor
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      221 N Lincoln Street, Port Angeles, WA 98362
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Features:</span> Harbor views, on-site restaurant, downtown location</p>
                      <p><span className="font-medium">Distance:</span> ~5 miles from venue</p>
                    </div>
                  </div>

                  {/* Quality Inn */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Quality Inn Port Angeles
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      2522 E 1st Street, Port Angeles, WA 98362
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Features:</span> Affordable rates, complimentary breakfast, pool</p>
                      <p><span className="font-medium">Distance:</span> ~4 miles from venue</p>
                    </div>
                  </div>

                  {/* Olympic Inn & Suites */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Olympic Inn & Suites
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      2909 E 1st Street, Port Angeles, WA 98362
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Features:</span> Budget-friendly, clean rooms, easy highway access</p>
                      <p><span className="font-medium">Distance:</span> ~4 miles from venue</p>
                    </div>
                  </div>

                  {/* Domaine Madeleine */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Domaine Madeleine
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      146 Wildflower Lane, Port Angeles, WA 98362
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Features:</span> Boutique B&B-style hotel, waterfront views, gourmet breakfast</p>
                      <p><span className="font-medium">Distance:</span> ~2 miles from venue</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'airbnbs' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Airbnb and vacation rental information will be added soon.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    In the meantime, search for rentals in Port Angeles, WA on Airbnb or VRBO.
                  </p>
                </div>
              )}

              {activeTab === 'bnbs' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Bed & Breakfast information will be added soon.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Port Angeles has several charming B&Bs - check back for our recommendations!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Travel Tips Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Travel Tips
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Exploring the Olympic Peninsula
                </h3>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  <li>
                    <strong>Olympic National Park:</strong> Port Angeles is the gateway to this stunning park. Consider arriving early or staying late to explore!
                  </li>
                  <li>
                    <strong>Hurricane Ridge:</strong> Just 20 minutes from Port Angeles, offering breathtaking mountain and ocean views. A must-see if you have time.
                  </li>
                  <li>
                    <strong>Best Time to Visit:</strong> August typically offers the warmest, driest weather (average highs around 68°F).
                  </li>
                  <li>
                    <strong>Layer Your Clothing:</strong> Temperatures can vary throughout the day. Bring a light jacket even in summer.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Local Information
                </h3>
                <p className="text-sm mb-2">
                  <strong>Port Angeles Visitor Center:</strong> 121 E Railroad Ave<br />
                  <strong>Hours:</strong> Mon-Fri 9:30am-5:30pm, Sat 10am-4pm, Sun 10am-1pm
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm">
                  <strong>✨ Special Note:</strong> If you&apos;re extending your trip, the Victoria Clipper ferry from Port Angeles to Victoria, BC (Canada) makes for an excellent day trip! Don&apos;t forget your passport.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-wedding-lavender-50 dark:bg-gray-800 border border-wedding-lavender-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              Have Questions?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you need help with travel arrangements or have any questions, please don&apos;t hesitate to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-wedding-roseGold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+15712713751"
                  className="text-wedding-roseGold-600 hover:text-wedding-roseGold-700 dark:text-wedding-roseGold-400 font-medium"
                >
                  (571) 271-3751
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-wedding-roseGold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:bwierzbo@gmail.com"
                  className="text-wedding-roseGold-600 hover:text-wedding-roseGold-700 dark:text-wedding-roseGold-400 font-medium"
                >
                  bwierzbo@gmail.com
                </a>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/rsvp">
                <Button variant="outline" size="sm">
                  RSVP Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
