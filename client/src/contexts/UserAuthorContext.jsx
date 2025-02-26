import { createContext, useEffect, useState } from 'react'
export const userAuthorContextObj = createContext();

function UserAuthorContext({ children }) {

  let [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: "",
    email: "",
    profileImageUrl: '',
    role: ''
  })


  useEffect(() => {
    const userInStorage = localStorage.getItem('currentuser');
    if (userInStorage) {
      setCurrentUser(JSON.parse(userInStorage))
    }
  }, [])

  return (
    <userAuthorContextObj.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </userAuthorContextObj.Provider>
  )
}

export default UserAuthorContext