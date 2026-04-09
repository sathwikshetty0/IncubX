'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Zap, Target, Users, BookOpen, ChevronRight, Globe, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F4]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#F8F7F4]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">INCUBX</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
              <Link href="#programs" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Programs</Link>
              <Link href="#mentors" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Mentorship</Link>
              <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">Sign In</Link>
              <Button asChild className="rounded-full px-6">
                <Link href="/register">Join Platform</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Cohort 4 Now Open</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
                Where great ideas <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">become industry icons.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                INCUBX is the world's first AI-integrated incubation ecosystem. We provide the capital, mentorship, and operational excellence needed to turn your vision into a venture.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg shadow-indigo-100 group" asChild>
                  <Link href="/register">
                    Apply to Cohort 4 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-gray-200 hover:bg-white" asChild>
                  <Link href="#programs">View Programs</Link>
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale filter">
                {/* Mock Logos */}
                <div className="font-bold text-xl">TRUSTED BY 100+ FOUNDERS</div>
              </div>
            </div>
            
            <div className="flex-1 relative animate-fade-in">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-200/50 border border-white/20">
                <Image 
                  src="/startup_incubation_hero_1775761776192.png" 
                  alt="IncubX Innovation Hub" 
                  width={800} 
                  height={600}
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </section>

        {/* Features / Benefits */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
              <h2 className="text-base font-semibold text-indigo-600 uppercase tracking-widest mb-3">Our Platform</h2>
              <p className="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight">Everything founders need, in one sophisticated ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Strategic Mentorship',
                  desc: 'Direct access to CXOs and veterans from Fortune 500 companies who have been where you are.',
                  icon: Users,
                  color: 'bg-blue-50 text-blue-600'
                },
                {
                  title: 'Capital Injection',
                  desc: 'Zero-equity grants and access to our exclusive network of 500+ global angel investors.',
                  icon: Target,
                  color: 'bg-indigo-50 text-indigo-600'
                },
                {
                  title: 'Operational Excellence',
                  desc: 'Legal, finance, and marketing support handled by our internal experts while you focus on building.',
                  icon: Zap,
                  color: 'bg-orange-50 text-orange-600'
                },
                {
                  title: 'Global Network',
                  desc: 'Instantly connect with peer founders, beta testers, and partners across 12 countries.',
                  icon: Globe,
                  color: 'bg-purple-50 text-purple-600'
                },
                {
                  title: 'Resource Library',
                  desc: 'Our proprietary "IncubX Knowledge Graph" gives you playbooks for every stage of growth.',
                  icon: BookOpen,
                  color: 'bg-emerald-50 text-emerald-600'
                },
                {
                  title: 'Privacy First',
                  desc: 'Highest tier data protection for all your IP and strategic roadmaps. Your data is your own.',
                  icon: Shield,
                  color: 'bg-zinc-50 text-zinc-600'
                }
              ].map((feature, idx) => (
                <div key={idx} className="group p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-indigo-600 overflow-hidden px-8 py-16 lg:px-16 lg:py-20 text-center text-white shadow-2xl shadow-indigo-200">
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to build the future?</h2>
                <p className="text-lg opacity-80 mb-10 font-light">
                  Join a community of the world's most ambitious founders. Applications for the Summer 2025 cohort close soon.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 rounded-full text-lg font-bold">
                    Start Your Application
                  </Button>
                  <Link href="/programs" className="group flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity">
                    View selection criteria <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              {/* Abstract Background bits */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">I</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">INCUBX</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-indigo-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600">Terms of Service</Link>
            <Link href="#" className="hover:text-indigo-600">Cookie Policy</Link>
            <Link href="#" className="hover:text-indigo-600">Contact Us</Link>
          </div>
          
          <p className="text-sm text-gray-400 font-light">
            © 2025 IncubX Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

