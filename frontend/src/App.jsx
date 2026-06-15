import { useState } from 'react'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './App.css'
import AppRoutes from './AppRoutes'

function App() {


  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App