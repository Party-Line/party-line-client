import * as client from './lib/partyline/client.js'

window.user = null
window.extScriptTimer = null

/** STARTUP PROCESS **/

// the window has loaded
window.addEventListener('load', (event) => {
    // has the extension's script loaded
    window.extScript()
})

// loop until the extension's script has loaded
window.extScript = function () {
    // this message will be ignored until the script has loaded
    window.postMessage({ action: 'ext-script', get: true })
    
    extScriptTimer = setTimeout(extScript, 250)
}

// get the extension's script result
window.addEventListener('ext-script', (event) => {
    // no need to check for the value in session storage
    // any kind of response means the script has loaded
     
    clearTimeout(extScriptTimer)
    
    // let the extension know the window has loaded
    window.postMessage({ action: 'window-loaded' })
    
    // has the extension's data loaded
    window.extLoaded()
})

// loop until the extension's data has loaded
window.extLoaded = function () {
    // has the extension's data loaded
    window.postMessage({ action: 'ext-loaded', get: true })
}

// get the extension's loaded result
window.addEventListener('ext-loaded', (event) => {
    let extLoaded = sessionStorage.getItem('ext-loaded')
    
    if (extLoaded === 'true') {
        // get the extension's data
        window.postMessage({ action: 'ext-data' })
    } else {
        // not loaded and so try again
        setTimeout(extLoaded, 250)
    }
})

// load the extension's data and login
window.addEventListener('ext-data', (event) => {
    let extDataJSON = sessionStorage.getItem('ext-data')
    
    if (extDataJSON !== null) {
        let extData = JSON.parse(extDataJSON)
        
        // verify we are logged into Discuit
        if (extData && extData.sid && extData.username) {
            // create the web socket connection
            client.create((event) => {
                let user = {
                    username: extData.username,
                    timezone: new Date().getTimezoneOffset()
                }
                
                // login and get a JSON web token
                // TODO: require the client to have a secret / public key
                client.ws.send(client.createMessage(user, 'account-login', function(message) {
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

// the JWT token has been set
window.addEventListener('window-verify', (event) => {
    let verify = sessionStorage.getItem('window-verify')
    
    if (verify === 'true') {
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

// reload the extension's data and login again
window.retry = function () {
    document.querySelector('#pl-login').classList.remove('d-none')
    document.querySelector('#pl-error').classList.add('d-none')
    
    window.extLoaded()
}

// minimize the window when we lose focus
window.addEventListener('blur', (event) => {
    // TODO: make this configurable
    // if (document.querySelector('#pl-body').style.display != 'none') {
    //     document.querySelector('#pl-minmax').click()
    // }
})

// reset the "new message" icon when we gain focus
window.addEventListener('focus', (event) => {
    window.postMessage({ action: 'window-message', value: false })
})

/** CHAT WINDOW **/

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

document.querySelector('#pl-minmax').addEventListener('click', (event) => {
    if (document.querySelector('#pl-body').style.display == 'none') {
        window.postMessage({ action: 'window-display', value: 'maximize' })
        
        document.querySelector('#pl-minmax i').classList.remove('fa-caret-up')
        document.querySelector('#pl-minmax i').classList.add('fa-caret-down')
        
        document.querySelector('#pl-body').style.display = ''
        document.querySelector('#pl-head nav').classList.remove('fixed-bottom')
    } else {
        window.postMessage({ action: 'window-display', value: 'minimize' })
        
        document.querySelector('#pl-minmax i').classList.remove('fa-caret-down')
        document.querySelector('#pl-minmax i').classList.add('fa-caret-up')
        
        document.querySelector('#pl-body').style.display = 'none'
        document.querySelector('#pl-head nav').classList.add('fixed-bottom')
    }
})

document.querySelector('#pl-close').addEventListener('click', (event) => {
    //sessionStorage.clear()
    
    window.postMessage({ action: 'window-display', value: 'close' })
})

document.querySelector('#pl-channel-1').addEventListener('click', (event) => {
    document.querySelector('#pl-channels').classList.add('d-none')
    document.querySelector('#pl-chat').classList.remove('d-none')
    
    let scrollbar = document.querySelector('#pl-chat-window #pl-chat-scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
})

document.querySelector('#pl-channel-1-users').addEventListener('click', (event) => {
    if (document.querySelector('#pl-chat-users').classList.contains('d-none')) {
        document.querySelector('#pl-chat-window').classList.add('d-none')
        document.querySelector('#pl-chat-users').classList.remove('d-none')
        
        document.querySelector('#pl-channel-1-users i').classList.add('fa-comments')
        document.querySelector('#pl-channel-1-users i').classList.remove('fa-users')
    } else {
        document.querySelector('#pl-chat-users').classList.add('d-none')
        document.querySelector('#pl-chat-window').classList.remove('d-none')
        
        document.querySelector('#pl-channel-1-users i').classList.add('fa-users')
        document.querySelector('#pl-channel-1-users i').classList.remove('fa-comments')
    }
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