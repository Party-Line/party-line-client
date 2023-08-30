function message(content) {
    let div = document.createElement('div')
    div.className = 'pl-chat-message row'
    div.innerHTML = content
    
    document.querySelector('#pl-chat-window #pl-chat-output').appendChild(div)
    
    let scrollbar = document.querySelector('#pl-chat-window #pl-chat-scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
    
    document.querySelector('#pl-chat-window textarea').value = ''
    
    window.postMessage({ action: 'window-message' })
}

function users(users) {
    let userList = document.createElement('ul')
    userList.classList.add('list-group', 'list-group-flush')
    
    for (var id in users) {
        let userName = users[id].name
        
        let userItem = document.createElement('li')
        
        userItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 
            'border-bottom', 'border-secondary', 'ps-1', 'ps-2')
        
        if (userName === window.user.name) {
            userItem.innerHTML = '<div class="fw-bold">' + userName + '</div>'
        } else {
            userItem.innerHTML = userName
        }
        
        userList.appendChild(userItem)
    }
    
    document.querySelector('#pl-chat-users').innerHTML = userList.outerHTML
}

export { message, users }