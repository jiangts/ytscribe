import './styles.scss'
import { createPopper } from '@popperjs/core';
import hotkeys from 'hotkeys-js';
import jq from 'jquery'
import _ from 'lodash'


const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const select = (yn, target, tooltip) => {
  $$('.sel').forEach(el => el.classList.remove('sel'))
  $$('.dropdown').forEach(el => el.classList.remove('is-active'))
  if(yn) {
    tooltip.classList.add('is-active')
    target.classList.add('sel')
    createPopper(target, tooltip);
  }
}

const fancyText = text => {
  return text.split(' ')
    .map(word => [
      m('span.region', {
        onclick: e => {
          select(true, e.target, $('.dropdown.word'))
        }
      }, word + ' '),
    ])
}

const saveText = _.throttle(text => localStorage.text = text, 1000)
const updateText = () => {
  const text = $('.special').textContent
  saveText(text)
  $('textarea').value = text
}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string
function trimAny(str, chars) {
  var start = 0,
    end = str.length;

  while(start < end && chars.indexOf(str[start]) >= 0)
    ++start;

  while(end > start && chars.indexOf(str[end - 1]) >= 0)
    --end;

  return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

const clearPunc = w => trimAny(w, ' .,?!')
const addPunc = (punc, nocap) => e => {
  const el = $('.sel')
  el.textContent = clearPunc(el.textContent) + punc + ' '
  if(el.nextSibling) {
    if(nocap) {
      el.nextSibling.textContent = el.nextSibling.textContent[0].toLowerCase() + el.nextSibling.textContent.substr(1)
    } else {
      el.nextSibling.textContent = capitalize(el.nextSibling.textContent)
    }
  }
  updateText()
}

const wordMenu = () => {
  return m("div.dropdown.word", [
    m(".dropdown-menu[role='menu']",
      m("div.dropdown-content", [
        m("a.dropdown-item", {
          onclick: () => {
            const word = $('.sel').textContent
            $$(`.special span`).forEach(el => {
              if(el.textContent === word) {
                el.textContent = capitalize(el.textContent)
              }
            })

            updateText()
          }
        },
          "capitalize all",
          m("span.tag.is-pulled-right", "1")
        ),
        m("a.dropdown-item", {
          onclick: () => {
            const word = $('.sel').textContent
            const spelling = prompt('new spelling').trim() + ' '
            $$(`.special span`).forEach(el => {
              if(el.textContent === word) {
                el.textContent = spelling
              }
            })

            updateText()
          }
        },
          "spell all",
          m("span.tag.is-pulled-right", "2")
        ),
        m("a.dropdown-item", {
          onclick: () => {
            const word = $('.sel').textContent
            $$(`.special span`).forEach(el => {
              if(el.textContent === word) {
                el.remove()
              }
            })

            updateText()
          }
        },
          "delete all",
          m("span.tag.is-pulled-right", "9")
        ),
        m("hr.dropdown-divider"),
        m("a.dropdown-item", { onclick: addPunc(',', true) },
          ",",
          m("span.tag.is-pulled-right", "z")
        ),
        m("a.dropdown-item", { onclick: addPunc('.') },
          ".",
          m("span.tag.is-pulled-right", "x")
        ),
        m("a.dropdown-item", { onclick: addPunc('?') },
          "?",
          m("span.tag.is-pulled-right", "c")
        ),
        m("a.dropdown-item", { onclick: addPunc('!') },
          "!",
          m("span.tag.is-pulled-right", "v")
        ),
        m("a.dropdown-item", { onclick: addPunc('', true) },
          "clear punctuation",
          m("span.tag.is-pulled-right", "b")
        ),
        m("hr.dropdown-divider"),
        m("a.dropdown-item[href='#']", {
          onclick: () => select(false)
        }, "Cancel",
          m("span.tag.is-pulled-right", "esc")
        )
      ])
    )
  ])
}

const handleKey = hk => {
  hotkeys(hk, function(event, handler){
    event.preventDefault()
    jq(`.dropdown.is-active .tag:contains('${hk}')`).click()
  });
}

[1, 2, 3, 4, 9, 'z', 'x', 'c', 'v', 'b', 'esc']
  .forEach(hk => handleKey(hk+''))

hotkeys('esc', function(event, handler){
  event.preventDefault()
  $$('.sel').forEach(el => el.classList.remove('sel'))
});


export default function() {
  // let text = ''
  let text = localStorage.text || ''

  addEventListener('click', e => {
    if($('.dropdown.is-active') && !e.target.closest('.dropdown')) {
      $$('.dropdown').forEach(d => {
        d.classList.remove('is-active')
      })
    }
  }, true)

  return {
    view() {
      return m(".landing-page.columns", [
        m.n(".column > .box.is-family-monospace", [
          m(".special", {
            onscroll: e => {
              $("textarea").scrollTop = e.target.scrollTop
            },
          }, fancyText(text)),
          wordMenu()
        ]),
        m.n(".column > .box", [
          m("textarea.is-family-monospace", {
            defaultValue: text,
            onscroll: e => {
              $(".special").scrollTop = e.target.scrollTop
            },
            oninput: e => {
              text = e.target.value
              saveText(text)
            }
          })
        ])
      ]);
    },
  };
}
