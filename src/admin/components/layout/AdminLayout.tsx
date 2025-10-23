import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  console.log('🔥 AdminLayout rendered with children:', children);
  console.log('🔥 AdminLayout children type:', typeof children);
  console.log('🔥 AdminLayout children React element?', React.isValidElement(children));
  
  return (
    <div className="flex h-screen bg-gray-950" style={{backgroundColor: 'green', minHeight: '100vh'}}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;