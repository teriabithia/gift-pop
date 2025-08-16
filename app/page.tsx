import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Heart, Share2, Gift, Sparkles, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 py-16 px-4 pt-0 pb-20 pb-20 pb-16 pb-14 pb-11 pb-4 pb-5">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="relative overflow-hidden h-20 mb-6 py-5">
            <div className="absolute top-2 left-0 p-3 bg-purple-primary/10 rounded-2xl animate-roll">
              <Gift className="h-10 w-10 text-purple-primary" />
            </div>
          </div>

          <h1 className="font-bold text-gray-900 mb-6 leading-tight text-5xl">
            Find the <span className="text-purple-primary font-extrabold">Perfect Gift</span>
            <span className="text-gray-900 block">Every Time</span>
          </h1>

          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg mb-16">
            Let our AI-powered recommendations help you discover thoughtful gifts that will make your loved ones smile.
            No more guessing, just perfect presents.
          </p>

          <Link href="/wizard/step-1">
            <Button size="xl" className="shadow-[0_8px_20px_rgba(147,51,234,0.4)] animate-breathe">
              <Sparkles className="mr-3 h-6 w-6" />
              Find Gifts Now
            </Button>
          </Link>
        </div>

        <div className="absolute top-20 left-10 opacity-20 animate-bounce" style={{ animationDuration: "3s" }}>
          <Gift className="h-16 w-16 text-purple-primary rotate-12" />
        </div>
        <div
          className="absolute bottom-20 right-10 opacity-20 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        >
          <Heart className="h-12 w-12 text-green-success rotate-45" />
        </div>
        <div
          className="absolute top-1/2 left-5 opacity-15 animate-bounce"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        >
          <Sparkles className="h-10 w-10 text-blue-secondary rotate-12" />
        </div>
        <div
          className="absolute top-1/3 right-5 opacity-15 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
        >
          <Users className="h-8 w-8 text-purple-primary rotate-45" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 bg-transparent py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-3xl mb-6">How GiftPop Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Three simple steps to discover the perfect gift for anyone on your list
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 p-4 rounded-xl py-7 border-indigo-100 shadow-none">
              <CardHeader className="pb-2">
                <div className="mx-auto mb-3 p-2.5 bg-gradient-to-br from-purple-primary to-purple-primary-dark rounded-2xl w-fit">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-semibold text-gray-900 text-xl">Chat with AI</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="leading-relaxed text-gray-600 text-base">
                  Tell our intelligent AI about the person you're shopping for. Share their interests, personality, and
                  what makes them special.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 p-4 rounded-xl py-7 border-emerald-100 shadow-none">
              <CardHeader className="pb-2">
                <div className="mx-auto mb-3 p-2.5 bg-gradient-to-br from-green-success to-emerald-600 rounded-2xl w-fit bg-lime-200">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-semibold text-gray-900 text-xl">Get Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="leading-relaxed text-gray-600 text-base">
                  Receive personalized gift suggestions tailored to your recipient's unique preferences, budget, and the
                  occasion you're celebrating.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 p-4 rounded-xl py-7 shadow-none border-blue-100">
              <CardHeader className="pb-2">
                <div className="mx-auto mb-3 p-2.5 bg-gradient-to-br from-blue-secondary to-blue-700 rounded-2xl w-fit">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-semibold text-gray-900 text-xl">Share & Choose</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="leading-relaxed text-gray-600 text-base">
                  Create shareable gift lists and let others help you choose, or save your favorites for future
                  occasions and easy shopping.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 relative overflow-hidden bg-white py-20 pt-20 pb-24">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bold text-gray-900 mb-4 text-3xl">Trusted by Gift-Givers Worldwide</h2>
            <p className="font-bold text-gray-900 mb-4 text-lglg">
              Join thousands who have found the perfect gift with GiftPop
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-primary mb-3">10,000+</div>
              <div className="text-lg text-gray-700 font-medium">Happy Gift Givers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-primary mb-3">50,000+</div>
              <div className="text-lg text-gray-700 font-medium">Perfect Matches</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-primary mb-3">98%</div>
              <div className="text-lg text-gray-700 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden min-h-screen bg-gradient-to-b from-[#f7ecff] via-[#fff5ff] to-[#f3f0ff]">
        <div className="pointer-events-none absolute inset-0 blur-[80px] -z-10">
          <div className="absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full bg-[#bda4ff]/45"></div>
          <div className="absolute -top-16 right-12 h-[380px] w-[380px] rounded-full bg-[#ff9ad4]/35"></div>
          <div className="absolute bottom-24 left-1/3 h-[460px] w-[460px] rounded-full bg-[#a8b8ff]/30"></div>
          <div className="absolute -bottom-32 -right-24 h-[500px] w-[500px] rounded-full bg-[#ffb8e3]/25"></div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='40' height='40' filter='url(%23n)' opacity='0.4'/></svg>")`,
          }}
        ></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 opacity-30 animate-float">
            <Gift className="h-16 w-16 text-purple-600 rotate-12" />
          </div>
          <div className="absolute top-32 right-16 opacity-25 animate-float" style={{ animationDelay: "1s" }}>
            <Gift className="h-12 w-12 text-purple-600 rotate-45" />
          </div>
          <div className="absolute bottom-24 left-20 opacity-20 animate-float" style={{ animationDelay: "2s" }}>
            <Gift className="h-14 w-14 text-purple-600 -rotate-12" />
          </div>

          <div className="absolute top-1/3 left-1/4 opacity-25 animate-float" style={{ animationDelay: "0.5s" }}>
            <Heart className="h-10 w-10 text-pink-400 rotate-12" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 opacity-30 animate-float" style={{ animationDelay: "1.5s" }}>
            <Sparkles className="h-12 w-12 text-purple-500 rotate-45" />
          </div>
          <div className="absolute top-1/2 right-10 opacity-20 animate-float" style={{ animationDelay: "2.5s" }}>
            <Heart className="h-8 w-8 text-pink-400 -rotate-45" />
          </div>

          <div className="absolute top-16 right-1/3 opacity-15 animate-float" style={{ animationDelay: "3s" }}>
            <Users className="h-10 w-10 text-purple-600 rotate-12" />
          </div>
          <div className="absolute bottom-16 left-1/3 opacity-25 animate-float" style={{ animationDelay: "0.8s" }}>
            <Sparkles className="h-14 w-14 text-purple-500 -rotate-12" />
          </div>

          <div className="absolute top-1/4 right-1/2 w-32 h-32 border border-purple-400/20 rounded-full animate-spin-slow"></div>
          <div
            className="absolute bottom-1/4 left-1/2 w-24 h-24 border border-purple-300/10 rounded-full animate-spin-slow"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mx-auto mb-6 opacity-90 relative">
            {/* Explosion rays behind the person */}
            <svg
              width="128"
              height="128"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto relative z-10"
            >
              <g className="animate-pulse" style={{ animationDuration: "2s" }}>
                <path d="M32 8 L34 2 L30 2 Z" fill="#FFD700" opacity="0.7" />
                <path d="M45 15 L50 10 L47 13 Z" fill="#FF6B6B" opacity="0.6" />
                <path d="M50 32 L56 30 L56 34 Z" fill="#4ECDC4" opacity="0.7" />
                <path d="M45 49 L50 54 L47 51 Z" fill="#45B7D1" opacity="0.6" />
                <path d="M32 56 L34 62 L30 62 Z" fill="#96CEB4" opacity="0.7" />
                <path d="M19 49 L14 54 L17 51 Z" fill="#FFEAA7" opacity="0.6" />
                <path d="M14 32 L8 30 L8 34 Z" fill="#DDA0DD" opacity="0.7" />
                <path d="M19 15 L14 10 L17 13 Z" fill="#98D8C8" opacity="0.6" />
              </g>

              {/* Animated ribbons/streamers */}
              <g className="animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }}>
                <path d="M10 20 Q15 15 20 20 Q25 25 30 20" stroke="#FF6B6B" strokeWidth="2" fill="none" opacity="0.8" />
                <path d="M34 20 Q39 15 44 20 Q49 25 54 20" stroke="#4ECDC4" strokeWidth="2" fill="none" opacity="0.8" />
              </g>

              <g className="animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "1s" }}>
                <path d="M8 35 Q13 30 18 35 Q23 40 28 35" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.7" />
                <path d="M36 35 Q41 30 46 35 Q51 40 56 35" stroke="#DDA0DD" strokeWidth="2" fill="none" opacity="0.7" />
              </g>

              {/* Confetti particles */}
              <g className="animate-spin" style={{ animationDuration: "4s" }}>
                <rect x="12" y="12" width="2" height="2" fill="#FF6B6B" opacity="0.8" />
                <rect x="50" y="18" width="2" height="2" fill="#4ECDC4" opacity="0.7" />
                <rect x="15" y="50" width="2" height="2" fill="#FFD700" opacity="0.8" />
                <rect x="48" y="48" width="2" height="2" fill="#96CEB4" opacity="0.7" />
              </g>

              {/* Floating stars */}
              <g className="animate-pulse" style={{ animationDuration: "1.5s" }}>
                <path d="M12 25 L13 27 L15 26 L13 28 L12 30 L11 28 L9 26 L11 27 Z" fill="#FFD700" opacity="0.9" />
                <path d="M52 40 L53 42 L55 41 L53 43 L52 45 L51 43 L49 41 L51 42 Z" fill="#FF6B6B" opacity="0.8" />
                <path d="M18 45 L19 47 L21 46 L19 48 L18 50 L17 48 L15 46 L17 47 Z" fill="#4ECDC4" opacity="0.9" />
              </g>

              {/* Main person illustration */}
              <circle cx="32" cy="18" r="8" fill="#FBBF24" />
              <circle cx="29" cy="16" r="1" fill="#374151" />
              <circle cx="35" cy="16" r="1" fill="#374151" />
              <path
                d="M28 20C28 20 30 22 32 22C34 22 36 20 36 20"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect x="26" y="26" width="12" height="18" rx="6" fill="#8B5CF6" />
              <circle cx="22" cy="32" r="3" fill="#FBBF24" />
              <circle cx="42" cy="32" r="3" fill="#FBBF24" />
              <rect x="19" y="29" width="6" height="6" rx="3" fill="#7C3AED" />
              <rect x="39" y="29" width="6" height="6" rx="3" fill="#7C3AED" />
              <rect x="28" y="30" width="8" height="6" rx="1" fill="#EC4899" />
              <rect x="27" y="29" width="10" height="2" rx="1" fill="#DB2777" />
              <rect x="31" y="27" width="2" height="6" fill="#DB2777" />
              <rect x="29" y="29" width="6" height="2" fill="#DB2777" />
              <rect x="28" y="44" width="3" height="12" rx="1.5" fill="#1F2937" />
              <rect x="33" y="44" width="3" height="12" rx="1.5" fill="#1F2937" />
              <ellipse cx="29.5" cy="58" rx="2" ry="1" fill="#374151" />
              <ellipse cx="34.5" cy="58" rx="2" ry="1" fill="#374151" />
              <circle cx="20" cy="22" r="1" fill="#F59E0B" opacity="0.8" />
              <circle cx="44" cy="24" r="1.5" fill="#F59E0B" opacity="0.7" />
              <circle cx="18" cy="35" r="1" fill="#F59E0B" opacity="0.6" />
              <circle cx="46" cy="38" r="1" fill="#F59E0B" opacity="0.8" />
              <path
                d="M16 28C16 27 17 26 18 27C19 26 20 27 20 28C20 29 18 31 18 31S16 29 16 28Z"
                fill="#EC4899"
                opacity="0.6"
              />
              <path
                d="M44 42C44 41.5 44.5 41 45 41.5C45.5 41 46 41.5 46 42C46 42.5 45 43.5 45 43.5S44 42.5 44 42Z"
                fill="#EC4899"
                opacity="0.7"
              />
            </svg>

            {/* Additional floating celebration elements around the SVG */}
            <div
              className="absolute -top-4 -left-4 animate-bounce"
              style={{ animationDuration: "2s", animationDelay: "0.3s" }}
            >
              <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-80"></div>
            </div>
            <div
              className="absolute -top-2 -right-6 animate-bounce"
              style={{ animationDuration: "2.5s", animationDelay: "0.8s" }}
            >
              <div className="w-2 h-2 bg-pink-400 rounded-full opacity-70"></div>
            </div>
            <div
              className="absolute -bottom-3 -left-5 animate-bounce"
              style={{ animationDuration: "3s", animationDelay: "1.2s" }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full opacity-80"></div>
            </div>
            <div
              className="absolute -bottom-4 -right-4 animate-bounce"
              style={{ animationDuration: "2.2s", animationDelay: "0.6s" }}
            >
              <div className="w-3 h-3 bg-green-400 rounded-full opacity-75"></div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Make Someone's Day?</h2>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            Join thousands of GiftPop users to help them find meaningful presents.
          </p>
          <Link href="/wizard/step-1">
            <Button size="xl" variant="default" className="shadow-[0_8px_20px_rgba(147,51,234,0.3)]">
              Start Finding Gifts
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
