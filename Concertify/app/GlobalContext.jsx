import React, { createContext, useContext, useState } from 'react';

export const GlobalContext = createContext({});

const GlobalProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuth: false,
    activeConcert: null,
    isEmergency: false,
  });

  const updateUser = (user) => setState((prev) => ({ ...prev, user }));
  const updateAuth = (isAuth) => setState((prev) => ({...prev, isAuth}));
  const updateConcert = (activeConcert) => setState((prev) => ({...prev, activeConcert}));
  const updateEm = (isEmergency) => setState((prev) => ({...prev, isEmergency}));

  return (
    <GlobalContext.Provider value={{ state, updateUser, updateAuth, updateConcert, updateEm }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalProvider;
