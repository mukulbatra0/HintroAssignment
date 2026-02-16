import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                TaskCollab
              </h1>
              <p className="text-gray-600 mb-8">
                Real-Time Task Collaboration Platform
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✅ Backend structure created</p>
                <p>✅ Frontend structure created</p>
                <p className="font-semibold text-primary-600">
                  Ready for Phase 2: Database Models
                </p>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
