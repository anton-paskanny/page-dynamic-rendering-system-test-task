import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppNav } from './components/AppNav';
import { AccountPageRoute } from './pages/AccountPageRoute';
import { ConstructorPageRoute } from './pages/constructor/ConstructorPageRoute';
import { TOAST_OPTIONS } from './constants/toast';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
      <AppNav />
      <Routes>
        <Route path="/" element={<AccountPageRoute />} />
        <Route path="/constructor" element={<ConstructorPageRoute />} />
      </Routes>
    </>
  );
}
