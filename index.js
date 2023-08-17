import * as client from './lib/partyline/client.js'

window.user = null

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
    
    // check if the extension has loaded and login
    extLoading()
})

function extLoading() {
    // has the extension loaded
    window.postMessage({ action: 'ext-loaded', get: true })
}

window.addEventListener('ext-loaded', (event) => {
    let extLoaded = sessionStorage.getItem('ext-loaded')
    
    if (extLoaded) {
        // get the extension's data
        window.postMessage({ action: 'ext-data' }, '*')
    } else {
        setTimeout(extLoading, 250)
    }
})

window.addEventListener('ext-data', (event) => {
    let extDataJSON = sessionStorage.getItem('ext-data')
    
    if (extDataJSON !== null) {
        let extData = JSON.parse(extDataJSON)
        
        // create the web socket connection
        client.create((event) => {
            // login and get a JSON web token
            client.ws.send(client.createMessage(extData.username, 'account-login', function(message) {
                switch (message.type) {
                    case 'success' :
                        // verify the SID before using the token
                        window.postMessage({
                            action: 'window-verify',
                            data: {
                                sid: extData.sid,
                                username: extData.username,
                                jwt: message.content
                            }
                        })
                        
                        break
                    default :
                        // TODO: display an error
                }
            }))
        })
    }
})

window.addEventListener('window-verify', (event) => {
    let verify = sessionStorage.getItem('window-verify')
    
    if (verify) {
        // connect to the chat
        client.ws.send(client.createMessage('', 'account-connect'))
    } else {
        // TODO: display an error
    }
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