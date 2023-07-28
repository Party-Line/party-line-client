function message(content) {
    // const nameFind = /(<span class="pl-chat-highlight-name.*?">)(.*?)(<\/span>)/
    // const nameMatches = nameFind.exec(content)
    
    // const nameClass = (nameMatches && nameMatches[2] !== window.user.name) ? ' notme' : ''
    // const nameReplace = '$1<a href="/user/$2" class="user' + nameClass + '">$2</a>$3'
    
    // content = content.replace(nameFind, nameReplace)
    content = '<div class="pl-chat-message-content col">' + content + '</div>'
    
    const date = new Date().toLocaleString()
    const data = '<div class="pl-chat-message-date col d-none d-md-block text-end">' + date + '</div>'
    
    let div = document.createElement('div')
    div.className = 'pl-chat-message row'
    div.innerHTML = content + data
    
    document.querySelector('#pl-chat-window #pl-chat-output').appendChild(div)
    
    let scrollbar = document.querySelector('#pl-chat-window #pl-chat-scrollbar')
    scrollbar.scrollTop = scrollbar.scrollHeight - scrollbar.clientHeight
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