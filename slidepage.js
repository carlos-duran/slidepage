(function () {
  const Hammer = window.Hammer
  const Element = window.Element
  const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend'

  // Utilities
  const U = {
    on (el, ev, fn) {
      ev.split(' ').filter(_ => _).forEach(e => el.addEventListener(e, fn))
    },
    addClass (el, ...cls) {
      el.classList.add(...cls.join(' ').split(' ').filter(_ => _))
    },
    removeClass (el, ...cls) {
      el.classList.remove(...cls.join(' ').split(' ').filter(_ => _))
    }
  }

  function addSwipeListener (el, fn) {
    var hammer = new Hammer(el)
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    hammer.on('swipeup', () => fn('up'))
    hammer.on('swipedown', () => fn('down'))
    hammer.on('swipeleft', () => fn('left'))
    hammer.on('swiperight', () => fn('right'))
  }

  // Default opts
  const slideOpts = {
    selector: '.slide',
    class: 'animated',
    animation: {
      enter: ['slideInDown', 'slideInUp'],
      leave: ['slideOutDown', 'slideOutUp']
    }
  }

  class SlidePage {
    constructor (el, opts = {}) {
      el = getElement(el)
      if (!validate(el, opts)) {
        return
      }

      this._active = 0
      this._before = 0
      this._direction = null
      this._sliding = false

      this.el = el
      this.opts = Object.assign({}, slideOpts, opts)

      this._initSlides()
      this._addListeners()
      this.created()
    }

    get active () {
      return this._active
    }

    set active (next) {
      var stop = this.beforeChange(this._active, next)
      stop = typeof stop === 'boolean' ? !stop : false
      if (stop) return
      this._before = this._active
      this._active = next
      this._doSlide()
      this.change(this._active, this._before)
    }

    get enterClass () {
      return this.opts.animation.enter[this._direction ? 1 : 0]
    }

    get leaveClass () {
      return this.opts.animation.leave[this._direction ? 1 : 0]
    }

    _initSlides () {
      this.slides = [...this.el.querySelectorAll(this.opts.selector)]
      this.slides.forEach((slide, i) => {
        U.addClass(slide, this.opts.class)
        if (i !== this.active) slide.setAttribute('hidden', '')
      })
    }

    _addListeners () {
      this.el.addEventListener('wheel', e => {
        if (e.deltaY > 0) this.next()
        else this.previous()
      })

      addSwipeListener(this.el, dir => {
        if (dir === 'down') this.next()
        else if (dir === 'up') this.previous()
      })

      this.slides.forEach((slide, i) => {
        U.on(slide, animationEnd, this._onAnimationsEnd.bind(this))
      })
    }

    _onAnimationsEnd () {
      if (!this._sliding) return
      this._sliding = false
      var anims = this.opts.animation
      this.slides[this._before].setAttribute('hidden', '')
      U.removeClass(this.slides[this._before], ...anims.leave)
      U.removeClass(this.slides[this._active], ...anims.enter)
      this.changed(this.active, this._before)
    }

    _doSlide () {
      this._sliding = true
      this._direction = this._active > this._before
      U.addClass(this.slides[this._before], this.leaveClass)
      U.addClass(this.slides[this._active], this.enterClass)
      this.slides[this._active].removeAttribute('hidden')
    }

    show (i) {
      if (!this._sliding && this.active !== i && i >= 0 && i < this.slides.length) {
        this.active = i
      }
    }

    previous () {
      this.show(this.active - 1)
    }

    next () {
      this.show(this.active + 1)
    }

    // Hooks
    created () {}
    beforeChange () {}
    change () {}
    changed () {}
  }

  function getElement (el) {
    try {
      if (el instanceof Element) return el
      if (el instanceof Element) return el
      return document.querySelector(el)
    } catch (e) {
      return null
    }
  }

  function validate (el, opts) {
    var errors = []
    if (!(el instanceof Element)) {
      errors.push('First parameter should be an Element')
    }
    if (typeof opts !== 'object') {
      errors.push('Second parameter should be an object')
    }
    if (errors.length) {
      errors.forEach(e => console.error('[SlidePage] ' + e))
      return false
    }
    return true
  }

  window.SlidePage = SlidePage
})()
