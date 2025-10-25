import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Home, 
  AlertTriangle, 
  Package, 
  Shield, 
  BarChart3, 
  Users,
  MapPin,
  Settings, 
  LogOut,
  Bell,
  Menu,
  X,
  
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const allNavigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'ngo', 'emergency_responder', 'community_leader', 'donor', 'researcher', 'farmer'] },
  { name: 'Disasters', href: '/disasters', icon: AlertTriangle, roles: ['admin', 'ngo', 'emergency_responder', 'community_leader', 'farmer'] },
  { name: 'Food Security', href: '/food', icon: Package, roles: ['admin', 'ngo', 'community_leader', 'donor', 'farmer'] },
  // Food Donations feature temporarily disabled
  // { name: 'Food Donations', href: '/food-donations', icon: Heart, roles: ['admin', 'ngo', 'emergency_responder', 'farmer'] },
  { name: 'Vulnerability', href: '/vulnerability', icon: Shield, roles: ['admin', 'ngo', 'emergency_responder', 'researcher'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'researcher', 'ngo'] },
  { name: 'Coordination', href: '/coordination', icon: Users, roles: ['admin', 'ngo', 'emergency_responder'] },
  { name: 'Interactive Maps', href: '/maps', icon: MapPin, roles: ['admin', 'ngo', 'emergency_responder', 'community_leader', 'donor', 'researcher', 'farmer'] },
];

const getNavigationForRole = (userRole: string) => {
  return allNavigationItems.filter(item => item.roles.includes(userRole));
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const [user, setUser] = React.useState<any>(null);
  
  const { state: notificationState } = useNotifications();

  React.useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        console.log('Layout: Stored user string:', storedUser);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Layout: Parsed user:', parsedUser);
          if (mounted) setUser(parsedUser);
          return;
        }

        // If there's no stored user but an access token exists, try to fetch the user profile
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            // Use the app's axios helper which is configured with the API base URL
            const { authAPI } = await import('../lib/api');
            const profile = await authAPI.getCurrentUser();
            if (profile) {
              localStorage.setItem('user', JSON.stringify(profile));
              if (mounted) setUser(profile);
              return;
            }
            // If token invalid, remove it so ProtectedRoute will redirect to login
            localStorage.removeItem('access_token');
          } catch (err) {
            console.warn('Layout: Failed to fetch profile with token', err);
          }
        }

        console.log('Layout: No user in localStorage and no valid token/profile');
      } catch (error) {
        console.error('Layout: Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    };

    loadUser();
    return () => { mounted = false; };
  }, []);

  

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (!user) {
    console.log('Layout: No user found, checking localStorage...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <img src="/allsecure-icon.svg" alt="FOOD & DISASTER MANGEMENT" className="w-6 h-6" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">FOOD & DISASTER MANGEMENT</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-3 space-y-1">
            {getNavigationForRole(user?.role || 'community_leader').map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 px-3">
            <div className="space-y-1">
              <Link
                to="/settings"
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <Settings className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Sign out
              </button>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || user?.email || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.replace('_', ' ').toUpperCase() || 'USER'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 lg:ml-0">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {location.pathname.slice(1) || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => console.log('Bell clicked - notification center temporarily disabled')}
                className="relative p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notificationState.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notificationState.unreadCount > 9 ? '9+' : notificationState.unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Notification Center - Temporarily disabled for debugging */}
      {/* <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      /> */}
      {/* Debug overlay removed in production UI */}
    </div>
  );
};

export default Layout;

// Attach debug overlay to window so it's visible without changing structure
// We place it into the DOM by rendering inside the main Layout return.