import * as client from './lib/partyline/client.js'

window.user = null

client.create(function(event) {
    client.ws.send(client.createMessage('', 'account-connect'))
})

let toastMessages = [].slice.call(document.querySelectorAll('.toast'))
toastMessages.map(function (message) {
    return new bootstrap.Toast(message)
})

let toastTriggers = [].slice.call(document.querySelectorAll('[data-toast="construction"]'))
toastTriggers.map(function (trigger) {
    trigger.addEventListener('click', function(event) {
        bootstrap.Toast.getInstance(document.querySelector('#pl-construction')).show()
    })
})

window.addEventListener('load', function() {
    window.postMessage({ action: 'window-loaded' }, '*')
})

document.querySelector('#pl-minmax').addEventListener('click', function(event) {
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

document.querySelector('#pl-channel-1').addEventListener('click', function(event) {
    document.querySelector('#pl-channels').classList.add('d-none')
    document.querySelector('#pl-chat').classList.remove('d-none')
})

document.querySelector('#pl-channels-back').addEventListener('click', function(event) {
    document.querySelector('#pl-chat').classList.add('d-none')
    document.querySelector('#pl-channels').classList.remove('d-none')
})

document.querySelector('#pl-chat-window textarea').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        client.ws.send(client.createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})