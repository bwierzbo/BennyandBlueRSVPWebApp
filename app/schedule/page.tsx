import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Weekend Schedule | Kourtney & Benjamin',
  description:
    "The full weekend schedule for Kourtney & Benjamin's wedding at Olympic Bluffs Cidery & Lavender Farm.",
}

interface ScheduleItem {
  time: string
  title: string
  description?: string
  highlight?: boolean
}

const fridayEvents: ScheduleItem[] = [
  {
    time: '6:00 PM',
    title: 'Ceremony Rehearsal',
    description:
      'For the wedding party and those with a role in the ceremony only — everyone else can arrive for dinner.',
  },
  {
    time: '7:00 PM',
    title: 'Rehearsal Dinner',
    description:
      'All guests are welcome! Join us for a casual dinner at the Olympic Bluffs Cidery. Dress is come as you are (most people are dressing somewhat nice). We wrap up at 9:00 PM so everyone is rested for the big day.',
    highlight: true,
  },
]

const saturdayEvents: ScheduleItem[] = [
  {
    time: '4:30 PM',
    title: 'Guests Arrive — Cocktail Hour',
    description:
      'Join us at the Olympic Bluffs Cidery for drinks, oysters, and appetizers.',
  },
  {
    time: '5:30 PM',
    title: 'Head to the Ceremony',
    description:
      'The bar closes and everyone makes the short walk from the cidery to the ceremony site on the bluff. Please be in your seat by 5:55.',
  },
  {
    time: '6:00 PM',
    title: 'Ceremony',
    description: 'On the bluff at Salt & Cedar, overlooking the water.',
    highlight: true,
  },
  {
    time: '6:35 PM',
    title: 'Carry Your Chair to the Tent',
    description:
      'A little tradition of ours: after the ceremony, each guest carries their chair to the reception tent and sets it at their table. Helpers will be on hand for anyone who needs one.',
  },
  {
    time: '6:45 PM',
    title: 'Pre-Reception at the Tent',
    description:
      'Enjoy appetizers and drinks, sign the guest book, and find your seat while the wedding party takes photos.',
  },
  {
    time: '7:25 PM',
    title: 'Grand Entrance',
    description: 'Please be seated in the tent by 7:20 to welcome the newlyweds!',
  },
  {
    time: '7:30 PM',
    title: 'Dinner',
    description: 'The buffet opens and tables are called up by the band.',
  },
  {
    time: '8:05 PM',
    title: 'Toasts',
  },
  {
    time: '8:25 PM',
    title: 'Cake Cutting',
    description: 'Dessert and the buffet stay open through the evening.',
  },
  {
    time: '8:30 PM',
    title: 'Special Dances',
    description: 'Followed by the dance floor opening for everyone.',
  },
  {
    time: '8:45 PM',
    title: 'Live Music & Dancing',
    description: 'Live band until 9:45, then the DJ takes over.',
  },
  {
    time: '11:00 PM',
    title: 'Last Call',
  },
  {
    time: '11:30 PM',
    title: 'Good Night!',
    description: 'We say our goodbyes and send you off with full hearts.',
  },
]

const sundayEvents: ScheduleItem[] = [
  {
    time: '11:00 AM',
    title: 'Farewell Brunch',
    description:
      'One last gathering at the Olympic Bluffs Cidery — pastries, coffee, and goodbyes until 1:00 PM.',
    highlight: true,
  },
  {
    time: '1:00 PM',
    title: 'Beach Time',
    description: 'Sticking around? Join us down at the beach before you head home.',
  },
]

function Timeline({ events }: { events: ScheduleItem[] }) {
  return (
    <ol className="relative border-l-2 border-wedding-roseGold-200 dark:border-wedding-roseGold-400/40 ml-3 sm:ml-4 space-y-8">
      {events.map((event) => (
        <li key={`${event.time}-${event.title}`} className="relative pl-6 sm:pl-8">
          <span
            className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ring-4 ring-white dark:ring-gray-900 ${
              event.highlight
                ? 'bg-wedding-roseGold-500'
                : 'bg-wedding-dustyPink-300 dark:bg-wedding-dustyPink-500'
            }`}
            aria-hidden
          />
          <p className="text-sm font-semibold uppercase tracking-wide text-wedding-roseGold-600 dark:text-wedding-roseGold-400 mb-1">
            {event.time}
          </p>
          <h3
            className={`font-display font-semibold text-gray-900 dark:text-white ${
              event.highlight ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            }`}
          >
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">
              {event.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

export default function Schedule() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(212,160,86,0.08),transparent_35%),_radial-gradient(circle_at_80%_10%,rgba(213,145,185,0.08),transparent_30%),_linear-gradient(to_bottom_right,rgba(253,244,249,0.8),rgba(254,252,247,0.85))] dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Weekend Schedule
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-2">
              Everything you need to know for the big weekend.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Olympic Bluffs Cidery &amp; Lavender Farm · 1025 Finn Hall Road, Port Angeles, WA
            </p>
          </div>

          {/* Friday */}
          <section className="bg-white/90 dark:bg-gray-800 rounded-2xl border border-wedding-lavender-200 dark:border-gray-700 shadow-md p-6 sm:p-10 mb-10">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                Rehearsal Dinner
              </h2>
              <p className="text-lg text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 font-semibold">
                Friday, August 21, 2026
              </p>
            </div>
            <Timeline events={fridayEvents} />
          </section>

          {/* Saturday */}
          <section className="bg-white/90 dark:bg-gray-800 rounded-2xl border border-wedding-dustyPink-200 dark:border-gray-700 shadow-md p-6 sm:p-10 mb-10">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                The Wedding Day
              </h2>
              <p className="text-lg text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 font-semibold">
                Saturday, August 22, 2026
              </p>
            </div>
            <Timeline events={saturdayEvents} />
          </section>

          {/* Sunday */}
          <section className="bg-white/90 dark:bg-gray-800 rounded-2xl border border-wedding-cream-400 dark:border-gray-700 shadow-md p-6 sm:p-10 mb-12">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                Farewell Brunch
              </h2>
              <p className="text-lg text-wedding-dustyPink-600 dark:text-wedding-dustyPink-400 font-semibold">
                Sunday, August 23, 2026
              </p>
            </div>
            <Timeline events={sundayEvents} />
          </section>

          {/* Good to know */}
          <section className="bg-wedding-lavender-50 dark:bg-gray-800 rounded-2xl border border-wedding-lavender-200 dark:border-gray-700 shadow-sm p-6 sm:p-8 mb-12">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Good to Know
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-200 leading-relaxed list-disc pl-5">
              <li>The entire celebration is outdoors — late-August evenings on the bluff cool off, so bring a light layer.</li>
              <li>Free parking is available at the venue.</li>
              <li>
                Dress code is garden party / semi-formal — details in the{' '}
                <Link href="/#faq" className="text-wedding-roseGold-600 dark:text-wedding-roseGold-400 underline">
                  FAQ
                </Link>
                .
              </li>
            </ul>
          </section>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/rsvp">
              <Button size="lg" className="w-full sm:w-auto">
                RSVP Now
              </Button>
            </Link>
            <Link href="/travel">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Travel &amp; Accommodations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
