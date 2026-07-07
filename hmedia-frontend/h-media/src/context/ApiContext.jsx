import { createContext, useContext } from "react";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  // const baseURL = "https://hmedia-api.channelhmedia.in";
   const baseURL = "http://127.0.0.1:8000";

  return (
    <ApiContext.Provider value={{ baseURL }}>
      {children}
    </ApiContext.Provider>  
  );
}

export function useApi() {
  return useContext(ApiContext);
}

