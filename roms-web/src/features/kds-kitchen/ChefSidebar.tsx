import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Archive,
  LineChart,
  Users,
  Settings,
  Lock,
  ChefHat,
} from 'lucide-react';

export const ChefSidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/kitchen', icon: LayoutDashboard, exact: true },
    { label: 'Kitchen Queue', path: '/kitchen/queue', icon: Layers },
    { label: 'Menu Management', path: '/kitchen/menu', icon: UtensilsCrossed },
    { label: 'Inventory', path: '/kitchen/inventory', icon: Archive },
    { label: 'AI Analytics', path: '/kitchen/analytics', icon: LineChart },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 select-none shrink-0 h-screen">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-amber-900">
            Flavoro
          </span>
        </div>

        {/* Operations Group */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
            Operations
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Administration Group (Locked) */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
            Administration
          </p>
          <nav className="space-y-1">
            <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Staff Management</span>
              </div>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>System Config</span>
              </div>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80"
          alt="Executive Chef"
          className="w-10 h-10 rounded-full object-cover border border-slate-200"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-semibold text-slate-800 truncate leading-tight">Chef One</h4>
          <p className="text-xs text-slate-400 truncate">Executive Chef</p>
        </div>
      </div>
    </aside>
  );
};

export default ChefSidebar;