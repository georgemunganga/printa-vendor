
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Clock, FileText, Settings, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ProfileSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 712 345 678',
    avatar: null,
  };
  
  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2023-05-15',
      items: ['Project Report.pdf', 'Presentation.pptx'],
      status: 'Completed',
      total: '$12.50',
    },
    {
      id: 'ORD-002',
      date: '2023-06-02',
      items: ['Thesis Draft.docx'],
      status: 'Processing',
      total: '$8.75',
    },
    {
      id: 'ORD-003',
      date: '2023-06-10',
      items: ['Family Photos.zip'],
      status: 'Ready for Pickup',
      total: '$15.20',
    },
  ];
  
  // Mock saved locations
  const savedLocations = [
    {
      id: 'loc1',
      name: 'Home',
      address: '123 Residential Lane',
      isDefault: true,
    },
    {
      id: 'loc2',
      name: 'Office',
      address: '456 Business Street',
      isDefault: false,
    },
    {
      id: 'loc3',
      name: 'University',
      address: 'Campus Building B University',
      isDefault: false,
    },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Ready for Pickup':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Profile Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-printa-red text-white text-xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-medium mb-1">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              
              <Button className="text-sm text-printa-red">
                Edit Profile
              </Button>
            </div>
            
            <div className="border-t border-gray-100">
              <ul>
                <li className="border-b border-gray-100 last:border-b-0">
                  <Button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center w-full p-4 text-left transition-colors ${
                      activeTab === 'orders' ? 'bg-red-50 text-printa-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Clock size={18} className="mr-3" />
                    <span>Order History</span>
                  </Button>
                </li>
                <li className="border-b border-gray-100 last:border-b-0">
                  <Button 
                    onClick={() => setActiveTab('documents')}
                    className={`flex items-center w-full p-4 text-left transition-colors ${
                      activeTab === 'documents' ? 'bg-red-50 text-printa-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <FileText size={18} className="mr-3" />
                    <span>Saved Documents</span>
                  </Button>
                </li>
                <li className="border-b border-gray-100 last:border-b-0">
                  <Button 
                    onClick={() => setActiveTab('locations')}
                    className={`flex items-center w-full p-4 text-left transition-colors ${
                      activeTab === 'locations' ? 'bg-red-50 text-printa-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <MapPin size={18} className="mr-3" />
                    <span>Saved Locations</span>
                  </Button>
                </li>
                <li className="border-b border-gray-100 last:border-b-0">
                  <Button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center w-full p-4 text-left transition-colors ${
                      activeTab === 'settings' ? 'bg-red-50 text-printa-red' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Settings size={18} className="mr-3" />
                    <span>Account Settings</span>
                  </Button>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <Button className="flex items-center text-gray-500 hover:text-printa-red transition-colors">
                <LogOut size={18} className="mr-2" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-1 md:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-md">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Order History</h2>
                
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium mr-3">{order.id}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(order.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <div className="text-sm">
                              {order.items.map((item, index) => (
                                <span key={index} className="mr-2">{item}</span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{order.total}</span>
                            <Button className="text-xs text-printa-red mt-2">View Details</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Saved Documents</h2>
                
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">You don't have any saved documents yet</p>
                  <Button className="printa-btn-primary">Upload Documents</Button>
                </div>
              </div>
            )}
            
            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Saved Locations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedLocations.map((location) => (
                    <motion.div 
                      key={location.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-xl relative hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 flex justify-between items-start">
                        <h3 className="font-medium flex items-center">
                          {location.name}
                          {location.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </h3>
                        <Button className="text-gray-400 hover:text-printa-red">
                          <Settings size={16} />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">{location.address}</p>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="p-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center min-h-[120px] hover:border-printa-red transition-colors cursor-pointer"
                  >
                    <MapPin size={24} className="text-gray-400 mb-2" />
                    <p className="text-gray-500">Add New Location</p>
                  </motion.div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            className="printa-input pl-10" 
                            value={user.name} 
                            onChange={() => {}}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={16} className="text-gray-400" />
                          </div>
                          <input 
                            type="email" 
                            className="printa-input pl-10" 
                            value={user.email} 
                            onChange={() => {}}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone size={16} className="text-gray-400" />
                          </div>
                          <input 
                            type="tel" 
                            className="printa-input pl-10" 
                            value={user.phone} 
                            onChange={() => {}}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="printa-btn-primary">Save Changes</Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input 
                          type="password" 
                          className="printa-input" 
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                          type="password" 
                          className="printa-input" 
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="printa-btn-primary">Update Password</Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Order Status Updates</span>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200">
                          <label className="absolute left-0 w-6 h-6 transition duration-100 ease-in-out rounded-full bg-white border-2 border-gray-200 cursor-pointer transform translate-x-6"></label>
                          <input type="checkbox" className="opacity-0 w-0 h-0" defaultChecked />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Promotional Emails</span>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200">
                          <label className="absolute left-0 w-6 h-6 transition duration-100 ease-in-out rounded-full bg-white border-2 border-gray-200 cursor-pointer transform"></label>
                          <input type="checkbox" className="opacity-0 w-0 h-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
