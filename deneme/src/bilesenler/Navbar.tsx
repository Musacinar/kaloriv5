import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Apple, User, PieChart, FileText, LogOut, Dumbbell, Droplets } from 'lucide-react';
import { signOut } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [menuAcik, setMenuAcik] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const menuToggle = () => {
    setMenuAcik(!menuAcik);
  };

  const navLinkleri = [
    {
      text: 'Ana Sayfa',
      path: '/',
      icon: <Apple className="h-5 w-5" />
    },
    {
      text: 'Yemek Girişi',
      path: '/yemek-girisi',
      icon: <FileText className="h-5 w-5" />
    },
    {
      text: 'Yemek Öneri',
      path: '/yemek-oneri',
      icon: <Apple className="h-5 w-5" />
    },
    {
      text: 'İstatistikler',
      path: '/istatistikler',
      icon: <PieChart className="h-5 w-5" />
    },
    {
      text: 'Spor Programı',
      path: '/spor-programi',
      icon: <Dumbbell className="h-5 w-5" />
    },
    {
      text: 'Profil',
      path: '/profil',
      icon: <User className="h-5 w-5" />
    }
  ];

  const aktifLinkSinifi = (path: string) => 
    pathname === path 
      ? 'bg-green-600 text-white' 
      : 'text-green-700 hover:bg-green-100';

  return (
    <nav className="bg-white border-b border-green-200 fixed w-full top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-green-600 text-xl font-bold flex items-center"
              >
                <Apple className="h-7 w-7 mr-2 text-green-500" />
                <span>Kalori Takip</span>
              </Link>
            </div>
            
            {/* Masaüstü menüsü */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {navLinkleri.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${aktifLinkSinifi(link.path)} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ease-in-out`}
                >
                  {link.icon}
                  <span className="ml-2">{link.text}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobil menü butonu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={menuToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-green-600 hover:bg-green-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Menüyü Aç</span>
              {menuAcik ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil menü */}
      <div className={`${menuAcik ? 'block' : 'hidden'} md:hidden bg-white`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinkleri.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${aktifLinkSinifi(link.path)} block px-3 py-2 rounded-md text-base font-medium flex items-center`}
              onClick={() => setMenuAcik(false)}
            >
              {link.icon}
              <span className="ml-2">{link.text}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Çıkış butonu */}
      <div className="absolute right-4 top-4 md:right-8">
        <button
          onClick={async () => {
            await signOut();
            navigate('/giris');
            window.location.reload(); // Sayfayı yenile
          }}
          className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span>Çıkış</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;