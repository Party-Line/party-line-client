function message(content) {
    let div = document.createElement('div')
    div.className = 'pl-chat-message row'
    div.innerHTML = content
    
    document.querySelector('#pl-chat-window #pl-chat-output').appendChild(div)
    
    let scrollbar = document.querySelector('#pl-chat-window #pl-chat-scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
    
    document.querySelector('#pl-chat-window textarea').value = ''
}

function users(users) {
    let userList = document.createElement('ul')
    
    for (var id in users) {
        let userName = users[id].name
        let userNameClass = (userName !== window.user.name) ? ' notme' : ''
        
        let userItem = document.createElement('li')
        userItem.innerHTML = '<a href="/user/' + userName + '" class="user' + userNameClass + '">' + userName + '</a>'
        
        userList.appendChild(userItem)
    }
    
    // TODO: update the user list
    // document.querySelector('#channel #users').innerHTML = userList.outerHTML
}

export { message, users }