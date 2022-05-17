export const PI_2 = Math.PI / 2

export function getOffset(el) {
    // returns the offset of an element relative to the document
    const rect = el.getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    }
}
