import { BrowserRouter, Route,Routes } from 'react-router-dom'
import React from 'react'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<div>Home</div>} />
        <Route path='/register' element={<div>Register</div>} />
        <Route path='/login' element={<div>Login</div>} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
