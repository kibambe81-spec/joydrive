import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, User, MapPin, Phone, Mail, Calendar, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface DriverApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  insuranceDoc: string;
  vehicleRegistration: string;
  vehicleType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  photo: string;
}

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<DriverApplication[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+27123456789',
      licenseNumber: 'DL123456',
      licenseExpiry: '2025-12-31',
      insuranceDoc: 'INS-2024-001',
      vehicleRegistration: 'REG-123456',
      vehicleType: 'Toyota Corolla',
      status: 'pending',
      submittedAt: '2024-03-25',
      photo: 'https://picsum.photos/seed/driver1/200/200'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+27987654321',
      licenseNumber: 'DL789012',
      licenseExpiry: '2026-06-30',
      insuranceDoc: 'INS-2024-002',
      vehicleRegistration: 'REG-789012',
      vehicleType: 'Hyundai i20',
      status: 'approved',
      submittedAt: '2024-03-20',
      photo: 'https://picsum.photos/seed/driver2/200/200'
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState<DriverApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredDrivers = filterStatus === 'all' 
    ? drivers 
    : drivers.filter(d => d.status === filterStatus);

  const handleApprove = (id: string) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    setSelectedDriver(null);
  };

  const handleReject = (id: string) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    setSelectedDriver(null);
  };

  const stats = {
    pending: drivers.filter(d => d.status === 'pending').length,
    approved: drivers.filter(d => d.status === 'approved').length,
    rejected: drivers.filter(d => d.status === 'rejected').length,
    total: drivers.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Driver Management</h1>
          <p className="text-slate-400">Manage and approve driver applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Approved', value: stats.approved, color: 'from-green-500 to-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-red-600' }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-8">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-all',
                filterStatus === status
                  ? 'bg-[#FDB931] text-black'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Drivers Table */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 border-b border-slate-600">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Driver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Vehicle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map(driver => (
                  <tr key={driver.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={driver.photo} alt={driver.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-xs text-slate-400">{driver.licenseNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white flex items-center gap-2"><Mail className="w-4 h-4" />{driver.email}</p>
                        <p className="text-slate-400 flex items-center gap-2"><Phone className="w-4 h-4" />{driver.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white font-medium">{driver.vehicleType}</p>
                        <p className="text-slate-400">{driver.vehicleRegistration}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        driver.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                        driver.status === 'approved' && 'bg-green-500/20 text-green-400',
                        driver.status === 'rejected' && 'bg-red-500/20 text-red-400'
                      )}>
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(driver.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="text-[#FDB931] hover:text-[#f39c12] transition-colors font-medium text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Driver Details</h2>
                <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-6">
                {/* Photo */}
                <div className="flex justify-center">
                  <img src={selectedDriver.photo} alt={selectedDriver.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#FDB931]" />
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedDriver.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Phone</p>
                    <p className="text-white font-semibold">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">License Number</p>
                    <p className="text-white font-semibold">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">License Expiry</p>
                    <p className="text-white font-semibold">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Vehicle</p>
                    <p className="text-white font-semibold">{selectedDriver.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Vehicle Registration</p>
                    <p className="text-white font-semibold">{selectedDriver.vehicleRegistration}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Insurance</p>
                    <p className="text-white font-semibold">{selectedDriver.insuranceDoc}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3 border-t border-slate-700 pt-6">
                  <p className="text-white font-semibold">Documents</p>
                  {[
                    { name: 'License', file: selectedDriver.licenseNumber },
                    { name: 'Insurance', file: selectedDriver.insuranceDoc },
                    { name: 'Vehicle Registration', file: selectedDriver.vehicleRegistration }
                  ].map(doc => (
                    <div key={doc.name} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#FDB931]" />
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-slate-400 text-sm">{doc.file}</p>
                        </div>
                      </div>
                      <button className="text-[#FDB931] hover:text-[#f39c12]">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {selectedDriver.status === 'pending' && (
                  <div className="flex gap-4 border-t border-slate-700 pt-6">
                    <button
                      onClick={() => handleApprove(selectedDriver.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Approve Driver
                    </button>
                    <button
                      onClick={() => handleReject(selectedDriver.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
