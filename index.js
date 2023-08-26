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

window.retry = function () {
    document.querySelector('#pl-login').classList.remove('d-none')
    document.querySelector('#pl-error').classList.add('d-none')
    
    window.extLoading()
}

window.extLoading = function () {
    // has the extension loaded
    window.postMessage({ action: 'ext-loaded', get: true })
}

window.addEventListener('load', (event) => {
    // let the extension know the window has loaded
    window.postMessage({ action: 'window-loaded' }, '*')
    
    // check if the extension has loaded and login
    window.extLoading()
})

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
        
        // verify we are logged in and have some data
        if (extData && extData.sid && extData.username) {
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
                            document.querySelector('#pl-error-title').innerHTML = 'Login Error'
                            document.querySelector('#pl-error-body').innerHTML = 'Please close the window and try again.<br>' + message.content
                            
                            document.querySelector('#pl-login').classList.add('d-none')
                            document.querySelector('#pl-error').classList.remove('d-none')
                    }
                }))
            })
        } else {
            document.querySelector('#pl-error-title').innerHTML = 'Not Logged In'
            document.querySelector('#pl-error-body').innerHTML = 'You are not logged into Discuit.<br>Please login and try again.'

            document.querySelector('#pl-login').classList.add('d-none')
            document.querySelector('#pl-error').classList.remove('d-none')
        }
    } else {
        document.querySelector('#pl-error-title').innerHTML = 'Not Logged In'
        document.querySelector('#pl-error-body').innerHTML = 'You are not logged into Discuit.<br>Please login and try again.'
        
        document.querySelector('#pl-login').classList.add('d-none')
        document.querySelector('#pl-error').classList.remove('d-none')
    }
})

window.addEventListener('window-verify', (event) => {
    let verify = sessionStorage.getItem('window-verify')
    
    if (verify) {
        // connect to the chat
        client.ws.send(client.createMessage('', 'account-connect', function(message) {
        switch (message.type) {
            case 'error' :
                document.querySelector('#pl-error-title').innerHTML = 'Token Error'
                document.querySelector('#pl-error-body').innerHTML = 'Please close the window and try again.<br>' + message.content
                
                document.querySelector('#pl-login').classList.add('d-none')
                document.querySelector('#pl-error').classList.remove('d-none')
        }
    }))
    } else {
        document.querySelector('#pl-error-title').innerHTML = 'Token Error'
        document.querySelector('#pl-error-body').innerHTML = 'Please close the window and try again.'
        
        document.querySelector('#pl-login').classList.add('d-none')
        document.querySelector('#pl-error').classList.remove('d-none')
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
    
    let scrollbar = document.querySelector('#pl-chat-window #pl-chat-scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
})

document.querySelector('#pl-channels-back').addEventListener('click', (event) => {
    document.querySelector('#pl-chat').classList.add('d-none')
    document.querySelector('#pl-channels').classList.remove('d-none')
})

document.querySelector('#pl-chat-window textarea').addEventListener('keydown', (event) => {
    if (event.keyCode == 13 && !event.shiftKey) {
        client.ws.send(client.createMessage(event.target.value, 'channel-message'))
        
        event.target.select()
        event.preventDefault()
    }
})