import React, { createContext, useContext, useState } from 'react';

export const GlobalContext = createContext({});

const GlobalProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuth: false,
  });

  const updateUser = (user) => setState((prev) => ({ ...prev, user }));
  const updateAuth = (isAuth) => setState((prev) => ({...prev, isAuth}));

  return (
    <GlobalContext.Provider value={{ state, updateUser, updateAuth }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalProvider;
