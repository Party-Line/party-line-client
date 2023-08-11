import * as client from './lib/partyline/client.js'

window.user = null

client.create((event) => {
    client.ws.send(client.createMessage('', 'account-connect'))
})

let toastMessages = [].slice.call(document.querySelectorAll('.toast'))
toastMessages.map(function (message) {
    return new bootstrap.Toast(message)
})

let toastTriggers = [].slice.call(document.querySelectorAll('[data-toast="construction"]'))
toastTriggers.map(function (trigger) {
    trigger.addEventListener('click', (event) => {
        bootstrap.Toast.getInstance(document.querySelector('#pl-construction')).show()
    })
})

window.addEventListener('load', (event) => {
    // let the extension know the window has loaded
    window.postMessage({ action: 'window-loaded' }, '*')
    
    // get the Discuit cookies for our API calls
    window.postMessage({ action: 'window-cookies' }, '*')
})

window.addEventListener('ext-window-cookies', (event) => {
    console.log(event.type, JSON.parse(sessionStorage.getItem('window-cookies')))
    
    // TODO: get / create the user account and login to chat
    
    // pause for 2 seconds so there is no weird blip when the login is fast
    setTimeout(function() {
        document.querySelector('#pl-login').classList.add('d-none')
        document.querySelector('#pl-head').classList.remove('d-none')
        document.querySelector('#pl-channels').classList.remove('d-none')
        document.querySelector('#pl-foot').classList.remove('d-none')
    }, 2000)
})

document.querySelector('#pl-minmax').addEventListener('click', (event) => {
    /* hiding the chat area looks strange inside of a window
       and so we toggle / minimize the window instead ...
       
       TODO: look into re-enabling this if browsers allow panels again
    if (document.querySelector('#pl-body').style.display == 'none') {
        document.querySelector('#pl-minmax i').classList.remove('fa-caret-up')
        document.querySelector('#pl-minmax i').classList.add('fa-caret-down')
        
        document.querySelector('#pl-body').style.display = ''
        document.querySelector('#pl-head nav').classList.remove('fixed-bottom')
    } else {
        document.querySelector('#pl-minmax i').classList.remove('fa-caret-down')
        document.querySelector('#pl-minmax i').classList.add('fa-caret-up')
        
        document.querySelector('#pl-body').style.display = 'none'
        document.querySelector('#pl-head nav').classList.add('fixed-bottom')
    }
    */
    
    window.postMessage({ action: 'window-toggle' }, '*')
})

document.querySelector('#pl-channel-1').addEventListener('click', (event) => {
    document.querySelector('#pl-channels').classList.add('d-none')
    document.querySelector('#pl-chat').classList.remove('d-none')
})

document.querySelector('#pl-channels-back').addEventListener('click', (event) => {
    document.querySelector('#pl-chat').classList.add('d-none')
    document.querySelector('#pl-channels').classList.remove('d-none')
})

document.querySelector('#pl-chat-window textarea').addEventListener('keydown', (event) => {
    if (event.keyCode == 13) {
        client.ws.send(client.createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})