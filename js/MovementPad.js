import * as utils from './utils.js'


class MovementPad {
    container
    padElement
    region
    handle
    eventRepeatTimeout
    regionData = {}
    handleData = {}
    mouseDown = false
    mouseStopped = false

    constructor(container) {
        this.container = container
        this.padElement = document.createElement('div')
        this.padElement.classList.add('movement-pad')
        this.region = document.createElement('div')
        this.region.classList.add('region')
        this.handle = document.createElement('div')
        this.handle.classList.add('handle')
        this.region.appendChild(this.handle)
        this.padElement.append(this.region)
        this.container.append(this.padElement)

        // Aligning pad position:
        let canvas = container.getElementsByTagName('canvas')[0]
        this.padElement.style.top = canvas.height + container.getBoundingClientRect().top
                                    - this.region.offsetHeight - 10 + 'px'
        this.padElement.style.left = '20px'

        this.regionData.width = this.region.offsetWidth
        this.regionData.height = this.region.offsetHeight
        this.regionData.position = {
            top: this.region.offsetTop,
            left: this.region.offsetLeft
        }
        this.regionData.offset = utils.getOffset(this.region)
        this.regionData.radius = this.regionData.width / 2
        this.regionData.centerX = this.regionData.position.left + this.regionData.radius
        this.regionData.centerY = this.regionData.position.top + this.regionData.radius

        this.handleData.width = this.handle.offsetWidth
        this.handleData.height = this.handle.offsetHeight
        this.handleData.radius = this.handleData.width / 2

        this.regionData.radius = this.regionData.width / 2 - this.handleData.radius

        // Mouse events:
        this.region.addEventListener('mousedown', (event) => {
            this.mouseDown = true
            this.handle.style.opacity = 1.0
            this.update(event.pageX, event.pageY)
        })

        document.addEventListener('mouseup', () => {
            this.mouseDown = false
            this.resetHandlePosition()
        })

        document.addEventListener('mousemove', (event) => {
            if (!this.mouseDown)
                return
            this.update(event.pageX, event.pageY)
        })

        //Touch events:
        this.region.addEventListener('touchstart', (event) => {
            this.mouseDown = true
            this.handle.style.opacity = 1.0
            this.update(
                event.targetTouches[0].pageX,
                event.targetTouches[0].pageY
            )
        })

        let touchEnd = () => {
            this.mouseDown = false
            this.resetHandlePosition()
        }
        document.addEventListener('touchend', touchEnd)
        document.addEventListener('touchcancel', touchEnd)

        document.addEventListener('touchmove', (event) => {
            if (!this.mouseDown)
                return
            this.update(event.touches[0].pageX, event.touches[0].pageY)
        })

        this.resetHandlePosition()
    }

    update(pageX, pageY) {
        let newLeft = (pageX - this.regionData.offset.left)
        let newTop = (pageY - this.regionData.offset.top)

        // If handle reaches the pad boundaries.
        let distance = Math.pow(this.regionData.centerX - newLeft, 2) + Math.pow(this.regionData.centerY - newTop, 2)
        if (distance > Math.pow(this.regionData.radius, 2)) {
            let angle = Math.atan2((newTop - this.regionData.centerY), (newLeft - this.regionData.centerX))
            newLeft = (Math.cos(angle) * this.regionData.radius) + this.regionData.centerX
            newTop = (Math.sin(angle) * this.regionData.radius) + this.regionData.centerY
        }
        newTop = Math.round(newTop * 10) / 10
        newLeft = Math.round(newLeft * 10) / 10

        this.handle.style.top = newTop - this.handleData.radius + 'px'
        this.handle.style.left = newLeft - this.handleData.radius + 'px'
        // console.log(newTop , newLeft)

        // event and data for handling camera movement
        let deltaX = this.regionData.centerX - parseInt(newLeft)
        let deltaY = this.regionData.centerY - parseInt(newTop)
        // Normalize x,y between -2 to 2 range.
        deltaX = -2 + (2 + 2) * (deltaX - (-this.regionData.radius)) / (this.regionData.radius - (-this.regionData.radius))
        deltaY = -2 + (2 + 2) * (deltaY - (-this.regionData.radius)) / (this.regionData.radius - (-this.regionData.radius))
        deltaX = Math.round(deltaX * 10) / 10
        deltaY = Math.round(deltaY * 10) / 10
        // console.log(deltaX, deltaY)
        this.sendEvent(deltaX, deltaY, 0)
    }

    sendEvent(dx, dy, middle) {
        if (this.eventRepeatTimeout) {
            clearTimeout(this.eventRepeatTimeout)
        }

        if (!this.mouseDown) {
            const stopEvent = new Event('stopMove', {bubbles: false})
            this.padElement.dispatchEvent(stopEvent)
            return
        }

        this.eventRepeatTimeout = setTimeout(() => {
            this.sendEvent(dx, dy, middle)
        }, 5)

        let moveEvent = new CustomEvent('move', {
            bubbles: false,
            detail:{
                'deltaX': dx,
                'deltaY': dy,
                'middle': middle
            }
        })
        this.padElement.dispatchEvent(moveEvent)
    }

    resetHandlePosition() {
        this.handle.style.top = this.regionData.centerY - this.handleData.radius + 'px'
        this.handle.style.left = this.regionData.centerX - this.handleData.radius + 'px'
        this.handle.style.opacity = 0.1
        // this.handle.animate({
        //     top: this.regionData.centerY - this.handleData.radius,
        //     left: this.regionData.centerX - this.handleData.radius,
        //     opacity: 0.1
        // }, "fast")
    }
}


export default MovementPad
