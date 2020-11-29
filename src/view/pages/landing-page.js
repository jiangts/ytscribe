import './styles.scss'

const $ = s => document.querySelector(s)

const fancyText = text => {
  return text.split(' ')
    .map(word => [
      m('span.has-background-primary', word),
      m('span.has-background-warning', ' ')
    ])
}

export default function() {
  let text = ''
  return {
    view() {
      return m(".landing-page.columns", [
        m.n(".column > .box.is-family-monospace", [
          m(".special", {
            onscroll: e => {
              $("textarea").scrollTop = e.target.scrollTop
            },
          }, fancyText(text))
        ]),
        m.n(".column > .box", [
          m("textarea.is-family-monospace", {
            onscroll: e => {
              $(".special").scrollTop = e.target.scrollTop
            },
            oninput: e => {
              console.log(e)
              text = e.target.value
            }
          })
        ])
      ]);
    },
  };
}
