import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowRight,
  Utensils,
  Music,
  Briefcase,
  Cake,
  Smartphone,
  FileText,
  Image,
  FileUser,
  Mail,
  Palette,
  Megaphone,
  Instagram,
  Video,
  PartyPopper,
  Play,
  Facebook,
  Crown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type TabType = 'projects' | 'templates' | 'assistant';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'projects' as TabType, label: 'My Projects', icon: FileText },
    { id: 'templates' as TabType, label: 'Templates', icon: Image },
    { id: 'assistant' as TabType, label: 'Smart Assistant', icon: Palette },
  ];

  const categories = [
    { icon: Utensils, label: 'Food' },
    { icon: Music, label: 'Music' },
    { icon: Briefcase, label: 'Business' },
    { icon: Cake, label: 'Birthday' },
    { icon: Smartphone, label: 'Social Media' },
  ];

  const templates = [
    { label: 'Presentation', color: 'bg-orange-100', icon: FileText },
    { label: 'Poster', color: 'bg-purple-100', icon: Image },
    { label: 'Resume', color: 'bg-teal-100', icon: FileUser },
    { label: 'Email', color: 'bg-pink-100', icon: Mail },
    { label: 'Logo', color: 'bg-yellow-100', icon: Palette },
    { label: 'Flyer', color: 'bg-violet-100', icon: Megaphone },
    { label: 'Instagram Post', color: 'bg-rose-100', icon: Instagram },
    { label: 'Instagram Story', color: 'bg-indigo-100', icon: Instagram },
    { label: 'Video', color: 'bg-slate-200', icon: Video },
    { label: 'Invitation', color: 'bg-fuchsia-100', icon: PartyPopper },
    { label: 'Mobile Video', color: 'bg-purple-200', icon: Play },
    { label: 'Facebook Post', color: 'bg-blue-100', icon: Facebook },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal Utility Bar */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <Link to="/pricing">
          <Button 
            variant="outline" 
            className="rounded-full px-5 py-2 border-amber-300 bg-white/80 backdrop-blur-sm hover:bg-amber-50 shadow-sm"
          >
            <Crown className="w-4 h-4 mr-2 text-amber-500" />
            <span className="text-sm font-medium">Upgrade your plan</span>
          </Button>
        </Link>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative pt-20 pb-8">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-purple-50 to-pink-100 opacity-70" />
        
        <div className="relative container mx-auto px-4 max-w-5xl">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 bg-clip-text text-transparent">
              What will you print today?
            </h1>
          </motion.div>

          {/* Hero Action Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center gap-2 mb-8"
          >
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-white/70 text-foreground hover:bg-white border border-border'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {/* Central Search Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-6 border border-purple-100/50"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search templates, designs, or start fresh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-base rounded-xl border-muted bg-muted/30 focus:bg-background"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-muted">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button className="rounded-full h-12 w-12 bg-printa-red hover:bg-red-600 shadow-lg">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <motion.button
                  key={category.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted border border-transparent hover:border-border text-sm font-medium transition-all duration-200"
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore Templates Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-8 text-foreground"
          >
            Explore templates
          </motion.h2>

          {/* Template Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group cursor-pointer"
              >
                <Link to="/upload">
                  <div className={`${template.color} rounded-xl p-4 h-32 relative overflow-hidden transition-shadow duration-300 hover:shadow-lg`}>
                    <span className="text-sm font-semibold text-foreground/80">{template.label}</span>
                    <div className="absolute bottom-3 right-3 opacity-30 group-hover:opacity-50 transition-opacity">
                      <template.icon className="w-12 h-12" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll indicator for more templates */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            <Button variant="outline" className="rounded-full px-6 gap-2">
              View all templates
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-8 text-foreground"
          >
            Quick start
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/upload" className="block">
                <div className="bg-gradient-to-br from-printa-red/10 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-printa-red/10">
                  <div className="w-12 h-12 rounded-xl bg-printa-red/10 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-printa-red" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Upload & Print</h3>
                  <p className="text-sm text-muted-foreground">Upload your documents and get them printed quickly</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/print-flow" className="block">
                <div className="bg-gradient-to-br from-purple-100 to-violet-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-100">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Design & Create</h3>
                  <p className="text-sm text-muted-foreground">Create custom designs for any occasion</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Link to="/how-it-works" className="block">
                <div className="bg-gradient-to-br from-teal-100 to-cyan-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-teal-100">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                    <Play className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">How It Works</h3>
                  <p className="text-sm text-muted-foreground">Learn how to get the most out of Printa</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
