;(function () {
  const Theme = Object.freeze({
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system',
  })

  const saved = localStorage.getItem('theme')
  const element = document.documentElement
  if (saved === Theme.DARK) {
    element.classList.add(Theme.DARK)
  } else if (saved === Theme.LIGHT) {
    element.classList.add(Theme.LIGHT)
  }

  document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('[data-theme]')
    const active = saved ?? Theme.SYSTEM

    buttons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.theme === active)
      button.addEventListener('click', function () {
        const theme = button.dataset.theme
        element.classList.remove(Theme.DARK, Theme.LIGHT)
        if (theme !== Theme.SYSTEM) {
          element.classList.add(theme)
          localStorage.setItem('theme', theme)
        } else {
          localStorage.removeItem('theme')
        }
        buttons.forEach(function (button) {
          button.classList.toggle('active', button.dataset.theme === theme)
        })
      })
    })
  })
})()
