'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface ExtendedSession {
  user: {
    id?: string;
    role?: string;
  } & any;
}

export default function DebugRolesPage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [scopedRole, setScopedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const fetchScopedRole = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching scoped role for user:', session.user.id);
      const response = await fetch('/api/user-roles');
      console.log('API response status:', response.status);
      
      const data = await response.json();
      console.log('API response data:', data);
      
      setApiResponse(data);
      setScopedRole(data.role);
      
      if (!response.ok) {
        setError(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching scoped role:', err);
      setError(`Fetch Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScopedRole();
  }, [session?.user?.id]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Role Debug Information</h1>
      
      <div className="space-y-6">
        {/* Session Information */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {session?.user?.id || 'Not available'}</p>
            <p><strong>User Email:</strong> {session?.user?.email || 'Not available'}</p>
            <p><strong>User Name:</strong> {session?.user?.name || 'Not available'}</p>
            <p><strong>Session Role:</strong> {session?.user?.role || 'Not available'}</p>
            <p><strong>Is Authenticated:</strong> {session ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Scoped Role Information */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Scoped Role Information</h2>
          <div className="space-y-2">
            <p><strong>Scoped Role:</strong> {scopedRole || 'Not assigned'}</p>
            <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            {error && (
              <p className="text-red-600"><strong>Error:</strong> {error}</p>
            )}
          </div>
          
          <button
            onClick={fetchScopedRole}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Scoped Role'}
          </button>
        </div>

        {/* API Response */}
        {apiResponse && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="bg-white p-4 rounded border overflow-auto text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Role Analysis */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Role Analysis</h2>
          <div className="space-y-2">
            <p><strong>Has Session Role:</strong> {session?.user?.role ? 'Yes' : 'No'}</p>
            <p><strong>Has Scoped Role:</strong> {scopedRole ? 'Yes' : 'No'}</p>
            <p><strong>Session Role is Superadmin:</strong> {session?.user?.role === 'superadmin' ? 'Yes' : 'No'}</p>
            <p><strong>Scoped Role is Superadmin:</strong> {scopedRole === 'superadmin' ? 'Yes' : 'No'}</p>
            <p><strong>Should Show System Admin:</strong> {scopedRole === 'superadmin' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Links */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          <div className="space-y-2">
            <a 
              href="/api/user-roles" 
              target="_blank" 
              className="block text-blue-600 hover:underline"
            >
              GET /api/user-roles
            </a>
            <a 
              href="/api/admin/scoped-example" 
              target="_blank" 
              className="block text-blue-600 hover:underline"
            >
              GET /api/admin/scoped-example
            </a>
            <a 
              href="/api/admin/scoped-example" 
              target="_blank" 
              className="block text-blue-600 hover:underline"
            >
              PATCH /api/admin/scoped-example (Role Info)
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check if the user has a record in the <code>userrole</code> table</li>
            <li>Verify the user has an active role in the <code>userrole</code> table</li>
            <li>Check if the <code>scope</code> field is set to 'superadmin'</li>
            <li>Ensure the <code>userId</code> matches the session user ID</li>
            <li>Check browser console for any errors</li>
            <li>Test the API endpoints directly</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 