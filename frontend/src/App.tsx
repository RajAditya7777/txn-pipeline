import React from 'react';
import { Dashboard } from './pages/Dashboard';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
