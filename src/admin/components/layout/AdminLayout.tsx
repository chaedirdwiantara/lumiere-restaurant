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
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6" style={{backgroundColor: 'purple'}}>
          <div className="max-w-7xl mx-auto">
            {console.log('🔥 Rendering children in AdminLayout:', children)}
            <div style={{backgroundColor: 'orange', minHeight: '200px', padding: '20px'}}>
              <p style={{color: 'white'}}>AdminLayout Content Wrapper</p>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;