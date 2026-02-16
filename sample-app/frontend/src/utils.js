export const createCookie = (cookieName, cookieValue, hourToExpire) => {
  const date = new Date()
  date.setTime(date.getTime() + hourToExpire * 60 * 60 * 1000)
  document.cookie = `${cookieName} = ${cookieValue}; expires = ${date.toGMTString()}`
}

/** Get cookie value by name (stops at first ';' to avoid sending path/options). */
export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export const deleteCookie = (name) =>
  (document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;')
